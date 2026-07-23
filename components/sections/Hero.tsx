// components/sections/Hero.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Typography'
import { FireflyLayer } from '@/components/ui/FireflyLayer'
import type { User } from '@supabase/supabase-js'

const line1 = 'Ты не случайно здесь.'
const line2 =
    'Есть истории, которые читают — и есть те, после которых ты уже не прежняя.'

function TypeReveal({
                        text,
                        delayStart = 0,
                    }: {
    text: string
    delayStart?: number
}) {
    return (
        <span className="inline-block">
            {text.split('').map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: delayStart + i * 0.02,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-block"
                >
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </span>
    )
}

interface HeroProps {
    user: User | null
    lastRead: { bookSlug: string; chapterId: string } | null
}

export function Hero({ user, lastRead }: HeroProps) {
    const buttonHref = lastRead ? `/book/${lastRead.bookSlug}/chapter/${lastRead.chapterId}` : '/books'
    const buttonText = lastRead ? 'Продолжить чтение' : 'Начать путешествие'

    return (
        // ⭐ ЗАМЕНИ эту строку с <section className="...">
        <section className="fairy-bg relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
            {/* ⭐ ДОБАВЬ эту строку сразу после открытия section */}
            <FireflyLayer />

            {/* Всё остальное ниже остаётся без изменений */}
            <div className="relative z-10 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    <Eyebrow>Добро пожаловать</Eyebrow>
                </motion.div>

                <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mt-6 mb-8 text-warmText">
                    <TypeReveal text={line1} delayStart={0.6} />
                </h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-muted font-serif text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    {line2}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.3, duration: 0.8 }}
                >
                    <Link href={buttonHref}>
                        <Button>{buttonText}</Button>
                    </Link>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted text-xs tracking-[0.3em] uppercase z-10"
            >
                Листай дальше
            </motion.div>
        </section>
    )
}