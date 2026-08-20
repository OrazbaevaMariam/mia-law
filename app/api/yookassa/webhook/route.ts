import { NextResponse, NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

async function verifyPaymentWithYookassa(paymentId: string) {
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
        console.error("Yookassa credentials not configured");
        return null;
    }

    const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
        method: "GET",
        headers: {
            Authorization: "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
        },
    });

    if (!response.ok) {
        console.error("Yookassa verify failed", response.status, await response.text());
        return null;
    }

    return response.json();
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { notification_type, object } = body;

        if (notification_type !== "payment.succeeded" || !object?.id) {
            // Не ошибка — просто игнорируем нерелевантные уведомления
            return NextResponse.json({ success: true });
        }

        // Единственная надёжная проверка: спрашиваем сам Yookassa о статусе платежа
        const verifiedPayment = await verifyPaymentWithYookassa(object.id);

        if (!verifiedPayment || verifiedPayment.status !== "succeeded") {
            console.error("Payment verification failed for", object.id);
            return NextResponse.json({ error: "Payment not verified" }, { status: 400 });
        }

        const userId = verifiedPayment.metadata?.userId;
        const bookId = verifiedPayment.metadata?.bookId;

        if (!userId || !bookId) {
            console.error("Missing metadata in verified payment", verifiedPayment.id);
            return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
        }

        const supabase = await createServerSupabase();
        const eventId = `yookassa:${verifiedPayment.id}`;

        // Идемпотентность: проверяем, не обработан ли этот платёж уже
        const { data: existing } = await supabase
            .from("processed_webhook_events")
            .select("id")
            .eq("id", eventId)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ success: true, alreadyProcessed: true });
        }

        // Проверяем, нет ли уже такой покупки (защита от гонок/дублей)
        const { data: existingPurchase } = await supabase
            .from("purchases")
            .select("id")
            .eq("user_id", userId)
            .eq("book_id", bookId)
            .maybeSingle();

        if (!existingPurchase) {
            const { error: purchaseError } = await supabase
                .from("purchases")
                .insert({
                    user_id: userId,
                    book_id: bookId,
                });

            if (purchaseError) throw purchaseError;
        }

        const { error: eventError } = await supabase
            .from("processed_webhook_events")
            .insert({
                id: eventId,
                type: notification_type,
                processed_at: new Date().toISOString(),
            });

        if (eventError) throw eventError;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Yookassa webhook error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}