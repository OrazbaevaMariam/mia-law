// app/(admin)/admin/books/[bookId]/chapters/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/shared/lib/supabaseClient'

interface Chapter {
    id: string
    title: string
    content: string
    order: number
    is_free: boolean
}

export default function AdminChaptersPage() {
    const params = useParams()
    const bookId = params.bookId as string

    const [chapters, setChapters] = useState<Chapter[]>([])
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [order, setOrder] = useState(1)
    const [isFree, setIsFree] = useState(false)
    const [loading, setLoading] = useState(false)

    const loadChapters = useCallback(async () => {
        const { data } = await supabase
            .from('chapters')
            .select('*')
            .eq('book_id', bookId)
            .order('order_index', { ascending: true })
        setChapters(data ?? [])
    }, [bookId])

    useEffect(() => {
        void loadChapters()
    }, [loadChapters])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('chapters').insert({
            book_id: bookId,
            title,
            content,
            order,
            is_free: isFree,
        })

        if (error) {
            alert('Ошибка: ' + error.message)
        } else {
            setTitle('')
            setContent('')
            setOrder(order + 1)
            setIsFree(false)
            await loadChapters()
        }

        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить главу?')) return
        await supabase.from('chapters').delete().eq('id', id)
        await loadChapters()
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-serif mb-8">Управление главами</h1>

            <form onSubmit={handleSubmit} className="mb-12 space-y-4 bg-warmBgAccent p-6 rounded-lg">
                <div>
                    <label className="block mb-2 font-medium">Название главы</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full border border-olive/30 rounded-lg px-4 py-2"
                        placeholder="Глава 1: Начало"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Текст главы</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={10}
                        className="w-full border border-olive/30 rounded-lg px-4 py-2 font-serif"
                        placeholder="Текст главы..."
                    />
                </div>

                <div className="flex gap-4">
                    <div>
                        <label className="block mb-2 font-medium">Порядок</label>
                        <input
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(Number(e.target.value))}
                            className="border border-olive/30 rounded-lg px-4 py-2 w-24"
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-8">
                        <input
                            type="checkbox"
                            checked={isFree}
                            onChange={(e) => setIsFree(e.target.checked)}
                            id="isFree"
                        />
                        <label htmlFor="isFree">Бесплатная глава (preview)</label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gold text-warmBg rounded-lg font-medium hover:bg-goldDark disabled:opacity-50"
                >
                    {loading ? 'Сохранение...' : 'Добавить главу'}
                </button>
            </form>

            <h2 className="text-2xl font-serif mb-4">Все главы ({chapters.length})</h2>
            <div className="space-y-3">
                {chapters.map((ch) => (
                    <div
                        key={ch.id}
                        className="flex items-center justify-between border border-olive/20 rounded-lg p-4"
                    >
                        <div>
                            <p className="font-medium">
                                {ch.order}. {ch.title} {ch.is_free && '🆓'}
                            </p>
                            <p className="text-sm text-muted line-clamp-1">{ch.content.slice(0, 100)}...</p>
                        </div>
                        <button
                            onClick={() => handleDelete(ch.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm"
                        >
                            Удалить
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}