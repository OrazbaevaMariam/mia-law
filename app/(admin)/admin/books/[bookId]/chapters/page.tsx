'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Chapter {
    id: string
    book_id: string
    title: string
    content: string
    order_index: number
    created_at: string
}

export default function ChaptersPage({ params }: { params: { bookId: string } }) {
    const bookId = params.bookId
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    useEffect(() => {
        const loadChapters = async () => {
            const { data } = await supabase
                .from('chapters')
                .select('*')
                .eq('book_id', bookId)
                .order('order_index', { ascending: true })
            setChapters((data as Chapter[]) ?? [])
        }
        
        loadChapters()
    }, [bookId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('chapters').insert({
            book_id: bookId,
            title,
            content,
            order_index: chapters.length + 1,
        })

        if (!error) {
            setTitle('')
            setContent('')
            const { data } = await supabase
                .from('chapters')
                .select('*')
                .eq('book_id', bookId)
                .order('order_index', { ascending: true })
            setChapters((data as Chapter[]) ?? [])
        }

        setLoading(false)
    }

    return (
        <div className="p-6">
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
                    placeholder="Содержание"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="w-full mb-4 p-2 border rounded h-32"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Сохранение...' : 'Добавить главу'}
                </button>
            </form>

            <div className="space-y-4">
                {chapters.map((chapter) => (
                    <div key={chapter.id} className="p-4 border rounded hover:bg-gray-50">
                        <h3 className="font-bold text-lg">{chapter.title}</h3>
                        <p className="text-sm text-gray-600">Глава {chapter.order_index}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
