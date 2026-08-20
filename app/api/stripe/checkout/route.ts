import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-07-29.dahlia" as const,
});

interface CheckoutRequest {
    userId: string;
    bookId: string;
    amount: number; // в минимальных единицах валюты, например центы
    currency: string; // "usd", "eur" и т.д.
    bookTitle: string;
}

export async function POST(request: NextRequest) {
    try {
        const { userId, bookId, amount, currency, bookTitle } =
            (await request.json()) as CheckoutRequest;

        if (!userId || !bookId || !amount || !currency) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mia-law.ru";

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: bookTitle,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
                bookId,
            },
            success_url: `${baseUrl}/library?payment=success`,
            cancel_url: `${baseUrl}/library?payment=cancelled`,
        });

        return NextResponse.json({ success: true, checkoutUrl: session.url });
    } catch (err) {
        console.error("Stripe checkout error:", err);
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
}