"use client"

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import CommentsSection from "@/app/components/CommentsSection";

interface Book {
  id: string
  title: string
  cover_url: string
  description?: string
  tags?: string[]
  slug: string
}

interface Chapter {
  id: string
  title: string
  order_index: number
}

export default function BookPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [book, setBook] = useState<Book | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  const fetchData = useCallback(async () => {
    if (!slug) return

    try {
      const { data: bookData, error } = await supabase
          .from('books')
          .select('*')
          .eq('slug', slug)
          .single()

      if (error || !bookData) {
        console.error('Error fetching book:', JSON.stringify(error), 'bookData:', bookData)
        setBook(null)
        setLoading(false)
        return
      }

      setBook(bookData)

      // Получи главы
      const { data: chaptersData } = await supabase
          .from('chapters')
          .select('id, title, order_index')
          .eq('book_id', bookData.id)
          .order('order_index', { ascending: true })

      setChapters(chaptersData || [])

      // Проверь, в избранном ли
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: fav } = await supabase
            .from('favorites')
            .select('id')
            .eq('book_id', bookData.id)
            .eq('user_id', session.user.id)
            .single()
        setIsFavorite(!!fav)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return <div className="p-8">Загрузка...</div>
  }

  if (!book) {
    return <div className="p-8">Книга не найдена</div>
  }

  return (
      <main className="min-h-screen bg-archive-cream pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">

          {/* Основной макет: слева обложка, справа текст */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">

            {/* Левая колонка: обложка + кнопки */}
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="relative w-full aspect-[3/4] mb-6 rounded-lg overflow-hidden shadow-lg">
                <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    className="object-cover"
                    priority
                    loading="eager"
                />
              </div>

              {/* Избранное + Читать */}
              <div className="flex gap-4 w-full justify-center mb-4">
                <button
                    onClick={async () => {
                      const { data: { session } } = await supabase.auth.getSession()
                      if (!session) return

                      if (isFavorite) {
                        await supabase
                            .from('favorites')
                            .delete()
                            .eq('book_id', book.id)
                            .eq('user_id', session.user.id)
                      } else {
                        await supabase
                            .from('favorites')
                            .insert({
                              book_id: book.id,
                              user_id: session.user.id,
                            })
                      }
                      setIsFavorite(!isFavorite)
                    }}
                    className={`px-4 py-2 rounded-lg text-lg transition-colors ${
                        isFavorite
                            ? 'bg-burgundy text-white'
                            : 'bg-antique-gold/20 text-burgundy hover:bg-antique-gold/40'
                    }`}
                >
                  ❤️
                </button>

                <Link
                    href={`/reader/${slug}/${chapters[0]?.id || ''}`}
                    className="flex-1 px-4 py-2 bg-antique-gold text-white rounded-lg text-center hover:bg-ink transition-colors font-interface"
                >
                  Погрузиться в историю
                </Link>
              </div>
            </div>

            {/* Правая колонка: информация о книге */}
            <div className="md:col-span-2">
              {/* Название */}
              <h1 className="font-display text-h1 text-ink mb-4">{book.title}</h1>

              {/* Тэги */}
              {book.tags && book.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {book.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-3 py-1 bg-antique-gold/20 text-archive-olive rounded-full text-sm font-interface"
                        >
                    {tag}
                  </span>
                    ))}
                  </div>
              )}

              {/* Описание */}
              <div className="prose prose-sm max-w-none mb-8">
                <h2 className="font-display text-h3 text-ink mb-2">Аннотация</h2>
                <p className="font-reader text-reader-text leading-relaxed whitespace-pre-wrap">
                  {book.description}
                </p>
              </div>

              {/* Содержание */}
              {chapters.length > 0 && (
                  <div className="bg-archive-olive/5 rounded-lg p-6 border border-archive-olive/20">
                    <h2 className="font-display text-h3 text-ink mb-4">Содержание</h2>
                    <nav className="space-y-2">
                      {chapters.map((chapter) => (
                          <Link
                              key={chapter.id}
                              href={`/reader/${slug}/${chapter.id}`}
                              className="block px-4 py-2 rounded-lg text-reader-text hover:bg-antique-gold/20 transition-colors font-reader"
                          >
                            {chapter.title}
                          </Link>
                      ))}
                    </nav>
                  </div>
              )}
            </div>
          </div>

          {/* Комментарии снизу на всю ширину */}
          <div className="max-w-4xl mx-auto">
            <CommentsSection bookId={book.id} />
          </div>
        </div>
      </main>
  )
}