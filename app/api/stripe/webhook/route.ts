import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type StripeInvoice = Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
};

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("Webhook signature verification failed", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { data: existingEvent } = await supabaseAdmin
        .from("processed_webhook_events")
        .select("id")
        .eq("id", event.id)
        .maybeSingle();

    if (existingEvent) {
        return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.user_id;
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            if (userId && subscriptionId) {
                await supabaseAdmin.from("subscriptions").upsert(
                    {
                        user_id: userId,
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        status: "active",
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id" }
                );
            }
            break;
        }

        case "invoice.paid": {
            const invoice = event.data.object as StripeInvoice;

            let subscriptionId: string | null = null;

            if (invoice.subscription) {
                if (typeof invoice.subscription === "string") {
                    subscriptionId = invoice.subscription;
                } else if (
                    typeof invoice.subscription === "object" &&
                    "id" in invoice.subscription
                ) {
                    subscriptionId = invoice.subscription.id;
                }
            }

            if (subscriptionId) {
                await supabaseAdmin
                    .from("subscriptions")
                    .update({
                        status: "active",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("stripe_subscription_id", subscriptionId);
            }
            break;
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;

            await supabaseAdmin
                .from("subscriptions")
                .update({
                    status: "canceled",
                    updated_at: new Date().toISOString(),
                })
                .eq("stripe_subscription_id", subscription.id);
            break;
        }

        default:
            break;
    }

    await supabaseAdmin
        .from("processed_webhook_events")
        .insert({ id: event.id, type: event.type });

    return NextResponse.json({ received: true });
}