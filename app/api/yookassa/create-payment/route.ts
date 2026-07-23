import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PaymentRequest {
    userId: string
    plan: "basic" | "premium" | "vip"
    bookId?: string
}

const PLAN_PRICES: Record<string, number> = {
    basic: 20000, // 200₽ в копейках
    premium: 50000, // 500₽
    vip: 150000, // 1500₽
}

const PLAN_DESCRIPTIONS: Record<string, string> = {
    basic: "Подписка базовая",
    premium: "Подписка премиум",
    vip: "Подписка VIP",
}

export async function POST(req: NextRequest) {
    try {
        const { userId, plan, bookId }: PaymentRequest = await req.json()

        if (!userId || !plan) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const price = PLAN_PRICES[plan]
        if (!price) {
            return NextResponse.json(
                { error: "Invalid plan" },
                { status: 400 }
            )
        }

        // Создаём платёж через YooKassa API
        const paymentResponse = await fetch(
            "https://api.yookassa.ru/v3/payments",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(
                        `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
                    ).toString("base64")}`,
                    "Idempotency-Key": `${userId}-${plan}-${Date.now()}`,
                },
                body: JSON.stringify({
                    amount: {
                        value: (price / 100).toFixed(2),
                        currency: "RUB",
                    },
                    confirmation: {
                        type: "redirect",
                        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
                    },
                    capture: true,
                    description: PLAN_DESCRIPTIONS[plan],
                    metadata: {
                        user_id: userId,
                        plan: plan,
                        book_id: bookId || null,
                    },
                }),
            }
        )

        const paymentData = await paymentResponse.json()

        if (!paymentResponse.ok) {
            console.error("YooKassa error:", paymentData)
            return NextResponse.json(
                { error: "Payment creation failed" },
                { status: 400 }
            )
        }

        return NextResponse.json({
            confirmationUrl: paymentData.confirmation.confirmation_url,
            paymentId: paymentData.id,
        })

    } catch (error) {
        console.error("Error creating payment:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}