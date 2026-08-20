// app/sitemap.ts
import { MetadataRoute } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mia-law.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createServerSupabase()

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${BASE_URL}/library`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ]

    const { data: books } = await supabase
        .from('books')
        .select('id, slug, created_at')

    const bookRoutes: MetadataRoute.Sitemap = (books ?? []).map((book) => ({
        url: `${BASE_URL}/book/${book.id}`, // именно id, т.к. страница ищет по id
        lastModified: book.created_at ? new Date(book.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    return [...staticRoutes, ...bookRoutes]
}