import { createServerSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { Header } from '@/app/components/layout/Header'
import { Footer } from '@/app/components/layout/Footer'

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
        <>
            <Header />
            <main className="pt-24 pb-12">
                <div className="max-w-2xl mx-auto p-6">
                    <h1 className="text-4xl mb-4 font-serif">{book?.title}</h1>
                    <p className="mb-6 text-muted">{book?.description}</p>

                    <h2 className="text-2xl mb-4 font-serif">Главы:</h2>
                    <div className="space-y-2">
                        {chapters?.map((ch) => (
                            <Link key={ch.id} href={`/chapter/${ch.id}`}>
                                <div className="cursor-pointer p-4 hover:bg-[#556B2F]/10 rounded transition-colors">
                                    {ch.title} {ch.is_free ? '🆓' : '🔒'}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
