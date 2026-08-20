"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Container } from "@/app/components/ui/Container";
import { BookCard } from "@/app/components/BookCard";

interface Book {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    cover_url: string | null;
}

export default function LibraryPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadBooks() {
            try {
                const { data, error: fetchError } = await supabase
                    .from("books")
                    .select("id, title, description, slug, cover_url")
                    .order("title", { ascending: true });

                if (fetchError) {
                    setError("Не удалось загрузить книги");
                    return;
                }

                setBooks(data ?? []);
            } catch {
                setError("Произошла ошибка при загрузке");
            } finally {
                setIsLoading(false);
            }
        }

        void loadBooks();
    }, []);

    if (isLoading) {
        return (
            <Container>
                <div className="flex justify-center items-center min-h-screen">
                    <p className="text-gray-500">Загрузка...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <div className="flex justify-center items-center min-h-screen">
                    <p className="text-red-500">{error}</p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <h1 className="text-3xl font-bold mb-8">Библиотека</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                ))}
            </div>
            {books.length === 0 && (
                <p className="text-center text-gray-500 mt-8">Книги не найдены</p>
            )}
        </Container>
    );
}