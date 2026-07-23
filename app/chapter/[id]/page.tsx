import { createServerSupabase } from '@/lib/supabase'

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createServerSupabase()

    const { data: chapter } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .single()

    if (!chapter) {
        return <div className="p-10">Глава не найдена</div>
    }

    return (
        <div className="p-10">
            <h1 className="text-2xl mb-4">{chapter.title}</h1>

            {chapter.is_free ? (
                <p>{chapter.content}</p>
            ) : (
                <div>
                    <p className="mb-4">🔒 Это платная глава</p>
                    <button className="bg-black text-white px-4 py-2">
                        Купить доступ
                    </button>
                </div>
            )}
        </div>
    )
}
