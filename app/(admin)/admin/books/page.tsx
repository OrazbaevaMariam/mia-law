// app/(admin)/admin/books/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabaseClient'

interface Book {
    id: string
    title: string
    slug: string
    description: string
    cover_url: string
    is_published: boolean
}

export default function AdminBooksPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [coverUrl, setCoverUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const loadBooks = useCallback(async () => {
        const { data } = await supabase
            .from('books')
            .select('*')
            .order('title')
        setBooks(data ?? [])
    }, [])

    useEffect(() => {
        void loadBooks()
    }, [loadBooks])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('books').insert({
            title,
            slug,
            description,
            cover_url: coverUrl,
            is_published: true,
        })

        if (error) {
            alert('Ошибка: ' + error.message)
        } else {
            setTitle('')
            setSlug('')
            setDescription('')
            setCoverUrl('')
            await loadBooks()
        }

        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить книгу?')) return
        await supabase.from('books').delete().eq('id', id)
        await loadBooks()
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-serif mb-8">Управление книгами</h1>

            {/* ФОРМА ДОБАВЛЕНИЯ */}
            <form onSubmit={handleSubmit} className="mb-12 space-y-4 bg-warmBgAccent p-6 rounded-lg">
                <div>
                    <label className="block mb-2 font-medium">Название книги</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full border border-olive/30 rounded-lg px-4 py-2"
                        placeholder="Война и мир"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Slug (для URL, латиницей)</label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required
                        className="w-full border border-olive/30 rounded-lg px-4 py-2"
                        placeholder="voina-i-mir"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Описание</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={4}
                        className="w-full border border-olive/30 rounded-lg px-4 py-2"
                        placeholder="Эпический роман о любви и войне..."
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Ссылка на обложку</label>
                    <input
                        type="url"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        className="w-full border border-olive/30 rounded-lg px-4 py-2"
                        placeholder="https://images.unsplash.com/..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gold text-warmBg rounded-lg font-medium hover:bg-goldDark disabled:opacity-50"
                >
                    {loading ? 'Сохранение...' : 'Добавить книгу'}
                </button>
            </form>

            {/* СПИСОК КНИГ */}
            <h2 className="text-2xl font-serif mb-4">Все книги ({books.length})</h2>
            <div className="space-y-3">
                {books.map((book) => (
                    <div
                        key={book.id}
                        className="flex items-center justify-between border border-olive/20 rounded-lg p-4"
                    >
                        <div>
                            <p className="font-medium">{book.title}</p>
                            <p className="text-sm text-muted">/{book.slug}</p>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={`/admin/books/${book.id}/chapters`}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm"
                            >
                                Главы
                            </a>
                            <button
                                onClick={() => handleDelete(book.id)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}