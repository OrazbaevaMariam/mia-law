'use client'

import { useEffect, useRef, useState } from 'react'

export default function About() {
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

  return (
    <section ref={ref} className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div
          className={`transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl font-bold mb-8 text-center text-slate-900">
            Об авторе
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                Я пишу истории, которые переносят читателей в совершенно другие миры. 
                За 12 лет написания я создал более 450 уникальных историй, каждая из которых — 
                отдельная реальность со своими правилами и законами.
              </p>
              <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                Мои миры не повторяют друг друга. Каждый мир имеет свою уникальную магику, 
                персонажей и судьбы, которые плетут ткань неповторимых приключений.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Сейчас я хочу поделиться самыми важными историями с вами — теми, 
                которые изменили мою жизнь и помогут изменить вашу.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <div className="text-5xl font-bold mb-4">450+</div>
              <div className="text-xl mb-8">историй создано</div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm opacity-80">Лет писательства</div>
                  <div className="text-3xl font-bold">12</div>
                </div>
                <div>
                  <div className="text-sm opacity-80">Законченных книг</div>
                  <div className="text-3xl font-bold">3</div>
                </div>
                <div>
                  <div className="text-sm opacity-80">Уникальных миров</div>
                  <div className="text-3xl font-bold">∞</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-8 bg-slate-50 rounded-xl border-l-4 border-blue-600">
            <p className="text-lg text-slate-800 italic">
              "Каждая история — это приглашение. Приглашение забыть о реальности и найти 
              себя в другом мире. Я создаю миры для тех, кто ищет бегства, вдохновения 
              и истин, которые живут только в фантазии."
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
