'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

interface Book {
  id: string
  title: string
  author: string
  cover_url: string
  slug: string
}

export default function ReaderPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setBooks(data || [])
      } catch (error) {
        console.error('Error fetching books:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [supabase])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>
  }

  return (
    <div className="bg-warmBg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif text-warmText mb-12">Мои истории</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <Link key={book.id} href={`/reader/${book.slug}`}>
              <div className="group cursor-pointer">
                <div className="aspect-[3/4] bg-[#2A2A2E] overflow-hidden rounded-lg">
                  {book.cover_url && (
                    <Image
                      src={book.cover_url}
                      alt={book.title}
                      width={300}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-serif text-warmText mb-2 group-hover:text-gold transition-colors">
                    {book.title}
                  </h2>
                  <p className="text-warmText/70">{book.author}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
