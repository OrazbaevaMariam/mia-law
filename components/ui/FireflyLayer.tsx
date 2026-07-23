'use client'

import { useEffect, useState } from 'react'

interface Firefly {
    id: number
    top: string
    left: string
    width: string
    height: string
    animationDelay: string
    animationDuration: string
}

export function FireflyLayer() {
    const [fireflies, setFireflies] = useState<Firefly[]>([])

    useEffect(() => {
        // Генерируем светлячки только на клиенте
        const generateFireflies = (): Firefly[] => {
            return Array.from({ length: 20 }, (_, i) => ({
                id: i,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${3 + Math.random() * 3}px`,
                height: `${3 + Math.random() * 3}px`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
            }))
        }

        setFireflies(generateFireflies())
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
            {fireflies.map((f) => (
                <div
                    key={f.id}
                    className="firefly"
                    style={{
                        top: f.top,
                        left: f.left,
                        width: f.width,
                        height: f.height,
                        position: 'absolute',
                        background: 'radial-gradient(circle, rgba(255,200,87,0.8), transparent)',
                        borderRadius: '50%',
                        boxShadow: '0 0 10px rgba(255,200,87,0.6)',
                        animationDelay: f.animationDelay,
                        animationDuration: f.animationDuration,
                        animation: 'float 8s infinite ease-in-out',
                    }}
                />
            ))}
        </div>
    )
}