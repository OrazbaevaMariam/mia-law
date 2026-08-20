import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    const bookId = req.nextUrl.searchParams.get('bookId')
    if (!bookId) {
        return NextResponse.json({ error: 'bookId required' }, { status: 400 })
    }

    const { data, error: queryError } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true })

    if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json()
    console.log('Received body:', body)

    const { data, error: insertError } = await supabase.from('chapters').insert(body).select()

    if (insertError) {
        console.error('Supabase insert error:', insertError)
        return NextResponse.json({ error: insertError.message, details: insertError }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
}

export async function PATCH(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id, ...updates } = await req.json()
    const { error: updateError } = await supabase.from('chapters').update(updates).eq('id', id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await req.json()
    const { error: deleteError } = await supabase.from('chapters').delete().eq('id', id)

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })
    return NextResponse.json({ success: true })
}