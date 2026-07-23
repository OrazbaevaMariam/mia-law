'use client'

import { ChevronLeft, Heart, Minus, Plus, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/shared/lib/supabaseClient'
import { useReader } from './ReaderContext'

interface ReaderToolbarProps {
    bookId: string
    bookSlug: string
    bookTitle: string
}

export function ReaderToolbar({ bookId, bookSlug, bookTitle }: ReaderToolbarProps) {
    const [isFavorite, setIsFavorite] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const { fontSize, setFontSize, setIsTocOpen } = useReader()
    const supabase = createClientSupabase()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || null)
        }
        void getUser()
    }, [supabase])

    useEffect(() => {
        if (!userId) return
        const checkFavorite = async () => {
            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', userId)
                .eq('book_id', bookId)
                .maybeSingle()
            setIsFavorite(!!data)
        }
        void checkFavorite()
    }, [userId, bookId, supabase])

    const toggleFavorite = async () => {
        if (!userId) {
            alert('Пожалуйста, авторизуйтесь')
            return
        }
        if (isFavorite) {
            await supabase.from('favorites').delete().eq('user_id', userId).eq('book_id', bookId)
            setIsFavorite(false)
        } else {
            await supabase.from('favorites').insert({ user_id: userId, book_id: bookId })
            setIsFavorite(true)
        }
    }

    return (
        <div className="sticky top-0 z-50 bg-warmBg border-b border-burgundy/20 shadow-sm">
            {/* Тулбар управления чтением */}
            <div className="py-3">
                <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* Оглавление */}
                        <button
                            onClick={() => setIsTocOpen(true)}
                            className="p-2 rounded-full hover:bg-burgundy/10 transition-colors"
                            aria-label="Оглавление"
                        >
                            <Menu className="w-5 h-5 text-burgundy" />
                        </button>

                    </div>

                    <Link
                        href={`/book/${bookSlug}`}
                        className="hidden md:block font-serif text-burgundy truncate max-w-xs hover:text-burgundy/70 transition-colors"
                    >
                        {bookTitle}
                    </Link>

                    <div className="flex items-center gap-3">
                        {/* Размер шрифта */}
                        <div className="flex items-center gap-2 bg-burgundy/5 rounded-lg px-2 py-1 border border-burgundy/20">
                            <button
                                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                                className="p-1 text-burgundy hover:bg-burgundy/10 rounded transition-colors"
                                aria-label="Уменьшить шрифт"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-serif text-sm text-warmText w-6 text-center">
                                {fontSize}
                            </span>
                            <button
                                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                                className="p-1 text-burgundy hover:bg-burgundy/10 rounded transition-colors"
                                aria-label="Увеличить шрифт"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Избранное */}
                        <button
                            onClick={() => void toggleFavorite()}
                            className="p-2 rounded-full hover:bg-burgundy/10 transition-colors"
                            aria-label="Добавить в избранное"
                        >
                            <Heart
                                className={`w-5 h-5 transition-colors ${
                                    isFavorite ? 'fill-red-500 text-red-500' : 'text-burgundy'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}