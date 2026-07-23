'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientSupabase } from '@/shared/lib/supabaseClient'
import { ThumbsUp, ThumbsDown, Reply } from 'lucide-react'

interface Comment {
    id: string
    user_id: string
    username: string  // ← добавили поле
    content: string
    created_at: string
    parent_id: string | null
    comment_reactions: { reaction_type: string }[]
}

interface CommentsSectionProps {
    chapterId: string
    userId?: string
}

const COMMENTS_PER_PAGE = 5

export function ChapterComments({
                                    chapterId,
                                    userId,
                                }: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyText, setReplyText] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClientSupabase()

    const fetchComments = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true)
            const offset = (page - 1) * COMMENTS_PER_PAGE

            const { data: commentsData, error } = await supabase
                .from('comments')
                .select(
                    `
                id,
                content,
                created_at,
                user_id,
                users!comments_user_id_fkey(username),
                comment_reactions(reaction_type, user_id)
            `
                )
                .eq('chapter_id', chapterId)
                .is('parent_id', null)
                .order('created_at', { ascending: false })
                .range(offset, offset + COMMENTS_PER_PAGE - 1)

            if (error) {
                console.error('Ошибка загрузки комментариев:', error)
                return
            }

            // Трансформируем данные в нужный формат
            const transformedComments = commentsData?.map((comment: any) => ({
                id: comment.id,
                user_id: comment.user_id,
                username: comment.users?.username || 'Аноним',
                content: comment.content,
                created_at: comment.created_at,
                parent_id: null,
                comment_reactions: comment.comment_reactions || [],
            })) || []

            setComments(transformedComments)

            // Подсчёт всех комментариев для пагинации
            const { count } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('chapter_id', chapterId)
                .is('parent_id', null)

            setTotalPages(Math.ceil((count || 0) / COMMENTS_PER_PAGE))

            if (!silent) setLoading(false)
        } catch (err) {
            console.error('Ошибка при загрузке комментариев:', err)
        }
    }, [chapterId, page, supabase])

    useEffect(() => {
        fetchComments()
    }, [fetchComments])

    const addComment = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!userId) {
            alert('Пожалуйста, авторизуйтесь')
            return
        }

        if (!newComment.trim()) {
            alert('Комментарий не может быть пустым')
            return
        }

        const { error } = await supabase.from('comments').insert({
            user_id: userId,
            chapter_id: chapterId,
            content: newComment,
            parent_id: null,
        })

        if (error) {
            console.error('Ошибка добавления комментария:', error)
            alert('Ошибка при добавлении комментария')
            return
        }

        setNewComment('')
        fetchComments()
    }

    const addReply = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!userId) {
            alert('Пожалуйста, авторизуйтесь')
            return
        }

        if (!replyText.trim()) {
            alert('Ответ не может быть пустым')
            return
        }

        const { error } = await supabase.from('comments').insert({
            user_id: userId,
            chapter_id: chapterId,
            content: replyText,
            parent_id: replyingTo,
        })

        if (error) {
            console.error('Ошибка добавления ответа:', error)
            return
        }

        setReplyText('')
        setReplyingTo(null)
        fetchComments()
    }

    const toggleReaction = async (
        commentId: string,
        reactionType: 'like' | 'dislike'
    ) => {
        if (!userId) {
            alert('Пожалуйста, авторизуйтесь')
            return
        }

        const { data: existing } = await supabase
            .from('comment_reactions')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_id', userId)
            .eq('reaction_type', reactionType)
            .single()

        if (existing) {
            await supabase
                .from('comment_reactions')
                .delete()
                .eq('id', existing.id)
        } else {
            await supabase.from('comment_reactions').insert({
                comment_id: commentId,
                user_id: userId,
                reaction_type: reactionType,
            })
        }

        fetchComments()
    }

    if (loading) return <div className="text-center py-8">Загрузка...</div>

    return (
        <div className="mt-12 pt-8 border-t border-burgundy/20">
            <h3 className="text-2xl font-serif text-burgundy mb-6">
                Комментарии
            </h3>

            {userId && (
                <form onSubmit={addComment} className="mb-8">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Напишите комментарий..."
                        className="w-full p-3 border border-burgundy/20 rounded-lg resize-none mb-3"
                        rows={3}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-burgundy text-warmBg rounded font-serif hover:bg-burgundy/90 transition-colors"
                    >
                        Отправить
                    </button>
                </form>
            )}

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className="bg-burgundy/5 p-4 rounded-lg"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-sm text-warmText font-serif">
                                <strong>{comment.username}</strong>
                            </div>
                            <div className="text-xs text-warmText/60">
                                {new Date(comment.created_at).toLocaleDateString(
                                    'ru-RU'
                                )}
                            </div>
                        </div>

                        <p className="text-warmText mb-3">{comment.content}</p>

                        <div className="flex gap-4 items-center">
                            <button
                                onClick={() =>
                                    toggleReaction(comment.id, 'like')
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
                                    toggleReaction(comment.id, 'dislike')
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

                            {userId && (
                                <button
                                    onClick={() => setReplyingTo(comment.id)}
                                    className="flex items-center gap-1 text-sm text-warmText hover:text-burgundy transition-colors"
                                >
                                    <Reply className="w-4 h-4" />
                                    Ответить
                                </button>
                            )}
                        </div>

                        {replyingTo === comment.id && (
                            <form
                                onSubmit={addReply}
                                className="mt-4 pt-4 border-t border-burgundy/10"
                            >
                                <textarea
                                    value={replyText}
                                    onChange={(e) =>
                                        setReplyText(e.target.value)
                                    }
                                    placeholder="Напишите ответ..."
                                    className="w-full p-3 border border-burgundy/20 rounded-lg resize-none mb-2 text-sm"
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="px-3 py-1 bg-burgundy text-warmBg rounded text-sm font-serif hover:bg-burgundy/90"
                                    >
                                        Отправить
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReplyingTo(null)}
                                        className="px-3 py-1 bg-warmBgAccent rounded text-sm"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1 rounded text-sm font-serif transition-colors ${
                                    page === p
                                        ? 'bg-burgundy text-warmBg font-bold'
                                        : 'bg-burgundy/10 text-warmText hover:bg-burgundy/20'
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    )
}