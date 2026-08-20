'use client'

import { useEffect, useRef, useState } from 'react'

export default function Blog() {
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

  const posts = [
    { id: 1, title: 'Новые изменения в законодательстве', date: '23 июля 2026', excerpt: 'Обзор последних изменений...' },
    { id: 2, title: 'Как правильно составить договор', date: '20 июля 2026', excerpt: 'Практические советы...' },
    { id: 3, title: 'Защита прав потребителей', date: '18 июля 2026', excerpt: 'Важная информация...' },
  ]

  return (
    <section ref={ref} className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className={`text-4xl font-bold mb-12 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          Блог
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className={`bg-white p-6 rounded-lg shadow transition-all duration-1000 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <time className="text-sm text-gray-500">{post.date}</time>
              <h3 className="text-xl font-bold my-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <a href={`/blog/${post.id}`} className="text-blue-500 hover:text-blue-700">
                Читать далее →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
