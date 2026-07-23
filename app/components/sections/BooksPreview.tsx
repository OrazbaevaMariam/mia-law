'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const books = [
  {
    id: 1,
    title: 'Первая книга',
    description: 'Описание первой книги...',
    chapters: 15,
    image: '📖'
  },
  {
    id: 2,
    title: 'Дилогия: Часть 1',
    description: 'Первая часть дилогии...',
    chapters: 20,
    image: '📚'
  },
  {
    id: 3,
    title: 'Дилогия: Часть 2',
    description: 'Вторая часть дилогии (в работе)...',
    chapters: 12,
    image: '✨'
  }
]

export default function BooksPreview() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.3 }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-20 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center text-slate-900">
          Мои произведения
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {books.map((book, idx) => (
            <div
              key={book.id}
              className={`transition-all duration-1000 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${idx * 200}ms` }}
            >
              <Link href={`/book/${book.id}`}>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer overflow-hidden h-full">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-40 flex items-center justify-center text-6xl">
                    {book.image}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-slate-900">
                      {book.title}
                    </h3>
                    <p className="text-slate-600 mb-4">{book.description}</p>
                    <div className="text-sm text-slate-500">
                      {book.chapters} глав
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
