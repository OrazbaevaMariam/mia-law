// components/book/FavoriteButton.tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/shared/lib/supabaseClient'

export default function FavoriteButton({ bookId, userId, initialFav }: {
    bookId: string; userId: string; initialFav: boolean
}) {
    const [isFav, setIsFav] = useState(initialFav)

    const toggle = async () => {
        if (isFav) {
            await supabase.from('favorites').delete().eq('user_id', userId).eq('book_id', bookId)
        } else {
            await supabase.from('favorites').insert({ user_id: userId, book_id: bookId })
        }
        setIsFav(!isFav)
    }

    return (
        <button onClick={toggle} className="text-2xl transition-transform hover:scale-110">
            {isFav ? '❤️' : '🤍'}
        </button>
    )
}