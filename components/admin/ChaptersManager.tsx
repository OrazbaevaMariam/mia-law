'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/shared/lib/supabaseClient'
import { Edit2, Trash2, Plus } from 'lucide-react'

interface Book {
    id: string
    title: string
}

interface Chapter {
    id: string
    title: string
    order_index: number
    is_free: boolean
    content: string
}

interface FormState {
    title: string
    content: string
    order_index: number
    is_free: boolean
}

const INITIAL_STATE: FormState = {
    title: '',
    content: '',
    order_index: 1,
    is_free: true,
}

export function ChaptersManager() {
    const [books, setBooks] = useState<Book[]>([])
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [selectedBookId, setSelectedBookId] = useState<string>('')
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState<FormState>(INITIAL_STATE)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClientSupabase()

    // Загрузка книг при монтировании
    useEffect(() => {
        const loadBooks = async () => {
            try {
                const { data } = await supabase.from('books').select('id,title')
                setBooks(data || [])
                if (data && data.length > 0) {
                    setSelectedBookId(data[0].id)
                }
            } catch (error) {
                console.error('Error loading books:', error)
            }
        }

        loadBooks()
    }, [supabase])

    // Загрузка глав при изменении selectedBookId
    useEffect(() => {
        if (!selectedBookId) return

        const loadChapters = async () => {
            try {
                const { data } = await supabase
                    .from('chapters')
                    .select('*')
                    .eq('book_id', selectedBookId)
                    .order('order_index', { ascending: true })

                setChapters(data || [])
            } catch (error) {
                console.error('Error loading chapters:', error)
            }
        }

        loadChapters()
    }, [selectedBookId, supabase])

    const saveChapter = async () => {
        if (!formData.title || !formData.content) {
            alert('Заполните название и содержание')
            return
        }

        setIsLoading(true)

        try {
            if (editingId) {
                await supabase
                    .from('chapters')
                    .update(formData)
                    .eq('id', editingId)
            } else {
                await supabase.from('chapters').insert({
                    ...formData,
                    book_id: selectedBookId,
                    id: `chapter-${Date.now()}`,
                })
            }

            // Перезагружаем главы
            const { data } = await supabase
                .from('chapters')
                .select('*')
                .eq('book_id', selectedBookId)
                .order('order_index', { ascending: true })

            setChapters(data || [])
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

    const deleteChapter = async (id: string) => {
        if (!confirm('Вы уверены?')) return

        try {
            await supabase.from('chapters').delete().eq('id', id)

            // Перезагружаем главы
            const { data } = await supabase
                .from('chapters')
                .select('*')
                .eq('book_id', selectedBookId)
                .order('order_index', { ascending: true })

            setChapters(data || [])
        } catch (error) {
            console.error('Error:', error)
            alert('Ошибка при удалении')
        }
    }

    const handleEdit = (chapter: Chapter) => {
        setFormData({
            title: chapter.title,
            content: chapter.content,
            order_index: chapter.order_index,
            is_free: chapter.is_free,
        })
        setEditingId(chapter.id)
        setShowForm(true)
    }

    const handleCancel = () => {
        setFormData(INITIAL_STATE)
        setEditingId(null)
        setShowForm(false)
    }

    return (
        <div>
            <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="mb-4 p-2 border border-burgundy/20 rounded font-serif"
            >
                <option value="">Выберите книгу</option>
                {books.map((book) => (
                    <option key={book.id} value={book.id}>
                        {book.title}
                    </option>
                ))}
            </select>

            <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-burgundy text-warmBg rounded font-serif mb-6 hover:bg-burgundy/90"
            >
                <Plus className="w-5 h-5" /> Добавить главу
            </button>

            {showForm && selectedBookId && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        saveChapter()
                    }}
                    className="bg-burgundy/5 p-6 rounded-lg mb-6 border border-burgundy/20"
                >
                    <input
                        type="text"
                        placeholder="Название главы"
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
                        type="number"
                        placeholder="Номер главы"
                        value={formData.order_index}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                order_index: parseInt(e.target.value) || 1,
                            })
                        }
                        className="w-full p-2 border border-burgundy/20 rounded mb-3"
                    />
                    <textarea
                        placeholder="Содержание"
                        value={formData.content}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                content: e.target.value,
                            })
                        }
                        className="w-full p-2 border border-burgundy/20 rounded mb-3 resize-none"
                        rows={6}
                    />
                    <label className="flex items-center gap-2 mb-4 cursor-pointer font-serif">
                        <input
                            type="checkbox"
                            checked={formData.is_free}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    is_free: e.target.checked,
                                })
                            }
                        />
                        Бесплатная
                    </label>
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

            {selectedBookId && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-burgundy/10">
                            <th className="p-3 text-left font-serif">
                                Глава
                            </th>
                            <th className="p-3 text-left font-serif">
                                Название
                            </th>
                            <th className="p-3 text-left font-serif">
                                Статус
                            </th>
                            <th className="p-3 text-center font-serif">
                                Действия
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {chapters.map((chapter) => (
                            <tr
                                key={chapter.id}
                                className="border-b hover:bg-burgundy/5"
                            >
                                <td className="p-3 font-serif">
                                    {chapter.order_index}
                                </td>
                                <td className="p-3">{chapter.title}</td>
                                <td className="p-3">
                                    {chapter.is_free ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                                Бесплатно
                                            </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                                Платно
                                            </span>
                                    )}
                                </td>
                                <td className="p-3 flex justify-center gap-2">
                                    <button
                                        onClick={() =>
                                            handleEdit(chapter)
                                        }
                                        className="p-2 hover:bg-burgundy/10 rounded"
                                        type="button"
                                    >
                                        <Edit2 className="w-4 h-4 text-burgundy" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            deleteChapter(chapter.id)
                                        }
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
            )}

            {selectedBookId && chapters.length === 0 && (
                <p className="text-center text-warmText py-8">Глав нет</p>
            )}
        </div>
    )
}