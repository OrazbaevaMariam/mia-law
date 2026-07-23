'use client'

import { useEffect, useRef, useState } from 'react'

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Попробуй бесплатно',
    features: [
      'Первые 2 главы каждой книги',
      'Доступ к превью',
      'Ограниченный функционал',
    ],
    cta: 'Начать бесплатно',
    highlight: false
  },
  {
    name: 'Premium',
    price: '9.99',
    period: '/месяц',
    description: 'Полный доступ к библиотеке',
    features: [
      '✓ Все книги полностью',
      '✓ Неограниченное чтение',
      '✓ Новые книги первыми',
      '✓ Без реклам',
      '✓ Офлайн режим',
    ],
    cta: 'Подписаться',
    highlight: true
  },
  {
    name: 'Lifetime',
    price: '49.99',
    description: 'Вечный доступ',
    features: [
      '✓ Всё из Premium',
      '✓ Один раз навсегда',
      '✓ Все будущие книги',
      '✓ Приватный контент',
      '✓ Прямой контакт с автором',
    ],
    cta: 'Купить навсегда',
    highlight: false
  }
]

export default function Pricing() {
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
    <section ref={ref} className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center text-slate-900">
          Выбери свой путь
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`transition-all duration-1000 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } ${
                plan.highlight
                  ? 'md:scale-105 ring-2 ring-blue-600'
                  : ''
              }`}
              style={{ transitionDelay: `${idx * 200}ms` }}
            >
              <div className={`rounded-xl p-8 h-full flex flex-col ${
                plan.highlight
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                  : 'bg-slate-50 text-slate-900'
              }`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`mb-6 text-sm ${plan.highlight ? 'opacity-90' : 'text-slate-600'}`}>
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.period && <span className="text-sm opacity-75">{plan.period}</span>}
                </div>

                <ul className="mb-8 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm">
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-white text-blue-600 hover:bg-slate-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
