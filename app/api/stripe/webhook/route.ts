import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-07-29.dahlia" as const,
});

export async function POST(request: NextRequest) {
    const body = await request.text(); // raw body обязателен для проверки подписи
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("Stripe signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            const userId = session.metadata?.userId;
            const bookId = session.metadata?.bookId;

            if (!userId || !bookId) {
                console.error("Missing metadata in Stripe session", session.id);
                return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
            }

            const supabase = await createServerSupabase();

            // Идемпотентность — используем event.id как уникальный ключ
            const idempotencyId = `stripe:${event.id}`;

            const { data: existing } = await supabase
                .from("processed_webhook_events")
                .select("id")
                .eq("id", idempotencyId)
                .maybeSingle();

            if (existing) {
                return NextResponse.json({ success: true, alreadyProcessed: true });
            }

            const { error: purchaseError } = await supabase.from("purchases").insert({
                user_id: userId,
                book_id: bookId,
            });

            if (purchaseError) throw purchaseError;

            await supabase.from("processed_webhook_events").insert({
                id: idempotencyId,
                type: "stripe.checkout.session.completed",
                processed_at: new Date().toISOString(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Stripe webhook processing error:", err);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}