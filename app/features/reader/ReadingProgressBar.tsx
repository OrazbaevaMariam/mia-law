'use client';

import { useEffect, useState } from 'react';

interface ReadingProgressBarProps {
    chapterId: string;
}

export function ReadingProgressBar({ chapterId }: ReadingProgressBarProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Слушаем scroll события
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(Math.round(scrollPercent));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [chapterId]);

    return (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
            <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}