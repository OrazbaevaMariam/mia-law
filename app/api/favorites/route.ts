import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { chapterId, bookSlug, percent } = await request.json()

        if (!chapterId || !bookSlug) {
            return NextResponse.json({ error: 'Missing chapterId or bookSlug' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('reading_progress')
            .upsert(
                {
                    user_id: user.id,
                    book_id: bookSlug,
                    chapter_id: chapterId,
                    percent: percent ?? 0,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,book_id,chapter_id' }
            )

        if (error) throw error

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('log-progress error:', error)
        return NextResponse.json({ error: 'Failed to log progress' }, { status: 500 })
    }
}