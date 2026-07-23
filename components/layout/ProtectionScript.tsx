// components/layout/ProtectionScript.tsx
'use client'

import { useEffect } from 'react'

export function ProtectionScript() {
    useEffect(() => {
        // 1. Запретить F12, Ctrl+Shift+I, Ctrl+Shift+C
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))
            ) {
                e.preventDefault()
            }
        }

        // 2. Запретить правый клик на reader
        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (target?.closest('article')) {
                e.preventDefault()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('contextmenu', handleContextMenu)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [])

    return null
}