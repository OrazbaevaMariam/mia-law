import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase-server';
import Hero from '@/app/components/sections/Hero';
import About from '@/app/components/sections/About';
import { Books } from '@/app/components/sections/Books';
import { Membership } from '@/app/components/sections/Membership';
import Blog from '@/app/components/sections/Blog';
import { Footer } from '@/app/components/layout/Footer';

export const metadata: Metadata = {
    title: 'Архив запретных миров | Мия Лоу',
    description: 'Ты не случайно здесь. Романтический архив историй и магических миров.',
};

export default async function Home() {
    const supabase = await createServerSupabase();

    const { data: booksList } = await supabase
        .from('books')
        .select('*')
        .eq('is_published', true)
        .limit(3);

    return (
        <main className="min-h-screen bg-parchment">
            <Hero />
            <About />
            <Books />
            <Membership />
            <Blog />
            <Footer />
        </main>
    );
}