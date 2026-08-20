// app/api/reader/log-progress/route.ts
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

    // получаем реальный id книги по slug
    const { data: book, error: bookError } = await supabase
        .from('books')
        .select('id')
        .eq('slug', bookSlug)
        .single()

    if (bookError || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    const { data, error } = await supabase
        .from('reading_progress')
        .upsert(
            {
              user_id: user.id,
              book_id: book.id,
              chapter_id: chapterId,
              percent: percent ?? 0,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,book_id' }
        )

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
      let errorMessage = 'Unknown error';

      if (error?.message) {
          errorMessage = error.message;
      } else if (error?.code) {
          errorMessage = `${error.code}: ${error.details || error.hint || ''}`;
      } else if (typeof error === 'string') {
          errorMessage = error;
      }

      console.error('log-progress error:', errorMessage);
      console.error('Full error object:', error);

      return NextResponse.json({
          error: 'Failed to log progress',
          details: errorMessage
      }, { status: 500 })
  }
}