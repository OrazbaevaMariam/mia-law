import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SUPER_ADMIN_EMAIL = 'mariam.orazbaeva@icloud.com'

export async function GET(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data: users, error: queryError, count } = await supabase
            .from('users')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to)

        if (queryError) throw queryError

        const usersWithFavorites = await Promise.all(
            (users ?? []).map(async (user) => {
                const { count: favCount } = await supabase
                    .from('favorites')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)

                return {
                    ...user,
                    favorites_count: favCount ?? 0,
                }
            })
        )

        return NextResponse.json({
            users: usersWithFavorites,
            total: count ?? 0,
            page,
            pageSize,
            totalPages: Math.ceil((count ?? 0) / pageSize),
        })
    } catch (error) {
        console.error('GET /api/admin/users error:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: adminRow } = await supabase
            .from('users')
            .select('role, email')
            .eq('id', user.id)
            .single();

        const isSuperAdmin = adminRow?.email === SUPER_ADMIN_EMAIL;

        const { userId, imageUrl, ...updates } = await req.json()

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 })
        }

        if (userId === user.id) {
            return NextResponse.json(
                { error: '❌ Нельзя менять собственную роль!' },
                { status: 403 }
            )
        }

        if (updates.role === 'admin' && !isSuperAdmin) {
            return NextResponse.json(
                { error: '❌ Только главный администратор может назначать роль Admin!' },
                { status: 403 }
            )
        }

        const { data: targetUserRole } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

        if (targetUserRole?.role === 'admin' && !isSuperAdmin) {
            return NextResponse.json(
                { error: '❌ Только главный администратор может менять роль другого админа!' },
                { status: 403 }
            )
        }

        const { data: oldUserData } = await supabase
            .from('users')
            .select('role, status')
            .eq('id', userId)
            .single()

        if (updates.status === 'banned') {
            updates.banned_at = new Date().toISOString()
            updates.banned_by = user.id
        }

        if (updates.status === 'active') {
            updates.ban_reason = null
            updates.banned_at = null
            updates.banned_by = null
        }

        const { data, error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select('*')

        if (updateError) {
            console.error('❌ Supabase error:', updateError)
            throw updateError
        }

        if (updates.role) {
            await supabase.from('admin_logs').insert({
                admin_id: user.id,
                action: 'role_change',
                target_user_id: userId,
                old_value: oldUserData?.role,
                new_value: updates.role,
                created_at: new Date().toISOString(),
            })
        }

        if (updates.status && updates.status !== oldUserData?.status) {
            let action = ''
            if (updates.status === 'banned') action = 'banned'
            else if (updates.status === 'suspended') action = 'suspended'
            else if (updates.status === 'active') {
                action = oldUserData?.status === 'banned' ? 'unbanned' : 'unsuspended'
            }

            if (action) {
                await supabase.from('moderation_history').insert({
                    user_id: userId,
                    admin_id: user.id,
                    action,
                    reason: updates.ban_reason || null,
                    image_url: imageUrl || null,
                    created_at: new Date().toISOString(),
                })
            }
        }

        return NextResponse.json(data[0])
    } catch (error) {
        console.error('PATCH /api/admin/users error:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}