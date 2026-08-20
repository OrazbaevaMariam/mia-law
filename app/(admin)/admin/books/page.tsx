// app/(admin)/admin/books/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import Link from 'next/link'
import Image from 'next/image'
import { slugify } from '@/lib/slugify'

interface Book {
    id: string
    slug: string
    title: string
    description: string
    cover_url: string
}

export default function AdminBooksPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [currentCoverUrl, setCurrentCoverUrl] = useState<string>('')

    const loadBooks = async () => {
        const { data } = await supabase
            .from('books')
            .select('*')
            .order('created_at', { ascending: false })
        setBooks((data as Book[]) ?? [])
    }

    useEffect(() => {
        void loadBooks()
    }, [])

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setCoverFile(null)
        setEditingId(null)
        setCurrentCoverUrl('')
        setErrorMsg(null)
    }

    const handleEdit = (book: Book) => {
        setEditingId(book.id)
        setTitle(book.title)
        setDescription(book.description)
        setCurrentCoverUrl(book.cover_url)
        setCoverFile(null)
        setErrorMsg(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить книгу? Все главы этой книги тоже будут удалены. Это действие необратимо.')) return

        try {
            const res = await fetch('/api/admin/books', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })

            if (!res.ok) {
                const data = await res.json()
                setErrorMsg(`Ошибка удаления: ${data.error || 'неизвестная ошибка'}`)
                return
            }

            await loadBooks()
        } catch (err) {
            setErrorMsg('Ошибка удаления книги')
            console.error(err)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg(null)

        let cover_url = editingId ? currentCoverUrl : ''

        if (coverFile) {
            const fileName = `${Date.now()}-${coverFile.name}`
            const { error: uploadError } = await supabase.storage
                .from('covers')
                .upload(fileName, coverFile)

            if (uploadError) {
                setErrorMsg(`Ошибка загрузки обложки: ${uploadError.message}`)
                setLoading(false)
                return
            }

            const { data: urlData } = supabase.storage.from('covers').getPublicUrl(fileName)
            cover_url = urlData.publicUrl
        }

        if (editingId) {
            // Редактирование существующей книги
            const res = await fetch('/api/admin/books', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingId,
                    title,
                    description,
                    cover_url,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                setErrorMsg(`Ошибка сохранения книги: ${data.error || 'неизвестная ошибка'}`)
            } else {
                resetForm()
                await loadBooks()
            }
        } else {
            // Создание новой книги
            const slug = slugify(title)

            const { error } = await supabase.from('books').insert({
                id: crypto.randomUUID(),
                slug,
                title,
                description,
                cover_url,
            })

            if (error) {
                setErrorMsg(`Ошибка сохранения книги: ${error.message}`)
            } else {
                resetForm()
                await loadBooks()
            }
        }

        setLoading(false)
    }

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Книги</h1>
            <p className="text-gray-500 mb-8">Управление библиотекой</p>

            <form
                onSubmit={handleSubmit}
                className="mb-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4"
            >
                {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {errorMsg}
                    </div>
                )}

                {editingId && (
                    <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100 flex justify-between items-center">
                        <span>Редактирование книги</span>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-blue-700 underline hover:text-blue-900"
                        >
                            Отменить
                        </button>
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Название книги"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                    placeholder="Описание"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {editingId && currentCoverUrl && !coverFile && (
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-16 rounded overflow-hidden bg-gray-100 shrink-0">
                            <Image
                                src={currentCoverUrl}
                                alt="Текущая обложка"
                                fill
                                sizes="48px"
                                className="object-cover"
                            />
                        </div>
                        <span className="text-sm text-gray-500">Текущая обложка (выберите файл, чтобы заменить)</span>
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                    className="w-full p-3 border border-gray-200 rounded-lg"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                    {loading ? 'Сохранение...' : editingId ? 'Сохранить изменения' : 'Добавить книгу'}
                </button>
            </form>

            <div className="space-y-3">
                {books.map((book) => (
                    <div
                        key={book.id}
                        className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex justify-between items-center gap-4"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            {book.cover_url && (
                                <div className="relative w-12 h-16 rounded overflow-hidden bg-gray-100 shrink-0">
                                    <Image
                                        src={book.cover_url}
                                        alt={book.title}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-gray-900">{book.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-1">{book.description}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Link
                                href={`/admin/books/${book.id}/chapters`}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium whitespace-nowrap"
                            >
                                Главы →
                            </Link>
                            <button
                                onClick={() => handleEdit(book)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium whitespace-nowrap"
                            >
                                Изменить
                            </button>
                            <button
                                onClick={() => handleDelete(book.id)}
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium whitespace-nowrap"
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