// components/layout/Header.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClientSupabase } from '@/shared/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

export function Header() {
    const [userName, setUserName] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClientSupabase()
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUserName(user?.user_metadata?.full_name || user?.email?.split('@')[0] || null)
            setLoading(false)
        }
        void getUser()

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            void getUser()
        })

        return () => listener.subscription.unsubscribe()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUserName(null)
        router.push('/')
        router.refresh()
    }

    return (
        <header className="sticky top-0 z-50 bg-warmBg border-b border-burgundy/20 py-4">
            <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-serif text-burgundy">
                    Mia Law
                </Link>

                <nav className="flex items-center gap-6">
                    <Link href="/" className="text-warmText hover:text-burgundy transition-colors">
                        Главная
                    </Link>

                    <Link href="/books" className="text-warmText hover:text-burgundy transition-colors">
                        Библиотека
                    </Link>

                    <Link href="/favorites" className="flex items-center gap-1 text-warmText hover:text-burgundy transition-colors">
                        <Heart className="w-4 h-4" />
                        Избранное
                    </Link>

                    {!loading && (
                        userName ? (
                            <div className="flex items-center gap-4">
                                <span className="text-burgundy font-serif">{userName}</span>
                                <button
                                    onClick={() => void handleLogout()}
                                    className="text-sm text-warmText hover:text-burgundy transition-colors underline"
                                >
                                    Выйти
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-warmText hover:text-burgundy transition-colors">
                                    Войти
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 bg-burgundy text-warmBg rounded-lg font-serif hover:bg-burgundy/90 transition-colors"
                                >
                                    Регистрация
                                </Link>
                            </div>
                        )
                    )}
                </nav>
            </div>
        </header>
    )
}