import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/requireAdmin'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const { error } = await requireAdmin();
        if (error) return error;

        const { commentId, status, reason } = await req.json()

        if (!commentId || !status) {
            return NextResponse.json({ error: 'commentId and status required' }, { status: 400 })
        }

        const { data: commentRow } = await supabaseAdmin
            .from('comments')
            .select('id, user_id, content')
            .eq('id', commentId)
            .single()

        const updateData: Record<string, unknown> = { status }
        if (status === 'approved') {
            updateData.approved_at = new Date().toISOString()
        }
        if (status === 'rejected') {
            updateData.rejected_reason = reason || 'Нарушение правил'
        }

        const { error: updateError } = await supabaseAdmin
            .from('comments')
            .update(updateData)
            .eq('id', commentId)

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        if (commentRow?.user_id) {
            const shortContent = commentRow.content?.substring(0, 50) || ''
            const notificationMessage =
                status === 'approved'
                    ? `✅ Ваш комментарий одобрен: "${shortContent}${commentRow.content && commentRow.content.length > 50 ? '...' : ''}"`
                    : status === 'rejected'
                        ? `❌ Ваш комментарий отклонён${reason ? `: ${reason}` : ''}`
                        : `📝 Статус вашего комментария изменён на "${status}"`

            const { error: notifError } = await supabaseAdmin.from('notifications').insert({
                user_id: commentRow.user_id,
                type: status === 'approved' ? 'comment_approved' : status === 'rejected' ? 'comment_rejected' : 'comment_status_changed',
                message: notificationMessage,
                comment_id: commentId,
                is_read: false,
            })

            if (notifError) {
                console.warn('⚠️ Error creating notification:', notifError)
            }
        }

        console.log(`✅ Comment ${commentId} status changed to ${status}`)
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('❌ Error updating comment status:', err)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}