"use client";

import { useEffect, useState } from "react";

interface PaymentSelectorProps {
    userId: string;
    bookId: string;
    bookTitle: string;
    priceRub: number; // цена в рублях, например 299
    priceUsd: number; // цена в долларах/евро для международных читателей, например 5
}

type PaymentMethod = "yookassa" | "stripe";

export default function PaymentSelector({
                                            userId,
                                            bookId,
                                            bookTitle,
                                            priceRub,
                                            priceUsd,
                                        }: PaymentSelectorProps) {
    const [method, setMethod] = useState<PaymentMethod>("yookassa");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        async function detectCountry() {
            try {
                const res = await fetch("/api/detect-country");
                const data = await res.json();
                // Россия и Беларусь -> ЮКасса по умолчанию, остальные -> Stripe
                const russianSpeakingRegion = ["RU", "BY"].includes(data.country);
                setMethod(russianSpeakingRegion ? "yookassa" : "stripe");
            } catch (err) {
                console.error("Country detection failed:", err);
                setMethod("yookassa"); // безопасный дефолт для вашей аудитории
            } finally {
                setLoading(false);
            }
        }

        detectCountry();
    }, []);

    async function handlePayment() {
        setProcessing(true);

        try {
            if (method === "yookassa") {
                const res = await fetch("/api/yookassa/create-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, bookId, amount: priceRub }),
                });
                const data = await res.json();

                if (data.confirmationUrl) {
                    window.location.href = data.confirmationUrl;
                } else {
                    alert("Ошибка при создании платежа. Попробуйте снова.");
                }
            } else {
                const res = await fetch("/api/stripe/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        bookId,
                        amount: Math.round(priceUsd * 100), // Stripe работает в центах
                        currency: "usd",
                        bookTitle,
                    }),
                });
                const data = await res.json();

                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    alert("Ошибка при создании платежа. Попробуйте снова.");
                }
            }
        } catch (err) {
            console.error("Payment error:", err);
            alert("Что-то пошло не так. Попробуйте снова.");
        } finally {
            setProcessing(false);
        }
    }

    if (loading) {
        return <div>Определяем способ оплаты...</div>;
    }

    return (
        <div className="payment-selector">
            <div className="payment-method-toggle">
                <button
                    className={method === "yookassa" ? "active" : ""}
                    onClick={() => setMethod("yookassa")}
                >
                    Оплата картой РФ — {priceRub} ₽
                </button>
                <button
                    className={method === "stripe" ? "active" : ""}
                    onClick={() => setMethod("stripe")}
                >
                    Оплата зарубежной картой — ${priceUsd}
                </button>
            </div>

            <button onClick={handlePayment} disabled={processing} className="pay-button">
                {processing ? "Обработка..." : "Оплатить"}
            </button>
        </div>
    );
}