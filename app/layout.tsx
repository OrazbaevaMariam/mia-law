// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

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
        <html lang="ru">
        <head>
            <link
                href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lora:wght@400;500;600&display=swap"
                rel="stylesheet"
            />
        </head>
        <body>
        {children}
        </body>
        </html>
    )
}