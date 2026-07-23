import type { Metadata } from 'next'
import { Cinzel, Lora } from 'next/font/google'
import './globals.css'
import { Header } from '@/app/components/layout/Header'
import { Footer } from '@/app/components/layout/Footer'

const cinzel = Cinzel({
    subsets: ['cyrillic'],
    display: 'swap',
    variable: '--font-cinzel',
    weight: ['400', '600', '700'],
})

const lora = Lora({
    subsets: ['cyrillic'],
    display: 'swap',
    variable: '--font-lora',
    weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
    title: 'Mia Law - Библиотека историй',
    description: 'Коллекция литературных произведений',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru" className={`${cinzel.variable} ${lora.variable}`}>
            <body className="bg-dark">
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    )
}
