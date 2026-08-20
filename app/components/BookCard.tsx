'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartButton } from './HeartButton';

interface Book {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    cover_url: string | null;
}

interface BookCardProps {
    book: Book;
    onFavoriteToggle?: (bookId: string, isFavorite: boolean) => void;
}

export function BookCard({ book, onFavoriteToggle }: BookCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavoriteChange = (value: boolean) => {
        setIsFavorite(value);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
            {book.cover_url && (
                <div className="relative w-full h-64 mb-4">
                    <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        className="object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 right-3">
                        <HeartButton
                            bookId={book.id}
                            variant="card"
                            onToggle={onFavoriteToggle}
                            showTooltip={false}
                            isFavorite={isFavorite}
                            onFavoriteChange={handleFavoriteChange}
                        />
                    </div>
                </div>
            )}

            <div className="px-4 flex-grow">
                <h3 className="font-display text-lg text-ink mb-2">{book.title}</h3>
                {book.description && (
                    <p className="text-reader-muted text-sm line-clamp-3 mb-4">
                        {book.description}
                    </p>
                )}
            </div>

            <div className="mt-auto p-4 space-y-2">
                <Link
                    href={`/reader/${book.slug}`}
                    className="block w-full bg-deep-olive text-white py-2 rounded text-center text-sm font-interface font-medium transition-all duration-200 hover:bg-burgundy hover:shadow-md hover:shadow-burgundy/30 hover:scale-105"
                >
                    Погрузиться в историю
                </Link>

                <HeartButton
                    bookId={book.id}
                    variant="icon"
                    showLabel={true}
                    onToggle={onFavoriteToggle}
                    showTooltip={true}
                    isFavorite={isFavorite}
                    onFavoriteChange={handleFavoriteChange}
                />
            </div>
        </div>
    );
}