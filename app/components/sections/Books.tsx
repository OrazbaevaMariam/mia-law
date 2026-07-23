"use client";

import Image from "next/image";
import Link from "next/link";
import { GlowCard } from "@/app/components/ui/GlowCard";
import { H2, Eyebrow } from "@/app/components/ui/Typography";
import { Container } from "@/app/components/ui/Container";
import { books } from "@/lib/booksData";

export function Books() {
    return (
        <section className="py-24 relative">
            <Container>
                <div className="text-center mb-16">
                    <Eyebrow>Артефакты историй</Eyebrow>
                    <H2 className="mt-4">Избранные книги</H2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {books.map((book, i) => (
                        <Link key={book.slug} href={`/book/${book.slug}`}>
                            <GlowCard delay={i * 0.1} className="p-0">
                                <div className="relative aspect-[3/4] w-full overflow-hidden">
                                    <Image
                                        src={book.cover}
                                        alt={book.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 className="font-serif text-2xl text-warmText mb-2">
                                            {book.title}
                                        </h3>
                                        <p className="text-dustyRose text-sm italic mb-3">
                                            {book.teaser}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {book.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-roseGold/40 text-roseGold/90"
                                                >
                          {tag}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </GlowCard>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    );
}