"use client";

import { GlowCard } from "@/app/components/ui/GlowCard";
import { Container } from "@/app/components/ui/Container";
import { H2, Eyebrow } from "@/app/components/ui/Typography";
import { OrnamentDivider } from "@/app/components/ui/Ornaments";

const tags = [
    { label: "Запретная любовь", value: 92 },
    { label: "Магия и судьба", value: 87 },
    { label: "Клятвы и предательство", value: 95 },
    { label: "Второй шанс", value: 80 },
];

export function Membership() {
    return (
        <section className="py-24">
            <Container>
                <div className="text-center mb-16">
                    <Eyebrow>Внутри историй</Eyebrow>
                    <H2 className="mt-4">Романтика и ставки</H2>
                </div>

                <OrnamentDivider />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {tags.map((tag, i) => (
                        <GlowCard key={tag.label} delay={i * 0.1} className="p-6">
                            <div className="flex justify-between mb-3 font-serif text-warmText">
                                <span>{tag.label}</span>
                                <span className="text-roseGold">{tag.value}%</span>
                            </div>
                            <div className="h-[2px] bg-[#1F2A1E] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#556B2F] via-[#D4AF37] to-[#D8A1A1] rounded-full transition-all duration-1000"
                                    style={{ width: `${tag.value}%` }}
                                />
                            </div>
                        </GlowCard>
                    ))}
                </div>
            </Container>
        </section>
    );
}