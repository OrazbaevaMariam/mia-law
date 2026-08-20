import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id, ...updates } = await req.json()

    if (!id) {
        return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const { error: updateError } = await supabase.from('books').update(updates).eq('id', id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await req.json()

    if (!id) {
        return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const { error: chaptersError } = await supabase
        .from('chapters')
        .delete()
        .eq('book_id', id)

    if (chaptersError) {
        return NextResponse.json({ error: chaptersError.message }, { status: 500 })
    }

    const { error: deleteError } = await supabase.from('books').delete().eq('id', id)

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })
    return NextResponse.json({ success: true })
}