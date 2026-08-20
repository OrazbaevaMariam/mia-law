import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const bookId = searchParams.get('bookId');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
        // 1️⃣ ВСЕГО ПРОСМОТРОВ за период
        let viewsQuery = supabase
            .from('chapter_views')
            .select('id', { count: 'exact' })
            .gte('viewed_at', startDate.toISOString());

        if (bookId) {
            viewsQuery = viewsQuery.eq('chapter_id', bookId);
        }

        const { count: totalViews } = await viewsQuery;

        // 2️⃣ НОВЫЕ ЮЗЕРЫ за период
        const { data: newUsersData } = await supabase
            .from('chapter_views')
            .select('user_id')
            .gte('viewed_at', startDate.toISOString())
            .then(({ data }) => ({
                data: [...new Set(data?.map(d => d.user_id) || [])],
            }));

        const newUsersCount = newUsersData?.length || 0;

        // 3️⃣ АКТИВНЫЕ ПОДПИСЧИКИ
        const { count: activeSubscribers } = await supabase
            .from('subscriptions')
            .select('id', { count: 'exact' })
            .eq('status', 'active');

        // 4️⃣ СРЕДНЯЯ ОЦЕНКА
        const { data: ratingsData } = await supabase
            .from('chapter_ratings')
            .select('rating')
            .gte('created_at', startDate.toISOString());

        const avgRating =
            ratingsData && ratingsData.length > 0
                ? (ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length).toFixed(1)
                : 0;

        // 5️⃣ % ЗАВЕРШЕНИЯ (люди, прочитавшие >80%)
        const { data: completionData } = await supabase
            .from('reading_logs')
            .select('user_id, progress')
            .gte('last_read', startDate.toISOString());

        const completionRate =
            completionData && completionData.length > 0
                ? (
                    (completionData.filter(r => r.progress > 80).length /
                        completionData.length) *
                    100
                ).toFixed(1)
                : 0;

        // 6️⃣ КОНВЕРСИЯ: просмотры → покупки/подписка
        const { data: viewUsers } = await supabase
            .from('chapter_views')
            .select('user_id')
            .gte('viewed_at', startDate.toISOString());

        const viewUserIds = [...new Set(viewUsers?.map(u => u.user_id) || [])];

        const { count: convertedCount } = await supabase
            .from('purchases')
            .select('id', { count: 'exact' })
            .in('user_id', viewUserIds);

        const conversionRate =
            viewUserIds.length > 0
                ? (((convertedCount || 0) / viewUserIds.length) * 100).toFixed(1)
                : 0;

        // 7️⃣ RETENTION (юзеры, смотревшие глаy 2+ раза)
        const { data: viewCounts } = await supabase
            .from('chapter_views')
            .select('user_id')
            .gte('viewed_at', startDate.toISOString());

        const userViewCounts = new Map();
        viewCounts?.forEach(v => {
            userViewCounts.set(v.user_id, (userViewCounts.get(v.user_id) || 0) + 1);
        });

        const retentionCount = [...userViewCounts.values()].filter(count => count > 1)
            .length;

        // 8️⃣ ТОП ГЛАВЫ ПО ПРОСМОТРАМ за период
        const { data: topChapters } = await supabase
            .from('chapter_views')
            .select('chapter_id')
            .gte('viewed_at', startDate.toISOString())
            .then(async ({ data }) => {
                const chapterCounts = new Map();
                data?.forEach(v => {
                    chapterCounts.set(v.chapter_id, (chapterCounts.get(v.chapter_id) || 0) + 1);
                });

                const sorted = [...chapterCounts.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([chapterId, count]) => ({ chapterId, views: count }));

                const chaptersWithRating = await Promise.all(
                    sorted.map(async (chapter) => {
                        const { data: ratings } = await supabase
                            .from('chapter_ratings')
                            .select('rating')
                            .eq('chapter_id', chapter.chapterId);

                        const avgRating = ratings && ratings.length > 0
                            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                            : 0;

                        return { ...chapter, rating: avgRating };
                    })
                );

                return { data: chaptersWithRating };
            });

        // 9️⃣ ГРАФИК: просмотры по дням
        const { data: dailyViews } = await supabase
            .from('chapter_views')
            .select('viewed_at')
            .gte('viewed_at', startDate.toISOString());

        const dailyData = new Map();
        dailyViews?.forEach(v => {
            const date = new Date(v.viewed_at).toISOString().split('T')[0];
            dailyData.set(date, (dailyData.get(date) || 0) + 1);
        });

        const chartData = Array.from(dailyData.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, views]) => {
                const [year, month, day] = date.split('-');
                return {
                    date: `${day}.${month}.${year}`,
                    originalDate: date,
                    views
                };
            });

        // 🔟 ПРОСМОТРЫ ПО ГЛАВАМ И ДНЯМ (как в ЛитНете)
        const { data: chapterDayViews } = await supabase
            .from('chapter_views')
            .select('chapter_id, viewed_at')
            .gte('viewed_at', startDate.toISOString());

        const { data: chapterRatingsAll } = await supabase
            .from('chapter_ratings')
            .select('chapter_id, rating');

        const chapterDayMap = new Map();
        chapterDayViews?.forEach(v => {
            const date = new Date(v.viewed_at).toISOString().split('T')[0];
            const key = `${v.chapter_id}|${date}`;
            chapterDayMap.set(key, (chapterDayMap.get(key) || 0) + 1);
        });

        const uniqueChapters = [...new Set(chapterDayViews?.map(v => v.chapter_id) || [])]
            .sort((a, b) => {
                const aNum = parseInt(a as string);
                const bNum = parseInt(b as string);
                return aNum - bNum;
            });

        const uniqueDates = [...new Set(chapterDayViews?.map(v =>
            new Date(v.viewed_at).toISOString().split('T')[0]
        ) || [])].sort();

        const chapterStatsTable = uniqueChapters.map(chapterId => {
            const ratings = chapterRatingsAll?.filter(r => r.chapter_id === chapterId) || [];
            const avgRating = ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                : 0;

            const dayViews = uniqueDates.map(date => {
                const key = `${chapterId}|${date}`;
                return chapterDayMap.get(key) || 0;
            });

            return {
                chapterId,
                rating: parseFloat(avgRating.toFixed(1)),
                totalViews: dayViews.reduce((sum, v) => sum + v, 0),
                dayViews,
            };
        });

        return NextResponse.json({
            kpis: {
                totalViews: totalViews || 0,
                newUsers: newUsersCount,
                activeSubscribers: activeSubscribers || 0,
                avgRating: parseFloat(avgRating as string) || 0,
                completionRate: parseFloat(completionRate as string) || 0,
                conversionRate: parseFloat(conversionRate as string) || 0,
                retention: retentionCount,
                retentionRate: viewUserIds.length > 0
                    ? parseFloat(((retentionCount / viewUserIds.length) * 100).toFixed(1))
                    : 0,
                daysSelected: days,
            },
            topChapters: topChapters || [],
            chartData,
            chapterStats: {
                chapters: chapterStatsTable,
                dates: uniqueDates.map(d => {
                    const [year, month, day] = d.split('-');
                    return `${day}.${month}.${year}`;
                }),
            },
            period: { days, startDate: startDate.toISOString().split('T')[0] },
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}