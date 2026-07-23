import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface YooKassaPayment {
    type: string
    event: string
    object: {
        id: string
        status: string
        amount: {
            value: string
            currency: string
        }
        metadata?: {
            user_id: string
            plan: string
            book_id?: string
        }
        created_at: string
    }
}

// Проверка подписи YooKassa
function verifyYooKassaSignature(body: string, signature: string): boolean {
    const shopId = process.env.YOOKASSA_SHOP_ID!
    const secretKey = process.env.YOOKASSA_SECRET_KEY!

    const data = `${body}${secretKey}`
    const hash = crypto
        .createHash("sha256")
        .update(data)
        .digest("base64")

    return hash === signature
}

export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = req.headers.get("X-Yookassa-Signature")

    if (!signature || !verifyYooKassaSignature(body, signature)) {
        console.error("YooKassa signature verification failed")
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 400 }
        )
    }

    let event: YooKassaPayment

    try {
        event = JSON.parse(body)
    } catch (err) {
        console.error("Failed to parse YooKassa webhook", err)
        return NextResponse.json(
            { error: "Invalid JSON" },
            { status: 400 }
        )
    }

    // Проверка на дубликат
    const { data: existingEvent } = await supabaseAdmin
        .from("processed_webhook_events")
        .select("id")
        .eq("id", event.object.id)
        .maybeSingle()

    if (existingEvent) {
        return NextResponse.json({ received: true, duplicate: true })
    }

    try {
        // Успешный платёж
        if (event.event === "payment.succeeded") {
            const payment = event.object
            const userId = payment.metadata?.user_id
            const plan = payment.metadata?.plan || "basic"

            if (userId && payment.status === "succeeded") {
                // Определяем дату окончания подписки
                const currentDate = new Date()
                const endDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    currentDate.getDate()
                )

                // Вставляем/обновляем подписку
                const { error: subscriptionError } = await supabaseAdmin
                    .from("subscriptions")
                    .upsert(
                        {
                            user_id: userId,
                            yookassa_payment_id: payment.id,
                            status: "active",
                            plan: plan,
                            current_period_end: endDate.toISOString(),
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: "user_id" }
                    )

                if (subscriptionError) {
                    console.error("Error updating subscription:", subscriptionError)
                }

                // Логируем платёж
                await supabaseAdmin
                    .from("payment_logs")
                    .insert({
                        user_id: userId,
                        yookassa_payment_id: payment.id,
                        amount: parseFloat(payment.amount.value),
                        currency: payment.amount.currency,
                        plan: plan,
                        status: "succeeded",
                    })
            }
        }

        // Отмена подписки
        if (event.event === "payment.canceled") {
            const payment = event.object
            const userId = payment.metadata?.user_id

            if (userId) {
                await supabaseAdmin
                    .from("subscriptions")
                    .update({
                        status: "canceled",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("user_id", userId)
            }
        }

        // Логируем обработанное событие
        await supabaseAdmin
            .from("processed_webhook_events")
            .insert({
                id: event.object.id,
                type: event.event,
                processed_at: new Date().toISOString(),
            })

    } catch (error) {
        console.error("Error processing YooKassa webhook:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }

    return NextResponse.json({ received: true })
}