'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ChapterContent } from '@/components/reader/ChapterContent'
import { ReaderToolbar } from '@/components/reader/ReaderToolbar'
import { TableOfContents } from '@/components/reader/TableOfContents'
import { ReaderProvider } from '@/components/reader/ReaderContext'

interface Book {
    id: string
    title: string
    slug: string
}

interface Chapter {
    id: string
    title: string
    slug: string
    content: string
}

interface Props {
    book: Book
    chapter: Chapter
    allChapters: Chapter[]
    prevChapter: Chapter | null
    nextChapter: Chapter | null
}

export function ChapterPageClient({ book, chapter, allChapters, prevChapter, nextChapter }: Props) {
    return (
        <ReaderProvider>
            <div className="min-h-screen bg-warmBg">
                <ReaderToolbar bookId={book.id} bookSlug={book.slug} bookTitle={book.title} />
                <TableOfContents
                    chapters={allChapters}
                    bookSlug={book.slug}
                    currentChapterId={chapter.id}
                />

                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="mb-8">
                        <Link
                            href={`/book/${book.slug}`}
                            className="text-burgundy hover:text-burgundy/70 text-sm inline-flex items-center gap-1 mb-4"
                        >
                            ← Вернуться к книге
                        </Link>
                        <h1 className="text-3xl font-serif text-burgundy">
                            {chapter.title}
                        </h1>
                    </div>

                    <ChapterContent content={chapter.content} />

                    <div className="flex justify-between items-center mt-12 pt-8 border-t border-burgundy/20">
                        {prevChapter ? (
                            <Link
                                href={`/book/${book.slug}/chapter/${prevChapter.slug}`}
                                className="flex items-center gap-2 px-4 py-2 bg-burgundy text-warmBg rounded-lg font-serif hover:bg-burgundy/90 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Предыдущая
                            </Link>
                        ) : <div />}

                        {nextChapter ? (
                            <Link
                                href={`/book/${book.slug}/chapter/${nextChapter.slug}`}
                                className="flex items-center gap-2 px-4 py-2 bg-burgundy text-warmBg rounded-lg font-serif hover:bg-burgundy/90 transition-colors"
                            >
                                Следующая
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        ) : <div />}
                    </div>
                </div>
            </div>
        </ReaderProvider>
    )
}