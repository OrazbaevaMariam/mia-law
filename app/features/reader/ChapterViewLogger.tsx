"use client";

import { useEffect } from "react";

interface ChapterViewLoggerProps {
    chapterId: string;
}

export function ChapterViewLogger({ chapterId }: ChapterViewLoggerProps) {
    console.log("ChapterViewLogger rendered", chapterId);

    useEffect(() => {
        console.log("useEffect fired", chapterId);
        const logView = async () => {
            try {
                await fetch("/api/reader/log-view", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ chapterId }),
                });
            } catch (error) {
                console.error("Failed to log chapter view:", error);
            }
        };

        void logView();
    }, [chapterId]);

    return null;
}