// components/reader/ChapterContent.tsx
'use client'

import { useReader } from './ReaderContext'

interface ChapterContentProps {
    content: string
}

export function ChapterContent({ content }: ChapterContentProps) {
    const { fontSize } = useReader()

    if (!content) {
        return (
            <div className="text-center py-12">
                <p className="text-warmText">Контент главы не найден</p>
            </div>
        )
    }

    return (
        <article className="prose prose-lg max-w-none text-warmText leading-relaxed">
            <div
                className="font-serif leading-8 whitespace-pre-line"
                style={{ fontSize: `${fontSize}px` }}
            >
                {content}
            </div>
        </article>
    )
}