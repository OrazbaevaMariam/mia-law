"use client";

import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/Button";
import { SmokeLayer } from "@/app/components/ui/SmokeLayer";
import { useRouter } from "next/navigation";

export function PaywallMoment({
                                  bookSlug,
                                  compact = false,
                              }: {
    bookSlug?: string;
    compact?: boolean;
}) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`relative overflow-hidden rounded-2xl border border-gold/20 ${
                compact ? "py-12 px-6" : "py-24 px-8"
            } text-center`}
        >
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1F2A1E] via-[#12121A] to-[#0B0B0F]" />
            <SmokeLayer />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08),transparent_70%)]" />

            <p className="text-roseGold text-xs uppercase tracking-[0.3em] mb-4">
                Момент обрыва
            </p>
            <h3 className="font-serif text-2xl md:text-4xl text-warmText mb-6 max-w-xl mx-auto leading-snug">
                Ты дошла до момента, где всё только начинается
            </h3>
            <p className="text-muted mb-10 max-w-md mx-auto">
                Дальше — только внутри. Останься там, где история продолжает дышать.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                    onClick={() =>
                        router.push(
                            bookSlug ? `/login?next=/book/${bookSlug}` : "/login"
                        )
                    }
                >
                    Остаться внутри
                </Button>
                <button
                    onClick={() => router.push("/books")}
                    className="text-dustyRose text-sm underline underline-offset-4 hover:text-roseGold transition-colors"
                >
                    Посмотреть клуб
                </button>
            </div>
        </motion.div>
    );
}