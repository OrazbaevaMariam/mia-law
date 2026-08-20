import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { userId } = await params

        const { data, error: queryError } = await supabase
            .from('moderation_history')
            .select(`
                *,
                admin:admin_id (username, email)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (queryError) throw queryError

        return NextResponse.json(data)
    } catch (error) {
        console.error('GET history error:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}