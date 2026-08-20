"use client";

import { useEffect, useState } from "react";
import { getPriceForCurrency, detectCurrencyByCountry, SupportedCurrency } from "@/lib/currency";

interface PaymentSelectorProps {
    userId: string;
    bookId: string;
    bookTitle: string;
    priceRub: number; // цена в рублях, например 299
}

type PaymentMethod = "yookassa" | "stripe";

export default function PaymentSelector({
                                            userId,
                                            bookId,
                                            bookTitle,
                                            priceRub,
                                        }: PaymentSelectorProps) {
    const [method, setMethod] = useState<PaymentMethod>("yookassa");
    const [currency, setCurrency] = useState<SupportedCurrency>("usd");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        async function detectCountry() {
            try {
                const res = await fetch("/api/detect-country");
                const data = await res.json();

                const russianSpeakingRegion = ["RU", "BY"].includes(data.country);
                setMethod(russianSpeakingRegion ? "yookassa" : "stripe");
                setCurrency(detectCurrencyByCountry(data.country));
            } catch (err) {
                console.error("Country detection failed:", err);
                setMethod("yookassa");
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
                const price = getPriceForCurrency(currency);

                const res = await fetch("/api/stripe/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        bookId,
                        amount: Math.round(price * 100), // Stripe работает в минимальных единицах валюты
                        currency,
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

    const internationalPrice = getPriceForCurrency(currency);
    const currencySymbol = currency === "usd" ? "$" : currency === "eur" ? "€" : "£";

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
                    Оплата зарубежной картой — {currencySymbol}{internationalPrice}
                </button>
            </div>

            <button onClick={handlePayment} disabled={processing} className="pay-button">
                {processing ? "Обработка..." : "Оплатить"}
            </button>
        </div>
    );
}