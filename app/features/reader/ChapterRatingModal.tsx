// app/features/reader/ChapterRatingModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

interface ChapterRatingModalProps {
    chapterId: string;
}

export function ChapterRatingModal({ chapterId }: ChapterRatingModalProps) {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Проверяем localStorage — не показываем повторно за эту главу в этой сессии
    useEffect(() => {
        const key = `chapter-rating-shown-${chapterId}`;
        if (sessionStorage.getItem(key)) {
            setDismissed(true);
        }
    }, [chapterId]);

    useEffect(() => {
        if (dismissed || !sentinelRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisible(true);
                    sessionStorage.setItem(`chapter-rating-shown-${chapterId}`, '1');
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [chapterId, dismissed]);

    const handleRate = async (rating: number) => {
        setSelectedRating(rating);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            await fetch(`/api/chapters/${chapterId}/rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ rating }),
            });
            setSubmitted(true);
            setTimeout(() => setVisible(false), 1500);
        } catch (err) {
            console.error('Failed to submit chapter rating:', err);
        }
    };

    const handleSkip = () => {
        setVisible(false);
    };

    return (
        <>
            {/* Невидимый маркер конца главы — вставляется в конце текста главы */}
            <div ref={sentinelRef} className="h-1" />

            {visible && !dismissed && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white shadow-xl rounded-2xl border border-slate-200 px-6 py-4 max-w-sm w-[90%] animate-in fade-in slide-in-from-bottom-4">
                    {!submitted ? (
                        <>
                            <div className="flex justify-between items-start mb-3">
                                <p className="text-slate-800 font-medium text-sm">
                                    Как вам эта глава?
                                </p>
                                <button
                                    onClick={handleSkip}
                                    className="text-slate-400 hover:text-slate-600 text-sm ml-2"
                                    aria-label="Закрыть"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex justify-between gap-2">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleRate(num)}
                                        className={`flex-1 h-10 rounded-full border font-semibold text-sm transition
                                            ${selectedRating === num
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-green-600 font-medium text-sm py-2">
                            Спасибо за оценку! 💌
                        </p>
                    )}
                </div>
            )}
        </>
    );
}