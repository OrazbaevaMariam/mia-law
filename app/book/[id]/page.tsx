'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { HeartButton } from "@/app/components/HeartButton";

interface Book {
    id: string;
    title: string;
    description: string;
    cover_url: string;
    author?: string;
    genre?: string;
}

interface Chapter {
    id: string;
    title: string;
    is_free: boolean;
    order_index: number;
}

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
    const [book, setBook] = useState<Book | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [params_, setParams] = useState<{ id: string } | null>(null);

    useEffect(() => {
        params.then(p => setParams(p));
    }, [params]);

    useEffect(() => {
        if (!params_?.id) return;

        const loadBook = async () => {
            try {
                const { data: bookData, error: bookError } = await supabase
                    .from('books')
                    .select('*')
                    .eq('id', params_.id)
                    .single();

                if (bookError) throw bookError;
                setBook(bookData);

                const { data: chaptersData, error: chaptersError } = await supabase
                    .from('chapters')
                    .select('id, title, is_free, order_index')
                    .eq('book_id', params_.id)
                    .order('order_index', { ascending: true });

                if (chaptersError) throw chaptersError;
                setChapters(chaptersData || []);
            } catch (error) {
                console.error('Error loading book:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBook();
    }, [params_?.id]);

    if (loading) {
        return <div className="p-8 text-center">Загрузка...</div>;
    }

    if (!book) {
        return <div className="p-8 text-center">Книга не найдена</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <Link
                        href="/library"
                        className="text-slate-600 hover:text-slate-900 flex items-center gap-2"
                    >
                        ← Вернуться в библиотеку
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="relative">
                        {book.cover_url && (
                            <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg mb-6">
                                <Image
                                    src={book.cover_url}
                                    alt={book.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div className="flex gap-3 items-center">
                            <div className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                                <HeartButton bookId={book.id} variant="card" />
                            </div>
                            <Link
                                href={
                                    chapters.length > 0
                                        ? `/protected/reader/${book.id}/${chapters[0].id}`
                                        : `/protected/reader/${book.id}`
                                }
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition font-medium"
                            >
                                Начать читать
                            </Link>
                        </div>

                    </div>

                    <div className="md:col-span-2">
                        <h1 className="text-4xl font-bold mb-2">{book.title}</h1>

                        {book.author && (
                            <p className="text-lg text-slate-600 mb-4">
                                Автор: <span className="font-semibold">{book.author}</span>
                            </p>
                        )}

                        {book.genre && (
                            <p className="text-lg text-slate-600 mb-6">
                                Жанр: <span className="font-semibold">{book.genre}</span>
                            </p>
                        )}

                        {/* Описание без заголовка "Описание" */}
                        <div className="mb-8">
                            <p className="text-slate-700 leading-relaxed text-lg">
                                {book.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-slate-200">
                            <div>
                                <p className="text-slate-600 text-sm">Статус</p>
                                <p className="font-bold text-lg">В процессе</p>
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm">Глав</p>
                                <p className="font-bold text-lg">{chapters.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Секция с главами */}
                <div className="mt-12">
                    <h2 className="text-3xl font-bold mb-6">Содержание</h2>
                    <div className="space-y-3">
                        {chapters.length === 0 && (
                            <p className="text-slate-600">Главы пока не добавлены.</p>
                        )}
                        {chapters.map((chapter, index) => (
                            <Link
                                key={chapter.id}
                                href={`/protected/reader/${book.id}/${chapter.id}`}
                                className="flex items-center justify-between px-5 py-4 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-400 font-medium w-8">
                                        {index + 1}
                                    </span>
                                    <span className="text-slate-800 font-medium group-hover:text-blue-600 transition">
                                        {chapter.title}
                                    </span>
                                </div>
                                {!chapter.is_free && (
                                    <span className="text-slate-400 text-sm flex items-center gap-1">
                                        🔒 Платно
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}