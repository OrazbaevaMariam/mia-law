// components/reader/ReaderView.tsx
'use client'

import { useState, useEffect } from 'react'

type ReaderTheme = 'sepia' | 'dark' | 'black'

const themeStyles: Record<ReaderTheme, string> = {
    sepia: 'bg-readerSepia text-readerSepiaText',
    dark: 'bg-readerDark text-readerDarkText',
    black: 'bg-readerBlack text-readerBlackText',
}

type Settings = { theme: ReaderTheme; fontSize: number; width: number }

function getInitialSettings(): Settings {
    if (typeof window === 'undefined') {
        return { theme: 'sepia', fontSize: 20, width: 680 }
    }
    const saved = localStorage.getItem('reader-settings')
    return saved ? JSON.parse(saved) : { theme: 'sepia', fontSize: 20, width: 680 }
}

export default function ReaderView({ content }: { content: string }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings)
    const { theme, fontSize, width } = settings

    useEffect(() => {
        localStorage.setItem('reader-settings', JSON.stringify(settings))
    }, [settings])

    const setTheme = (theme: ReaderTheme) => setSettings((s) => ({ ...s, theme }))
    const setFontSize = (updater: (f: number) => number) =>
        setSettings((s) => ({ ...s, fontSize: updater(s.fontSize) }))
    const setWidth = (width: number) => setSettings((s) => ({ ...s, width }))

    return (
        <div className={`min-h-screen transition-colors duration-500 ${themeStyles[theme]}`}>
            <div className="sticky top-0 z-10 backdrop-blur-md bg-black/5 border-b border-black/10 py-3">
                <div className="max-w-[680px] mx-auto px-6 flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTheme('sepia')}
                            className={`w-8 h-8 rounded-full bg-readerSepia border-2 ${theme === 'sepia' ? 'border-gold' : 'border-transparent'}`}
                            aria-label="Сепия тема"
                        />
                        <button
                            onClick={() => setTheme('dark')}
                            className={`w-8 h-8 rounded-full bg-readerDark border-2 ${theme === 'dark' ? 'border-gold' : 'border-transparent'}`}
                            aria-label="Тёмная тема"
                        />
                        <button
                            onClick={() => setTheme('black')}
                            className={`w-8 h-8 rounded-full bg-readerBlack border-2 ${theme === 'black' ? 'border-gold' : 'border-transparent'}`}
                            aria-label="Чёрная тема"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setFontSize((f) => Math.max(14, f - 2))} className="text-sm font-serif px-2">A-</button>
                        <span className="text-xs opacity-60">{fontSize}px</span>
                        <button onClick={() => setFontSize((f) => Math.min(28, f + 2))} className="text-lg font-serif px-2">A+</button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setWidth(560)} className="text-xs opacity-60 hover:opacity-100">Узко</button>
                        <button onClick={() => setWidth(680)} className="text-xs opacity-60 hover:opacity-100">Средне</button>
                        <button onClick={() => setWidth(820)} className="text-xs opacity-60 hover:opacity-100">Широко</button>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-6 py-20" style={{ maxWidth: `${width}px` }}>
                <p className="font-lora leading-[1.9] tracking-wide" style={{ fontSize: `${fontSize}px` }}>
                    {content}
                </p>
            </div>
        </div>
    )
}