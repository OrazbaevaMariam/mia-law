'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Container } from '@/app/components/ui/Container';
import Link from 'next/link';
import { BookCard } from '@/app/components/BookCard';
import { useRouter } from 'next/navigation';

interface Book {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    cover_url: string | null;
}

interface User {
    id: string;
}

export default function FavoritesPage() {
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                setLoading(true);
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (!authUser) {
                    router.push('/login');
                    return;
                }
                setUser({ id: authUser.id });

                const { data: favorites, error: favError } = await supabase
                    .from('favorites')
                    .select('book_id')
                    .eq('user_id', authUser.id);

                if (favError) throw favError;

                if (!favorites || favorites.length === 0) {
                    setBooks([]);
                    setLoading(false);
                    return;
                }

                const bookIds = favorites.map((fav) => fav.book_id);

                // Обязательно тянем slug!
                const { data: booksData, error: booksError } = await supabase
                    .from('books')
                    .select('id, slug, title, description, cover_url')
                    .in('id', bookIds);

                if (booksError) throw booksError;
                setBooks(booksData || []);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Ошибка загрузки книг';
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        void loadFavorites();
    }, [router]);

    if (!user && !loading) {
        return (
            <Container>
                <div className="py-20 text-center">Загрузка...</div>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container>
                <div className="py-20 text-center">Загрузка избранного...</div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="py-12">
                <h1 className="text-4xl font-bold mb-8">Мои избранные книги</h1>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}
                {books.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-600 mb-4">У вас нет избранных книг</p>
                        <Link href="/library" className="text-blue-500 hover:text-blue-600">
                            Перейти в библиотеку →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onFavoriteToggle={(bookId, isFav) => {
                                    if (!isFav) {
                                        setBooks((prev) => prev.filter((b) => b.id !== bookId));
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}