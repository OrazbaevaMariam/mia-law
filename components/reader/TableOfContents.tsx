'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useReader } from './ReaderContext'

interface Chapter {
    id: string
    title: string
    slug: string
}

interface TableOfContentsProps {
    chapters: Chapter[]
    bookSlug: string
    currentChapterId: string
}

export function TableOfContents({ chapters, bookSlug, currentChapterId }: TableOfContentsProps) {
    const { isTocOpen, setIsTocOpen } = useReader()

    return (
        <>
            {/* Затемнение фона */}
            <div
                className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
                    isTocOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsTocOpen(false)}
            />

            {/* Панель */}
            <div
                className={`fixed left-0 top-0 bottom-0 w-80 bg-warmBg z-[70] shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
                    isTocOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-4 border-b border-burgundy/20 flex items-center justify-between sticky top-0 bg-warmBg">
                    <h3 className="font-serif text-lg text-burgundy">Содержание</h3>
                    <button
                        onClick={() => setIsTocOpen(false)}
                        className="p-1 rounded-full hover:bg-burgundy/10"
                    >
                        <X className="w-5 h-5 text-burgundy" />
                    </button>
                </div>

                <div className="p-2">
                    {chapters.map((chapter) => (
                        <Link
                            key={chapter.id}
                            href={`/book/${bookSlug}/chapter/${chapter.slug}`}
                            onClick={() => setIsTocOpen(false)}
                            className={`block p-3 rounded-lg mb-1 transition-colors ${
                                chapter.id === currentChapterId
                                    ? 'bg-burgundy text-warmBg'
                                    : 'hover:bg-burgundy/10 text-warmText'
                            }`}
                        >
                            {chapter.title}
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}