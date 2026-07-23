import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/shared/lib/supabaseServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
    const supabase = await createServerSupabase();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL));
    }

    const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: session.user.email!,
        line_items: [
            {
                price: process.env.STRIPE_PRICE_ID!,
                quantity: 1,
            },
        ],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/library?success=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/books?canceled=1`,
        metadata: {
            user_id: session.user.id,
        },
    });

    return NextResponse.redirect(checkoutSession.url!);
}