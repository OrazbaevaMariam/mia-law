"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { H2, Eyebrow } from "@/components/ui/Typography";
import { galleryPrompts } from "@/shared/lib/imagePrompts";

export function Gallery() {
    const [active, setActive] = useState<number | null>(null);

    return (
        <section className="py-24">
            <Container>
                <div className="text-center mb-16">
                    <Eyebrow>Фрагменты мира</Eyebrow>
                    <H2 className="mt-4">Галерея</H2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryPrompts.map((item, i) => (
                        <motion.button
                            key={item.id}
                            onClick={() => setActive(i)}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                            className="relative aspect-square rounded-xl overflow-hidden border border-[#556B2F]/30 group focus-visible:ring-2 focus-visible:ring-roseGold"
                        >
                            <Image
                                src={`/images/gallery/${item.id}.jpg`}
                                alt=""
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/60 transition-all duration-500 rounded-xl" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </motion.button>
                    ))}
                </div>
            </Container>

            <AnimatePresence>
                {active !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
                        onClick={() => setActive(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="relative max-w-2xl w-full aspect-square rounded-2xl overflow-hidden border border-gold/30"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={`/images/gallery/${galleryPrompts[active].id}.jpg`}
                                alt=""
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}