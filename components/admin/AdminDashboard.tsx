// components/admin/AdminDashboard.tsx
'use client'

import { useState } from 'react'
import { BooksManager } from './BooksManager'
import { ChaptersManager } from './ChaptersManager'

export function AdminDashboard({ userId }: { userId: string }) {
    const [tab, setTab] = useState<'books' | 'chapters'>('books')

    return (
        <div className="min-h-screen bg-warmBg pt-24">
            <div className="max-w-6xl mx-auto px-6">
                <h1 className="text-4xl font-serif text-burgundy mb-8">
                    Админ-панель
                </h1>

                {/* Табы */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setTab('books')}
                        className={`px-6 py-2 rounded font-serif transition-colors ${
                            tab === 'books'
                                ? 'bg-burgundy text-warmBg'
                                : 'bg-burgundy/10 text-burgundy'
                        }`}
                    >
                        Книги
                    </button>
                    <button
                        onClick={() => setTab('chapters')}
                        className={`px-6 py-2 rounded font-serif transition-colors ${
                            tab === 'chapters'
                                ? 'bg-burgundy text-warmBg'
                                : 'bg-burgundy/10 text-burgundy'
                        }`}
                    >
                        Главы
                    </button>
                </div>

                {/* Содержимое табов */}
                {tab === 'books' && <BooksManager />}
                {tab === 'chapters' && <ChaptersManager />}
            </div>
        </div>
    )
}