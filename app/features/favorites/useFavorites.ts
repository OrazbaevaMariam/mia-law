import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';

export function useFavorites(bookId: string) {
    const [isFav, setIsFav] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadFavorites = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsFav(false);
                return;
            }

            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('book_id', bookId)
                .single();

            setIsFav(!!data);
        } catch (error) {
            console.error('Error loading favorites:', error);
            setIsFav(false);
        }
    }, [bookId]);

    const toggleFavorite = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return false;
            }

            setLoading(true);

            if (isFav) {
                await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('book_id', bookId);
                setIsFav(false);
            } else {
                await supabase
                    .from('favorites')
                    .insert({
                        user_id: user.id,
                        book_id: bookId,
                    });
                setIsFav(true);
            }

            return true;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [bookId, isFav]);

    return {
        isFavorite: isFav,
        loading,
        loadFavorites,
        toggleFavorite,
    };
}