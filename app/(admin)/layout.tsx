import { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Users, FileText, ShieldAlert, Settings } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Левый сайдбар */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold">MIA Law Admin</h1>
                </div>

                <nav className="flex-1 flex flex-col gap-1 p-4">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 transition text-sm font-medium"
                    >
                        <LayoutDashboard size={18} />
                        Дашборд
                    </Link>

                    <Link
                        href="/admin/books"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 transition text-sm font-medium"
                    >
                        <BookOpen size={18} />
                        Книги
                    </Link>

                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 transition text-sm font-medium"
                    >
                        <Users size={18} />
                        Пользователи
                    </Link>

                    <Link
                        href="/admin/blog"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 transition text-sm font-medium"
                    >
                        <FileText size={18} />
                        Блог
                    </Link>

                    <Link
                        href="/admin/moderation"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 transition text-sm font-medium"
                    >
                        <ShieldAlert size={18} />
                        Модерация
                    </Link>

                    <li>
                        <a href="/admin/analytics" className="flex items-center gap-2 p-3 hover:bg-gray-100">
                            📊 Аналитика
                        </a>
                    </li>

                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 transition text-sm font-medium"
                    >
                        <Settings size={18} />
                        Настройки
                    </Link>
                </nav>
            </aside>

            {/* Основной контент */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}