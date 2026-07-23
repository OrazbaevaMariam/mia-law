'use client'

import { useEffect, useRef, useState } from 'react'

const posts = [
  {
    id: 1,
    title: 'История создания первой книги',
    excerpt: 'Как я писал свою первую книгу 12 лет назад...',
    date: '22 июля 2026',
    category: 'За кулисами'
  },
  {
    id: 2,
    title: 'Вдохновение и источники',
    excerpt: 'Откуда берут идеи авторы фантастики?',
    date: '15 июля 2026',
    category: 'Размышления'
  },
  {
    id: 3,
    title: 'Новая глава дилогии готова!',
    excerpt: 'Вторая часть дилогии скоро будет доступна...',
    date: '10 июля 2026',
    category: 'Новости'
  }
]

export default function Blog() {
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
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center text-slate-900">
          Блог и новости
        </h2>

        <div className="space-y-6">
          {posts.map((post, idx) => (
            <div
              key={post.id}
              className={`transition-all duration-1000 transform ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-slate-500">{post.date}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-slate-600">
                  {post.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
