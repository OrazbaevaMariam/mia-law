"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";

interface HeartButtonProps {
    bookId: string;
    variant?: "icon" | "card";
    showLabel?: boolean;
    showTooltip?: boolean;
    onToggle?: (bookId: string, isFavorite: boolean) => void;
    isFavorite?: boolean;
    onFavoriteChange?: (isFavorite: boolean) => void;
}

export function HeartButton({
                                bookId,
                                variant = "icon",
                                showLabel = false,
                                showTooltip = true,
                                onToggle,
                                isFavorite: controlledIsFavorite,
                                onFavoriteChange
                            }: HeartButtonProps) {
    const [internalIsFavorite, setInternalIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);

    const isControlled = controlledIsFavorite !== undefined;
    const isFavorite = isControlled ? controlledIsFavorite : internalIsFavorite;

    const setIsFavorite = useCallback((value: boolean) => {
        if (isControlled) {
            onFavoriteChange?.(value);
        } else {
            setInternalIsFavorite(value);
        }
    }, [isControlled, onFavoriteChange]);

    const checkFavorite = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setIsFavorite(false);
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from("favorites")
                .select("id")
                .eq("user_id", session.user.id)
                .eq("book_id", bookId)
                .maybeSingle();

            setIsFavorite(!!data);
            setLoading(false);
        } catch (error) {
            console.error("Error checking favorite:", error);
            setLoading(false);
        }
    }, [bookId, setIsFavorite]);

    useEffect(() => {
        void checkFavorite();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = "/login";
            return;
        }

        setLoading(true);

        try {
            if (isFavorite) {
                await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", session.user.id)
                    .eq("book_id", bookId);
                setIsFavorite(false);
                onToggle?.(bookId, false);
            } else {
                await supabase
                    .from("favorites")
                    .insert([{ user_id: session.user.id, book_id: bookId }]);
                setIsFavorite(true);
                onToggle?.(bookId, true);
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
            await checkFavorite();
        } finally {
            setLoading(false);
        }
    };

    const baseClasses = "transition-all duration-200 hover:scale-110 active:scale-95";
    const heartColor = isFavorite ? "text-burgundy" : "text-gray-400 hover:text-gray-600";

    if (variant === "card") {
        return (
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`relative group ${baseClasses}`}
                aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
            >
                <div
                    className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        isFavorite
                            ? "bg-burgundy/20 shadow-lg shadow-burgundy/30"
                            : "bg-gray-100/50 group-hover:bg-gray-200/50"
                    }`}
                    style={{ padding: "8px" }}
                />

                <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`relative z-10 transition-colors duration-300 ${heartColor}`}
                >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>

                {showTooltip && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-ink text-antique-gold text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {isFavorite ? "Удалить" : "В избранное"}
                    </span>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center gap-2 ${baseClasses}`}
            aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
        >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                className={`transition-colors duration-300 ${heartColor}`}
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {showLabel && (
                <span className="text-sm font-interface text-ink">
                    {isFavorite ? "В избранном" : "В избранное"}
                </span>
            )}
        </button>
    );
}