'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
    kpis: {
        totalViews: number;
        activeSubscribers: number;
        avgRating: number;
        completionRate: number;
        newUsers: number;
        conversionRate: number;
        retentionRate: number;
        daysSelected: number;
    };
    chartData: Array<{ date: string; views: number }>;
    topChapters: Array<{ chapterId: string; views: number; rating: number }>;
    chapterStats: {
        chapters: Array<{ chapterId: string; rating: number; totalViews: number; dayViews: number[] }>;
        dates: string[];
    };
}

export function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [days]);

    async function fetchAnalytics() {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/analytics/dashboard?days=${days}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных');
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-gray-600">⏳ Загрузка данных...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                ❌ {error}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* ПЕРИОД ВЫБОРА */}
            <div className="flex gap-2 mb-6">
                {[7, 30, 90].map((d) => (
                    <button
                        key={d}
                        onClick={() => setDays(d)}
                        className={`px-4 py-2 rounded font-semibold transition ${
                            days === d
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        {d} дней
                    </button>
                ))}
            </div>

            {/* KPI КАРТОЧКИ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="📊 Всего просмотров" value={data.kpis.totalViews} />
                <KPICard label="👥 Активных подписчиков" value={data.kpis.activeSubscribers} />
                <KPICard label="⭐ Средняя оценка" value={data.kpis.avgRating.toFixed(1)} suffix="/5" />
                <KPICard label="✅ Завершено глав" value={data.kpis.completionRate.toFixed(1)} suffix="%" />
                <KPICard label="🆕 Новых пользователей" value={data.kpis.newUsers} />
                <KPICard label="💰 Конверсия" value={data.kpis.conversionRate.toFixed(1)} suffix="%" />
                <KPICard label="🔄 Retention" value={typeof data.kpis.retentionRate === 'number' ? data.kpis.retentionRate.toFixed(1) : '0'} suffix="%" />
                <KPICard label="📅 Период" value={`${data.kpis.daysSelected} дней`} />
            </div>

            {/* ГРАФИК ПРОСМОТРОВ */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">📈 Просмотры по дням</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="views" stroke="#3b82f6" name="Просмотры" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* ТОП ГЛАВЫ */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">🏆 Топ 5 глав</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.topChapters}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="chapterId" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="views" fill="#10b981" name="Просмотры" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ТАБЛИЦА ТОП ГЛАВ */}
            <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                <h2 className="text-xl font-bold mb-4">📋 Детали по главам</h2>
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="px-4 py-2 text-left font-semibold">Глава</th>
                        <th className="px-4 py-2 text-center font-semibold">Просмотры</th>
                        <th className="px-4 py-2 text-center font-semibold">Средняя оценка</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.topChapters.map((chapter) => (
                        <tr key={chapter.chapterId} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">Глава {chapter.chapterId}</td>
                            <td className="px-4 py-3 text-center">{chapter.views}</td>
                            <td className="px-4 py-3 text-center">
                  <span className="bg-yellow-100 px-3 py-1 rounded">
                    {chapter.rating.toFixed(1)}/5 ⭐
                  </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* ДЕТАЛЬНАЯ ТАБЛИЦА ПО ГЛАВАМ И ДНЯМ (как в ЛитНете) */}
            {data.chapterStats && data.chapterStats.chapters.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                    <h2 className="text-xl font-bold mb-4">📊 Статистика по главам и дням</h2>
                    <table className="w-full text-xs border-collapse">
                        <thead>
                        <tr className="bg-gray-100 border-b-2">
                            <th className="text-left py-3 px-4 border-r font-bold sticky left-0 bg-gray-100 z-10">Глава</th>
                            <th className="text-center py-3 px-4 border-r font-bold">Оценка</th>
                            <th className="text-center py-3 px-4 border-r font-bold">Итого</th>
                            {data.chapterStats.dates.map((date: string) => (
                                <th key={date} className="text-center py-3 px-2 border-r text-xs font-bold min-w-12">
                                    {date}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {data.chapterStats.chapters.map((chapter, idx) => (
                            <tr key={idx} className="border-b hover:bg-blue-50">
                                <td className="py-3 px-4 border-r font-medium sticky left-0 bg-white z-10">
                                    Глава {chapter.chapterId}
                                </td>
                                <td className="py-3 px-4 border-r text-center">
                                        <span className="bg-yellow-100 px-2 py-1 rounded text-xs font-semibold">
                                            {chapter.rating.toFixed(1)}⭐
                                        </span>
                                </td>
                                <td className="py-3 px-4 border-r text-center font-bold text-blue-600">
                                    {chapter.totalViews}
                                </td>
                                {chapter.dayViews.map((views: number, dayIdx: number) => (
                                    <td key={dayIdx} className="py-3 px-2 border-r text-center">
                                        {views > 0 ? (
                                            <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded font-semibold">
                                                    {views}
                                                </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function KPICard({
                     label,
                     value,
                     suffix = '',
                 }: {
    label: string;
    value: number | string;
    suffix?: string;
}) {
    return (
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 font-medium">{label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
                {value}
                <span className="text-lg text-gray-500">{suffix}</span>
            </div>
        </div>
    );
}