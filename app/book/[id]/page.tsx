import { createServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createServerSupabase()

    const { data: book } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single()

    const { data: chapters } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', id)
        .order('order_index')

    return (
        <div className="p-10">
            <h1 className="text-2xl mb-4">{book?.title}</h1>
            <p className="mb-6">{book?.description}</p>

            <h2 className="text-xl mb-2">Главы:</h2>

            {chapters?.map((ch) => (
                <Link key={ch.id} href={`/chapter/${ch.id}`}>
                    <div className="cursor-pointer mb-2 p-2 hover:bg-gray-100">
                        {ch.title} {ch.is_free ? '🆓' : '🔒'}
                    </div>
                </Link>
            ))}
        </div>
    )
}
