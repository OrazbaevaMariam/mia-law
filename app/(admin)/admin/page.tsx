// app/admin/page.tsx
import { createServerSupabase } from '@/shared/lib/supabaseServer'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
    const supabase = await createServerSupabase()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Проверяем, админ ли пользователь
    const { data: admin } = await supabase
        .from('admins')
        .select()
        .eq('user_id', user.id)
        .single()

    if (!admin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-warmBg">
                <p className="text-xl text-burgundy font-serif">
                    Доступ запрещён
                </p>
            </div>
        )
    }

    return <AdminDashboard userId={user.id} />
}