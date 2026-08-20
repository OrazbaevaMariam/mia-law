"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase-client'

interface Book {
  id: string
  title: string
  description: string
  cover_url: string
  author: string
}

export default function ReaderPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
      
      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Загрузка...</div>

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Моя библиотека</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {books.map((book) => (
          <Link key={book.id} href={`/reader/${book.id}`}>
            <div className="cursor-pointer hover:shadow-lg transition">
              {book.cover_url && (
                <Image 
                  src={book.cover_url} 
                  alt={book.title}
                  width={200}
                  height={300}
                  className="w-full h-64 object-cover rounded"
                />
              )}
              <h2 className="text-xl font-bold mt-4">{book.title}</h2>
              <p className="text-gray-600">{book.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
