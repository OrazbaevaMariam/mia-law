'use client'

import { useEffect, useState } from 'react'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
      <div className="max-w-2xl text-center px-4">
        <div
          className={`transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Миры без границ
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
            Погрузись в истории, где каждое слово — портал в новую реальность
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105">
            Открыть историю
          </button>
        </div>
      </div>
    </section>
  )
}
