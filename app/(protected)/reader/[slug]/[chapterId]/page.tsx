"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReaderProgress } from "@/app/features/reader";

interface Chapter {
    id: string;
    title: string;
    number: number;
    content: string;
    book_id: string;
    prevChapterId: string | null;
    nextChapterId: string | null;
}

export default function ChapterPage() {
    const params = useParams();
    const slug = params.slug as string;
    const chapterId = params.chapterId as string;
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted">Загрузка главы...</div>
            </div>
        );
    }

    if (error || !chapter) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-12">
                <Link href={`/reader/${slug}`} className="text-gold hover:text-warmText mb-8 inline-block">
                    ← Вернуться к книге
                </Link>
                <div className="text-red-500">Ошибка: {error || "Chapter not found"}</div>
            </div>
        );
    }

    return (
        <>
            <ReaderProgress chapterId={chapterId} slug={slug} />
            <article className="max-w-3xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <Link href={`/reader/${slug}`} className="text-gold hover:text-warmText text-sm mb-4 inline-block">
                        ← К оглавлению
                    </Link>
                    <h1 className="text-4xl font-serif tracking-wide text-warmText mb-2">
                        {chapter.title}
                    </h1>
                    <p className="text-sm text-[#556B2F]">
                        Глава {chapter.number}
                    </p>
                </div>

                <div className="prose prose-invert max-w-none mb-12">
                    <div
                        className="text-[#E8DCC4] leading-relaxed space-y-6"
                        dangerouslySetInnerHTML={{ __html: chapter.content }}
                    />
                </div>

                <nav className="flex items-center justify-between pt-8 border-t border-[#556B2F]/20">
                    {chapter.prevChapterId ? (
                        <Link
                            href={`/reader/${slug}/${chapter.prevChapterId}`}
                            className="text-gold hover:text-warmText transition-colors text-sm"
                        >
                            ← Предыдущая глава
                        </Link>
                    ) : (
                        <div />
                    )}

                    {chapter.nextChapterId ? (
                        <Link
                            href={`/reader/${slug}/${chapter.nextChapterId}`}
                            className="text-gold hover:text-warmText transition-colors text-sm"
                        >
                            Следующая глава →
                        </Link>
                    ) : (
                        <div />
                    )}
                </nav>
            </article>
        </>
    );
}
