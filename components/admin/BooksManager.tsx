'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/shared/lib/supabaseClient'
import { Edit2, Trash2, Plus } from 'lucide-react'

interface Book {
    id: string
    title: string
    slug: string
    description: string
    cover_url?: string
}

interface FormState {
    title: string
    slug: string
    description: string
    cover_url: string
}

const INITIAL_STATE: FormState = {
    title: '',
    slug: '',
    description: '',
    cover_url: '',
}

export function BooksManager() {
    const [books, setBooks] = useState<Book[]>([])
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState<FormState>(INITIAL_STATE)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClientSupabase()

    // Только fetch, БЕЗ setState
    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await supabase
                    .from('books')
                    .select('*')
                    .order('created_at', { ascending: false })

                setBooks(data || [])
            } catch (error) {
                console.error('Error:', error)
            }
        }

        load()
    }, [supabase])

    const saveBook = async () => {
        if (!formData.title || !formData.slug) {
            alert('Заполните название и slug')
            return
        }

        setIsLoading(true)

        try {
            if (editingId) {
                await supabase
                    .from('books')
                    .update(formData)
                    .eq('id', editingId)
            } else {
                await supabase.from('books').insert({
                    ...formData,
                    id: formData.slug,
                })
            }

            // Перезагружаем список
            const { data } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false })

            setBooks(data || [])
            setFormData(INITIAL_STATE)
            setEditingId(null)
            setShowForm(false)
        } catch (error) {
            console.error('Error:', error)
            alert('Ошибка при сохранении')
        } finally {
            setIsLoading(false)
        }
    }

    const deleteBook = async (id: string) => {
        if (!confirm('Вы уверены?')) return

        try {
            await supabase.from('books').delete().eq('id', id)

            // Перезагружаем список
            const { data } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false })

            setBooks(data || [])
        } catch (error) {
            console.error('Error:', error)
            alert('Ошибка при удалении')
        }
    }

    const handleEdit = (book: Book) => {
        setFormData({
            title: book.title,
            slug: book.slug,
            description: book.description,
            cover_url: book.cover_url || '',
        })
        setEditingId(book.id)
        setShowForm(true)
    }

    const handleCancel = () => {
        setFormData(INITIAL_STATE)
        setEditingId(null)
        setShowForm(false)
    }

    return (
        <div>
            <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-burgundy text-warmBg rounded font-serif mb-6 hover:bg-burgundy/90"
            >
                <Plus className="w-5 h-5" /> Добавить книгу
            </button>

            {showForm && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        saveBook()
                    }}
                    className="bg-burgundy/5 p-6 rounded-lg mb-6 border border-burgundy/20"
                >
                    <input
                        type="text"
                        placeholder="Название"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                title: e.target.value,
                            })
                        }
                        className="w-full p-2 border border-burgundy/20 rounded mb-3"
                    />
                    <input
                        type="text"
                        placeholder="Slug (для URL)"
                        value={formData.slug}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                slug: e.target.value,
                            })
                        }
                        className="w-full p-2 border border-burgundy/20 rounded mb-3"
                    />
                    <textarea
                        placeholder="Описание"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            })
                        }
                        className="w-full p-2 border border-burgundy/20 rounded mb-3 resize-none"
                        rows={3}
                    />
                    <input
                        type="text"
                        placeholder="URL обложки"
                        value={formData.cover_url}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                cover_url: e.target.value,
                            })
                        }
                        className="w-full p-2 border border-burgundy/20 rounded mb-4"
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-burgundy text-warmBg rounded font-serif hover:bg-burgundy/90 disabled:opacity-50"
                        >
                            {editingId ? 'Обновить' : 'Добавить'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 bg-warmBgAccent rounded"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-burgundy/10">
                        <th className="p-3 text-left font-serif">
                            Название
                        </th>
                        <th className="p-3 text-left font-serif">Slug</th>
                        <th className="p-3 text-center font-serif">
                            Действия
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {books.map((book) => (
                        <tr
                            key={book.id}
                            className="border-b hover:bg-burgundy/5"
                        >
                            <td className="p-3">{book.title}</td>
                            <td className="p-3 text-warmText text-sm">
                                {book.slug}
                            </td>
                            <td className="p-3 flex justify-center gap-2">
                                <button
                                    onClick={() => handleEdit(book)}
                                    className="p-2 hover:bg-burgundy/10 rounded"
                                    type="button"
                                >
                                    <Edit2 className="w-4 h-4 text-burgundy" />
                                </button>
                                <button
                                    onClick={() => deleteBook(book.id)}
                                    className="p-2 hover:bg-red-100 rounded text-red-600"
                                    type="button"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {books.length === 0 && (
                <p className="text-center text-warmText py-8">Книг нет</p>
            )}
        </div>
    )
}