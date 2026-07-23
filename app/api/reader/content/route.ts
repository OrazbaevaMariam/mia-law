// app/api/reader/content/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

// Проверка подписки
const checkAccess = async (
    supabase: SupabaseClient,
    userId: string
): Promise<boolean> => {
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, plan')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

    return !!subscription
}

export async function GET(req: NextRequest) {
    const supabase = await createServerSupabase()

    // 1. Проверка авторизации
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    // 2. Проверка подписки
    const hasAccess = await checkAccess(supabase, user.id)

    if (!hasAccess) {
        return NextResponse.json(
            { error: 'No active subscription' },
            { status: 403 }
        )
    }

    // 3. Получить параметры
    const chapterId = req.nextUrl.searchParams.get('chapter_id')
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0')

    if (!chapterId) {
        return NextResponse.json(
            { error: 'Missing chapter_id' },
            { status: 400 }
        )
    }

    // 4. Загрузить главу
    const { data: chapter, error } = await supabase
        .from('chapters')
        .select('content')
        .eq('id', chapterId)
        .single()

    if (error || !chapter) {
        return NextResponse.json(
            { error: 'Chapter not found' },
            { status: 404 }
        )
    }

    // 5. Вернуть только часть (chunk)
    const chunk = chapter.content.slice(offset, offset + 3000)

    return NextResponse.json({
        chunk,
        hasMore: offset + 3000 < chapter.content.length,
    })
}