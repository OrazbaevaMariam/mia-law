// shared/hooks/useAuth.ts
'use client'

import { useEffect, useState } from 'react'
import { createClientSupabase } from '@/shared/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClientSupabase()

        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }

        getUser()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    return { user, loading }
}