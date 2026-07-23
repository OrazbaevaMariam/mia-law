// import { NextRequest, NextResponse } from "next/server"
// import { createClient } from "@supabase/supabase-js"
//
// const supabaseAdmin = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!
// )
//
// interface ReadingLog {
//     user_id: string
//     book_id: string
//     chapter_id: string
//     progress: number
//     timestamp: string
// }
//
// export async function POST(req: NextRequest) {
//     try {
//         const body: ReadingLog = await req.json()
//         const { user_id, book_id, chapter_id, progress } = body
//
//         const userIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
//
//         // Логируем или обновляем прогресс
//         const { error } = await supabaseAdmin
//             .from("reading_logs")
//             .upsert(
//                 {
//                     user_id,
//                     book_id,
//                     chapter_id,
//                     progress,
//                     last_read: new Date().toISOString(),
//                     user_ip: userIp,
//                 },
//                 {
//                     onConflict: "user_id,book_id,chapter_id",
//                 }
//             )
//
//         if (error) {
//             console.error("Error logging reading progress:", error)
//             return NextResponse.json(
//                 { error: "Failed to log progress" },
//                 { status: 500 }
//             )
//         }
//
//         return NextResponse.json({ success: true })
//
//     } catch (error) {
//         console.error("Error in log-progress:", error)
//         return NextResponse.json(
//             { error: "Internal server error" },
//             { status: 500 }
//         )
//     }
// }
// /api/reader/log-progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { chapter_id, progress } = body

    if (!chapter_id) {
        return NextResponse.json(
            { error: 'Missing chapter_id' },
            { status: 400 }
        )
    }

    try {
        await supabase.from('reading_logs').upsert(
            {
                user_id: user.id,
                chapter_id,
                progress: Math.min(progress, 100),
                last_read: new Date().toISOString(),
            },
            {
                onConflict: 'user_id,chapter_id',
            }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error logging progress:', error)
        return NextResponse.json(
            { error: 'Failed to log progress' },
            { status: 500 }
        )
    }
}
