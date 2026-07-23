// components/reader/ReaderContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ReaderContextType {
    fontSize: number
    setFontSize: (size: number) => void
    isTocOpen: boolean
    setIsTocOpen: (open: boolean) => void
}

const ReaderContext = createContext<ReaderContextType | null>(null)

const FONT_SIZE_KEY = 'reader_font_size'
const DEFAULT_FONT_SIZE = 18
const MIN_FONT_SIZE = 14
const MAX_FONT_SIZE = 28

export function ReaderProvider({ children }: { children: ReactNode }) {
    const [fontSize, setFontSizeState] = useState(DEFAULT_FONT_SIZE)
    const [isTocOpen, setIsTocOpen] = useState(false)

    // Загружаем сохранённый размер шрифта при монтировании (при переходе между главами)
    useEffect(() => {
        const saved = localStorage.getItem(FONT_SIZE_KEY)
        if (saved) {
            setFontSizeState(parseInt(saved))
        }
    }, [])

    const setFontSize = (size: number) => {
        const clamped = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, size))
        setFontSizeState(clamped)
        localStorage.setItem(FONT_SIZE_KEY, clamped.toString())
    }

    return (
        <ReaderContext.Provider
            value={{ fontSize, setFontSize, isTocOpen, setIsTocOpen }}
        >
            {children}
        </ReaderContext.Provider>
    )
}

export function useReader() {
    const context = useContext(ReaderContext)
    if (!context) {
        throw new Error('useReader must be used within ReaderProvider')
    }
    return context
}