'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function BooksPreview() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const books = [
    { id: 1, title: 'Основы право', description: 'Введение в правовую систему' },
    { id: 2, title: 'Гражданское право', description: 'Основные концепции' },
    { id: 3, title: 'Уголовное право', description: 'Практические примеры' },
  ]

  return (
    <section ref={ref} className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className={`text-4xl font-bold mb-12 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          Наши книги
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {books.map((book) => (
            <div key={book.id} className={`bg-white p-6 rounded-lg shadow transition-all duration-1000 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <h3 className="text-xl font-bold mb-2">{book.title}</h3>
              <p className="text-gray-600 mb-4">{book.description}</p>
              <Link href={`/book/${book.id}`} className="text-blue-500 hover:text-blue-700">
                Читать →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
