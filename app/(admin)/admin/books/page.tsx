'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Book {
    id: string
    title: string
    created_at: string
}

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')

    useEffect(() => {
        const loadBooks = async () => {
            const { data } = await supabase
                .from('books')
                .select('*')
                .order('title')
            setBooks((data as Book[]) ?? [])
        }
        
        loadBooks()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('books').insert({
            title,
        })

        if (!error) {
            setTitle('')
            const { data } = await supabase
                .from('books')
                .select('*')
                .order('title')
            setBooks((data as Book[]) ?? [])
        }

        setLoading(false)
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Управление книгами</h1>

            <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
                <input
                    type="text"
                    placeholder="Название книги"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full mb-4 p-2 border rounded"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Сохранение...' : 'Добавить книгу'}
                </button>
            </form>

            <div className="space-y-4">
                {books.map((book) => (
                    <Link
                        key={book.id}
                        href={`/admin/books/${book.id}/chapters`}
                        className="block p-4 border rounded hover:bg-gray-50"
                    >
                        <h3 className="font-bold text-lg">{book.title}</h3>
                    </Link>
                ))}
            </div>
        </div>
    )
}
