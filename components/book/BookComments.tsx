'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientSupabase } from '@/shared/lib/supabaseClient'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface Comment {
    id: string
    user_id: string
    username: string
    content: string
    created_at: string
    parent_id: string | null
    comment_reactions: Array<{ reaction_type: string; user_id: string }>
}

interface BookCommentsProps {
    bookId: string
    userId?: string | null
}

const COMMENTS_PER_PAGE = 5

export function BookComments({ bookId, userId }: BookCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const supabase = createClientSupabase()

    const fetchComments = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true)
            const offset = (page - 1) * COMMENTS_PER_PAGE

            // Получаем главы книги
            const { data: chaptersData, error: chaptersError } = await supabase
                .from('chapters')
                .select('id')
                .eq('book_id', bookId)

            if (chaptersError || !chaptersData?.length) {
                setComments([])
                setTotalPages(0)
                if (!silent) setLoading(false)
                return
            }

            const chapterIds = chaptersData.map((ch) => ch.id)

            // Получаем комментарии БЕЗ JOIN (вместо users!comments_user_id_fkey)
            const { data: commentsData, error } = await supabase
                .from('comments')
                .select(`
                id,
                content,
                created_at,
                user_id,
                comment_reactions(reaction_type, user_id)
            `)
                .in('chapter_id', chapterIds)
                .is('parent_id', null)
                .order('created_at', { ascending: false })
                .range(offset, offset + COMMENTS_PER_PAGE - 1)

            if (error) {
                console.error('Ошибка загрузки комментариев:', error)
                if (!silent) setLoading(false)
                return
            }

            // Получаем юзернеймы отдельно
            const userIds = [...new Set((commentsData || []).map(c => c.user_id))]
            const { data: usersData } = await supabase
                .from('users')
                .select('id, username')
                .in('id', userIds)

            const userMap = new Map(usersData?.map(u => [u.id, u.username]) || [])

            // Трансформируем комментарии
            type RawComment = {
                id: string
                content: string
                created_at: string
                user_id: string
                comment_reactions: Array<{ reaction_type: string; user_id: string }>
            }

            const transformedComments: Comment[] = (commentsData as unknown as RawComment[]).map((comment) => ({
                id: comment.id,
                user_id: comment.user_id,
                username: userMap.get(comment.user_id) || 'Аноним',
                content: comment.content,
                created_at: comment.created_at,
                parent_id: null,
                comment_reactions: comment.comment_reactions || [],
            }))

            setComments(transformedComments)

            // Подсчёт всех комментариев
            const { count } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .in('chapter_id', chapterIds)
                .is('parent_id', null)

            setTotalPages(Math.ceil((count || 0) / COMMENTS_PER_PAGE))
            if (!silent) setLoading(false)
        } catch (err) {
            console.error('Ошибка при загрузке комментариев:', err)
            if (!silent) setLoading(false)
        }
    }, [bookId, page, supabase])

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchComments()
        }, 0)
        return () => clearTimeout(timer)
    }, [fetchComments])

    const addComment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!userId) {
            alert('Пожалуйста, авторизуйтесь')
            return
        }

        if (!newComment.trim()) {
            alert('Комментарий не может быть пустым')
            return
        }

        try {
            const { data: chapters } = await supabase
                .from('chapters')
                .select('id')
                .eq('book_id', bookId)
                .limit(1)

            if (!chapters || chapters.length === 0) {
                alert('Нет глав в этой книге')
                return
            }

            const { error } = await supabase.from('comments').insert({
                user_id: userId,
                chapter_id: chapters[0].id,
                content: newComment,
                parent_id: null,
            })

            if (error) {
                console.error('Ошибка добавления комментария:', error)
                alert('Ошибка при добавлении комментария')
                return
            }

            setNewComment('')
            setPage(1)
            await fetchComments(true)
        } catch (err) {
            console.error('Ошибка при добавлении комментария:', err)
        }
    }

    const toggleReaction = async (
        commentId: string,
        reactionType: 'like' | 'dislike'
    ) => {
        if (!userId) {
            alert('Пожалуйста, авторизуйтесь')
            return
        }

        try {
            const { data: existing } = await supabase
                .from('comment_reactions')
                .select('id, reaction_type')
                .eq('comment_id', commentId)
                .eq('user_id', userId)
                .maybeSingle()

            if (existing) {
                if (existing.reaction_type === reactionType) {
                    // Та же реакция — снимаем
                    await supabase
                        .from('comment_reactions')
                        .delete()
                        .eq('id', existing.id)
                } else {
                    // Другая реакция — обновляем тип
                    await supabase
                        .from('comment_reactions')
                        .update({ reaction_type: reactionType })
                        .eq('id', existing.id)
                }
            } else {
                // Реакции нет — создаём
                await supabase.from('comment_reactions').insert({
                    comment_id: commentId,
                    user_id: userId,
                    reaction_type: reactionType,
                })
            }

            await fetchComments(true)
        } catch (err) {
            console.error('Ошибка при реакции на комментарий:', err)
        }
    }

    return (
        <div className="mt-12 pt-8 border-t border-burgundy/20">
            <h3 className="text-2xl font-serif text-burgundy mb-6">
                Комментарии читателей
            </h3>

            {userId && (
                <form onSubmit={addComment} className="mb-8">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Поделитесь впечатлением о книге..."
                        className="w-full p-3 border border-burgundy/20 rounded-lg resize-none mb-3 focus:outline-none focus:border-burgundy"
                        rows={3}
                    />
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="px-4 py-2 bg-burgundy text-warmBg rounded font-serif hover:bg-burgundy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Отправить
                    </button>
                </form>
            )}

            {loading && (
                <div className="text-center py-4 text-warmText">
                    Загрузка комментариев...
                </div>
            )}

            {!loading && comments.length === 0 && (
                <div className="text-center py-4 text-warmText/60">
                    Пока нет комментариев. Будьте первым!
                </div>
            )}

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className="bg-burgundy/5 p-4 rounded-lg"
                    >
                        <div className="flex justify-between mb-2">
                            <div className="text-sm font-serif text-burgundy">
                                <strong>{comment.username}</strong>
                            </div>
                            <div className="text-xs text-warmText/60">
                                {new Date(comment.created_at).toLocaleString(
                                    'ru-RU',
                                    {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }
                                )}
                            </div>
                        </div>

                        <p className="text-warmText mb-3">
                            {comment.content}
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() =>
                                    void toggleReaction(comment.id, 'like')
                                }
                                className="flex items-center gap-1 text-sm text-warmText hover:text-burgundy transition-colors"
                            >
                                <ThumbsUp className="w-4 h-4" />
                                {
                                    comment.comment_reactions.filter(
                                        (r) => r.reaction_type === 'like'
                                    ).length
                                }
                            </button>
                            <button
                                onClick={() =>
                                    void toggleReaction(comment.id, 'dislike')
                                }
                                className="flex items-center gap-1 text-sm text-warmText hover:text-burgundy transition-colors"
                            >
                                <ThumbsDown className="w-4 h-4" />
                                {
                                    comment.comment_reactions.filter(
                                        (r) => r.reaction_type === 'dislike'
                                    ).length
                                }
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from(
                        { length: totalPages },
                        (_, i) => i + 1
                    ).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1 rounded text-sm font-serif transition-colors ${
                                page === p
                                    ? 'bg-burgundy text-warmBg'
                                    : 'bg-burgundy/10 text-warmText hover:bg-burgundy/20'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}