"use client";

import { useEffect } from "react";

interface ReaderProgressProps {
    chapterId: string;
    slug: string;
}

export function ReaderProgress({ chapterId, slug }: ReaderProgressProps) {
    useEffect(() => {
        const logProgress = async () => {
            try {
                await fetch("/api/reader/log-progress", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chapterId,
                        bookSlug: slug,
                    }),
                });
            } catch (error) {
                console.error("Failed to log progress:", error);
            }
        };

        // Логируем прогресс через 2 секунды
        const timer = setTimeout(logProgress, 2000);

        return () => clearTimeout(timer);
    }, [chapterId, slug]);

    return null;
}
