import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

const DEDUP_WINDOW_MINUTES = 30

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Rate limit: не более 20 запросов в минуту на пользователя
        const { allowed } = await checkRateLimit(user.id, 'log-view')
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }

        const { chapterId } = await request.json()
        if (!chapterId) {
            return NextResponse.json({ error: 'chapterId is required' }, { status: 400 })
        }

        // Проверяем реальный доступ к главе на сервере
        const { data: chapterData } = await supabase
            .from('chapters')
            .select('id, is_free, order_index, book_id')
            .eq('id', chapterId)
            .single()

        if (!chapterData) {
            return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
        }

        let hasAccess = chapterData.is_free || chapterData.order_index <= 2

        if (!hasAccess) {
            // Проверяем покупку конкретной книги
            const { data: purchase } = await supabase
                .from('purchases')
                .select('id')
                .eq('user_id', user.id)
                .eq('book_id', chapterData.book_id)
                .maybeSingle()

            if (purchase) {
                hasAccess = true
            } else {
                // Проверяем активную подписку
                const { data: subscription } = await supabase
                    .from('subscriptions')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .maybeSingle()

                hasAccess = !!subscription
            }
        }

        if (!hasAccess) {
            return NextResponse.json({ success: false, reason: 'no_access' })
        }

        // Дедупликация — не считаем повторный просмотр той же главы за 30 минут
        const dedupThreshold = new Date(Date.now() - DEDUP_WINDOW_MINUTES * 60 * 1000).toISOString()

        const { data: recentView } = await supabase
            .from('chapter_views')
            .select('id')
            .eq('user_id', user.id)
            .eq('chapter_id', chapterId)
            .gte('viewed_at', dedupThreshold)
            .limit(1)
            .maybeSingle()

        if (recentView) {
            return NextResponse.json({ success: true, deduped: true })
        }

        const { error } = await supabase
            .from('chapter_views')
            .insert({ user_id: user.id, chapter_id: chapterId })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to log chapter view:', error)
        return NextResponse.json({ error: 'Failed to log view' }, { status: 500 })
    }
}