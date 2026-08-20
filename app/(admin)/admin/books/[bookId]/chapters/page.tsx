// app/(admin)/admin/books/[bookId]/chapters/page.tsx
'use client'

import { useEffect, useState, use } from 'react'

interface Chapter {
    id: string
    book_id: string
    title: string
    content: string
    order_index: number
    is_free: boolean
    created_at: string
}

export default function ChaptersPage({ params }: { params: Promise<{ bookId: string }> }) {
    const { bookId } = use(params)
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isFree, setIsFree] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const loadChapters = async () => {
        const res = await fetch(`/api/admin/chapters?bookId=${bookId}`)
        const data = await res.json()
        setChapters(data ?? [])
    }

    useEffect(() => {
        loadChapters()
    }, [bookId])

    const resetForm = () => {
        setTitle('')
        setContent('')
        setIsFree(false)
        setEditingId(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (editingId) {
            const res = await fetch('/api/admin/chapters', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingId, title, content, is_free: isFree }),
            })
            if (res.ok) resetForm()
        } else {
            const res = await fetch('/api/admin/chapters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    book_id: bookId,
                    title,
                    content,
                    is_free: isFree,
                    order_index: chapters.length + 1,
                }),
            })
            if (res.ok) resetForm()
        }

        await loadChapters()
        setLoading(false)
    }

    const handleEdit = (chapter: Chapter) => {
        setEditingId(chapter.id)
        setTitle(chapter.title)
        setContent(chapter.content)
        setIsFree(chapter.is_free)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить главу?')) return
        await fetch('/api/admin/chapters', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        })
        await loadChapters()
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Главы книги</h1>

            <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
                <input
                    type="text"
                    placeholder="Название главы"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full mb-4 p-2 border rounded"
                />
                <textarea
                    placeholder="Содержание (можно HTML: <p>, <b>, <i>)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="w-full mb-4 p-2 border rounded h-48 font-mono text-sm"
                />
                <label className="flex items-center gap-2 mb-4">
                    <input
                        type="checkbox"
                        checked={isFree}
                        onChange={(e) => setIsFree(e.target.checked)}
                    />
                    Бесплатная глава
                </label>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Сохранение...' : editingId ? 'Сохранить изменения' : 'Добавить главу'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 border rounded hover:bg-gray-50"
                        >
                            Отмена
                        </button>
                    )}
                </div>
            </form>

            <div className="space-y-3">
                {chapters.map((chapter) => (
                    <div
                        key={chapter.id}
                        className="p-4 border rounded hover:bg-gray-50 flex justify-between items-start"
                    >
                        <div>
                            <h3 className="font-bold text-lg">
                                Глава {chapter.order_index}: {chapter.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {chapter.is_free ? '🟢 Бесплатно' : '🔒 Платно'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(chapter)}
                                className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
                            >
                                Изменить
                            </button>
                            <button
                                onClick={() => handleDelete(chapter.id)}
                                className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
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