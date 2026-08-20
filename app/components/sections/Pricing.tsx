'use client'

import { useEffect, useRef, useState } from 'react'

export default function Pricing() {
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

  const plans = [
    { id: 1, name: 'Базовый', price: '2999', features: ['Доступ к книгам', 'Видеокурсы'] },
    { id: 2, name: 'Профессиональный', price: '5999', features: ['Все из базового', 'Персональный наставник'] },
    { id: 3, name: 'Премиум', price: '9999', features: ['Все услуги', 'Сертификат'] },
  ]

  return (
    <section ref={ref} className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className={`text-4xl font-bold mb-12 text-center transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          Наши тарифы
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className={`border rounded-lg p-8 transition-all duration-1000 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <p className="text-3xl font-bold text-blue-500 mb-6">₽{plan.price}</p>
              <ul className="space-y-2 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-gray-600">✓ {feature}</li>
                ))}
              </ul>
              <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
                Выбрать план
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
