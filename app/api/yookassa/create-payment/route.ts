import { NextRequest, NextResponse } from "next/server"

interface PaymentRequest {
    userId: string
    amount: number
    bookId: string
}

export async function POST(request: NextRequest) {
    try {
        const { userId, amount, bookId } = (await request.json()) as PaymentRequest

        if (!userId || !amount || !bookId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const shopId = process.env.YOOKASSA_SHOP_ID
        const secretKey = process.env.YOOKASSA_SECRET_KEY
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mia-law.ru"

        if (!shopId || !secretKey) {
            return NextResponse.json({ error: "Yookassa not configured" }, { status: 500 })
        }

        const idempotenceKey = crypto.randomUUID()

        const response = await fetch("https://api.yookassa.ru/v3/payments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Idempotence-Key": idempotenceKey,
                Authorization: "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
            },
            body: JSON.stringify({
                amount: {
                    value: amount.toFixed(2),
                    currency: "RUB",
                },
                confirmation: {
                    type: "redirect",
                    return_url: `${baseUrl}/library`,
                },
                capture: true,
                description: `Покупка книги ${bookId}`,
                metadata: {
                    userId,
                    bookId,
                },
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error("Yookassa create-payment error:", data)
            return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            confirmationUrl: data.confirmation?.confirmation_url,
            paymentId: data.id,
        })
    } catch (err) {
        console.error("create-payment error:", err)
        return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
    }
}