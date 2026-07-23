'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

interface Book {
  id: string
  title: string
  author: string
  cover_url: string
  content: string
}

export default function ReaderPage({ params }: { params: { slug: string } }) {
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState(16)
  const supabase = createClient()

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('slug', params.slug)
          .single()

        if (error) throw error
        setBook(data)
      } catch (error) {
        console.error('Error fetching book:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [params.slug, supabase])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>
  }

  if (!book) {
    return <div className="flex items-center justify-center min-h-screen">Книга не найдена</div>
  }

  return (
    <div className="bg-warmBg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {book.cover_url && (
            <div className="w-48 h-72 mb-8 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={book.cover_url}
                alt={book.title}
                width={192}
                height={288}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-serif tracking-wide text-warmText mb-4">
              {book.title}
            </h1>
            <p className="text-xl text-warmText/70 mb-6">{book.author}</p>
            
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                className="px-4 py-2 bg-gold text-warmBg rounded hover:bg-gold/90"
              >
                A−
              </button>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className="px-4 py-2 bg-gold text-warmBg rounded hover:bg-gold/90"
              >
                A+
              </button>
            </div>

            <div
              className="prose prose-invert max-w-none"
              style={{ fontSize: `${fontSize}px` }}
              dangerouslySetInnerHTML={{ __html: book.content }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
