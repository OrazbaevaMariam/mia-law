// app/(protected)/reader/[slug]/[chapterId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReaderProgress, ChapterViewLogger, ContentProtection, ChapterRatingModal } from "@/app/features/reader";
import { HeartButton } from "@/app/components/HeartButton";
import { PaywallMoment } from "@/app/components/sections/PaywallMoment";

import { supabase } from "@/lib/supabase-client";

interface Chapter {
    id: string;
    title: string;
    order_index: number;
    content: string;
    book_id: string;
    is_free: boolean;
    prevChapterId: string | null;
    nextChapterId: string | null;
    hasAccess: boolean;
}

interface TocChapter {
    id: string;
    title: string;
    order_index: number;
    is_free: boolean;
}

const FONT_SIZE_STEP = 2;
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 28;
const DEFAULT_FONT_SIZE = 18;

export default function ChapterPage() {
    const params = useParams();
    const slug = params.slug as string;
    const chapterId = params.chapterId as string;
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [toc, setToc] = useState<TocChapter[]>([]);

    const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        const savedFontSize = localStorage.getItem("reader-font-size");
        if (savedFontSize) {
            setFontSize(parseInt(savedFontSize, 10));
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setReadingProgress(Math.min(scrollPercent, 100));
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const changeFontSize = (delta: number) => {
        setFontSize((prev) => {
            const next = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, prev + delta));
            localStorage.setItem("reader-font-size", String(next));
            return next;
        });
    };

    useEffect(() => {
        const fetchChapter = async () => {
            try {
                const res = await fetch(`/api/reader/${slug}/${chapterId}`);
                if (!res.ok) throw new Error("Failed to fetch chapter");
                const data = await res.json();
                setChapter(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        if (slug && chapterId) {
            fetchChapter();
        }
    }, [slug, chapterId]);

    useEffect(() => {
        const fetchToc = async () => {
            if (!chapter?.book_id) return;
            const { data } = await supabase
                .from("chapters")
                .select("id, title, order_index, is_free")
                .eq("book_id", chapter.book_id)
                .order("order_index", { ascending: true });
            setToc((data as TocChapter[]) ?? []);
        };

        void fetchToc();
    }, [chapter?.book_id]);

    if (loading) {
        return (
            <div className="reader flex items-center justify-center min-h-screen">
                <div className="text-reader-muted font-reader">Загрузка главы...</div>
            </div>
        );
    }

    if (error || !chapter) {
        return (
            <div className="reader max-w-reader mx-auto px-6 py-12">
                <Link href={`/book/${slug}`} className="text-antique-gold hover:text-ink mb-8 inline-block">
                    ← Вернуться к книге
                </Link>
                <div className="text-burgundy">Ошибка: {error || "Chapter not found"}</div>
            </div>
        );
    }

    return (
        <div className="reader min-h-screen relative">
            <style>{`
                @keyframes shimmerGlow {
                    0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.6); }
                    50% { box-shadow: 0 0 12px 2px rgba(212, 175, 55, 0.4); }
                    100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
                }
                @keyframes subtleShimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
                @keyframes threadGlow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                .progress-bar-shimmer {
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(255, 255, 255, 0.15) 25%,
                        rgba(255, 255, 255, 0.25) 50%,
                        rgba(255, 255, 255, 0.15) 75%,
                        transparent 100%
                    );
                    background-size: 200% 100%;
                    animation: subtleShimmer 4s ease-in-out infinite;
                }
                .progress-glow {
                    animation: threadGlow 3s ease-in-out infinite;
                }
            `}</style>

            <div className="fixed right-8 top-0 z-50 h-screen pointer-events-none">
                <style>{`
        @keyframes threadDrizzle {
            0%, 100% { opacity: 0.4; transform: scaleY(1); }
            50% { opacity: 0.8; transform: scaleY(1.02); }
        }
        .thread-glow {
            animation: threadDrizzle 2.5s ease-in-out infinite;
        }
    `}</style>

                <div className="absolute right-0 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-antique-gold to-transparent opacity-30" />

                <div
                    className="absolute right-0 top-0 w-0.5 bg-gradient-to-b from-antique-gold via-rose-gold to-burgundy thread-glow transition-all duration-700 ease-out shadow-lg"
                    style={{
                        height: `${readingProgress}%`,
                        boxShadow: `0 0 15px rgba(212, 175, 55, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.6)`,
                    }}
                />

                {readingProgress > 0 && (
                    <div
                        className="absolute right-0 transition-all duration-700 ease-out"
                        style={{
                            top: `${readingProgress}%`,
                            transform: 'translateY(-50%)',
                        }}
                    >
                        <div className="relative flex items-center justify-center">
                            <div className="w-2 h-2 bg-antique-gold rounded-full shadow-lg" style={{
                                boxShadow: `0 0 10px rgba(212, 175, 55, 0.8), inset 0 0 3px rgba(255, 255, 255, 0.9)`,
                            }} />
                        </div>
                    </div>
                )}

                {readingProgress > 5 && (
                    <div
                        className="absolute right-12 transition-opacity duration-700 text-xs text-antique-gold/60 font-display tracking-widest whitespace-nowrap"
                        style={{
                            top: `${readingProgress}%`,
                            transform: 'translateY(-50%)',
                            opacity: readingProgress > 20 ? 0.6 : 0.3,
                        }}
                    >
                        {Math.round(readingProgress)}%
                    </div>
                )}
            </div>

            {readingProgress > 5 && (
                <div
                    className="fixed top-3 right-4 z-40 text-xs font-display text-antique-gold/40 tracking-widest transition-opacity duration-700"
                    style={{
                        opacity: readingProgress > 20 ? 0.4 : 0.2,
                    }}
                >
                    {Math.round(readingProgress)}%
                </div>
            )}

            <ReaderProgress chapterId={chapterId} slug={slug} />
            {chapter.hasAccess && <ChapterViewLogger chapterId={chapterId} />}

            <div
                className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-30 ${
                    isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMenuOpen(false)}
            />

            <div
                className={`fixed left-0 top-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ease-out z-40 overflow-y-auto ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-lg text-ink">Содержание</h2>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Закрыть оглавление"
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 6l12 12M6 18L18 6" />
                            </svg>
                        </button>
                    </div>
                    <ul className="space-y-2">
                        {toc.map((tocChapter) => (
                            <li key={tocChapter.id}>
                                <Link
                                    href={`/reader/${slug}/${tocChapter.id}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block text-sm font-interface py-1 hover:text-antique-gold transition-colors ${
                                        tocChapter.id === chapterId
                                            ? "text-antique-gold font-semibold"
                                            : "text-ink"
                                    }`}
                                >
                                    {tocChapter.order_index}. {tocChapter.title}
                                    {!tocChapter.is_free && (
                                        <span className="ml-1 text-xs text-reader-muted">🔒</span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <button
                onClick={() => setIsMenuOpen(true)}
                className={`fixed top-24 left-4 z-50 bg-white shadow-md rounded-full p-3 hover:bg-gray-50 transition-opacity duration-200 ${
                    isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                aria-label="Оглавление"
            >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
            </button>

            <div className="fixed top-24 right-2 sm:right-4 z-40 flex flex-col gap-2">
                <button
                    onClick={() => changeFontSize(FONT_SIZE_STEP)}
                    className="bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-lg font-bold transition-colors"
                    aria-label="Увеличить текст"
                >
                    A+
                </button>
                <button
                    onClick={() => changeFontSize(-FONT_SIZE_STEP)}
                    className="bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-sm font-bold transition-colors"
                    aria-label="Уменьшить текст"
                >
                    A-
                </button>
            </div>

            <article className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 py-12">
                <div className="mb-12">
                    <Link
                        href={`/reader/${slug}`}
                        className="text-antique-gold hover:text-ink text-sm mb-4 inline-block font-interface tracking-archive uppercase"
                    >
                        ← Вернуться к книге
                    </Link>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="font-display text-h2 text-ink mb-2">
                                {chapter.title}
                            </h1>
                        </div>
                        <HeartButton bookId={chapter.book_id} variant="icon" />
                    </div>
                </div>

                {chapter.hasAccess ? (
                    <>
                        <ContentProtection />
                        <div className="reader-content mb-12">
                            <div
                                className="text-reader-text leading-reader whitespace-pre-line"
                                style={{ fontSize: `${fontSize}px` }}
                                dangerouslySetInnerHTML={{ __html: chapter.content }}
                            />
                        </div>

                        {/* ✅ Модалка оценки главы (1-5, приватно, показывается после прочтения) */}
                        <ChapterRatingModal chapterId={chapterId} />

                        <nav className="flex items-center justify-between pt-8 border-t border-archive-olive/20">
                            {chapter.prevChapterId ? (
                                <Link
                                    href={`/reader/${slug}/${chapter.prevChapterId}`}
                                    className="text-antique-gold hover:text-ink transition-colors text-sm font-interface"
                                >
                                    ← Предыдущая глава
                                </Link>
                            ) : (
                                <div />
                            )}

                            {chapter.nextChapterId ? (
                                <Link
                                    href={`/reader/${slug}/${chapter.nextChapterId}`}
                                    className="text-antique-gold hover:text-ink transition-colors text-sm font-interface"
                                >
                                    Следующая глава →
                                </Link>
                            ) : (
                                <div />
                            )}
                        </nav>
                    </>
                ) : (
                    <PaywallMoment bookSlug={slug} />
                )}
            </article>
        </div>
    );
}