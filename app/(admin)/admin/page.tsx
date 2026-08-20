// app/(admin)/admin/page.tsx
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminPage() {
    const supabase = supabaseAdmin

    const [{ count: booksCount }, { count: usersCount }, { count: favoritesCount }] =
        await Promise.all([
            supabase.from('books').select('*', { count: 'exact', head: true }),
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('favorites').select('*', { count: 'exact', head: true }),
        ])

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Дашборд</h1>
            <p className="text-gray-500 mb-8">Обзор твоей платформы</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Книги" value={booksCount ?? 0} icon="📚" color="bg-blue-500" />
                <StatCard title="Пользователи" value={usersCount ?? 0} icon="👤" color="bg-purple-500" />
                <StatCard title="Избранное" value={favoritesCount ?? 0} icon="❤️" color="bg-pink-500" />
            </div>
        </div>
    )
}

function StatCard({
                      title,
                      value,
                      icon,
                      color,
                  }: {
    title: string
    value: number
    icon: string
    color: string
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 border border-gray-100">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    )
}