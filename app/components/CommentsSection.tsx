'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
    id: string;
    userId: string;
    username: string;
    parentId: string | null;
    content: string;
    createdAt: string;
    likes: number;
    dislikes: number;
    replies: Comment[];
    status?: 'pending' | 'approved' | 'rejected';
}

interface CommentsSectionProps {
    bookId: string;
}

export default function CommentsSection({ bookId }: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'moderator' | 'user' | null>(null);
    const [userReactions, setUserReactions] = useState<Record<string, 'like' | 'dislike'>>({});
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/comments/${bookId}`);
            if (!res.ok) {
                setComments([]);
                return;
            }
            const data = await res.json();
            setComments(Array.isArray(data) ? data : data.comments || []);
        } catch (err) {
            console.error('Failed to fetch comments', err);
            setComments([]);
        } finally {
            setLoading(false);
        }
    }, [bookId]);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);

            if (session?.user?.id) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                setUserRole(userData?.role || 'user');
            }
        };
        checkAuth();
        fetchComments();
    }, [fetchComments]);
    useEffect(() => {
        if (loading) return; // ждём пока комменты загрузятся

        const hash = window.location.hash;
        if (hash.startsWith('#comment-')) {
            const commentId = hash.replace('#comment-', '');

            const timer = setTimeout(() => {
                const element = document.getElementById(`comment-${commentId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-2', 'ring-antique-gold', 'rounded-lg');
                    setTimeout(() => {
                        element.classList.remove('ring-2', 'ring-antique-gold', 'rounded-lg');
                    }, 3000);
                }
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [loading, comments]);

    // 🆕 Функция с AI проверкой
    // Отправка комментария — вся проверка (AI + уведомление) теперь на бэкенде
    const submitCommentWithAI = async (text: string, parentId?: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setIsAuthenticated(false);
            return null;
        }

        try {
            const res = await fetch(`/api/comments/${bookId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    content: text,
                    parentId: parentId || null,
                }),
            });

            return res;
        } catch (err) {
            console.error('Submit failed', err);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await submitCommentWithAI(newComment);

            if (res?.ok) {
                const data = await res.json();
                setNewComment('');
                await fetchComments();

                if (data?.status === 'pending') {
                    toast('Комментарий отправлен на модерацию', { icon: '⏳' });
                } else {
                    toast.success('Комментарий опубликован');
                }
            } else if (res) {
                const error = await res.json().catch(() => ({}));
                toast.error(error?.error || 'Не удалось отправить комментарий');
            } else {
                toast.error('Войдите, чтобы оставить комментарий');
            }
        } catch (err) {
            console.error('Failed to submit comment', err);
            toast.error('Ошибка при отправке комментария');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitReply = async (parentId: string) => {
        if (!replyContent.trim()) return;

        setSubmittingReply(true);
        try {
            const res = await submitCommentWithAI(replyContent, parentId);

            if (res?.ok) {
                const data = await res.json();
                setReplyContent('');
                setReplyingTo(null);
                await fetchComments();

                if (data?.status === 'pending') {
                    toast('Ответ отправлен на модерацию', { icon: '⏳' });
                } else {
                    toast.success('Ответ опубликован');
                }
            } else if (res) {
                const error = await res.json().catch(() => ({}));
                toast.error(error?.error || 'Не удалось отправить ответ');
            } else {
                toast.error('Войдите, чтобы ответить');
            }
        } catch (err) {
            console.error('Failed to submit reply', err);
            toast.error('Ошибка при отправке ответа');
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleReaction = async (commentId: string, reactionType: 'like' | 'dislike') => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setIsAuthenticated(false);
            return;
        }

        setUserReactions((prev) => {
            const next = { ...prev };
            if (prev[commentId] === reactionType) {
                delete next[commentId];
            } else {
                next[commentId] = reactionType;
            }
            return next;
        });

        try {
            await fetch(`/api/comments/reactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ commentId, reactionType }),
            });
            await fetchComments();
        } catch (err) {
            console.error('Failed to submit reaction', err);
            fetchComments();
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Вы уверены? Этот комментарий будет удален безвозвратно.')) return;

        setDeletingCommentId(commentId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setIsAuthenticated(false);
                return;
            }

            const res = await fetch(`/api/comments/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ commentId }),
            });

            if (res.ok) {
                await fetchComments();
                toast.success('Комментарий удалён');
            } else {
                const error = await res.json();
                toast.error(`Ошибка: ${error.error || 'Не удалось удалить комментарий'}`);
            }
        } catch (err) {
            console.error('Failed to delete comment', err);
            toast.error('Ошибка при удалении комментария');
        } finally {
            setDeletingCommentId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderComment = (comment: Comment, depth = 0) => (
        <div
            id={`comment-${comment.id}`}
            key={comment.id}
            className={`border-b border-archive-olive/10 pb-4 transition-all ${
                depth > 0 ? 'ml-8 mt-4 border-l-2 border-antique-gold/20 pl-4' : ''
            }`}
        >
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <span className="font-interface text-sm font-semibold text-ink">
                        {comment.username}
                    </span>
                    {comment.status === 'pending' && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                            На модерации
                        </span>
                    )}
                    {comment.status === 'rejected' && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                            Отклонено
                        </span>
                    )}
                </div>
                <span className="font-interface text-xs text-reader-muted">
                    {formatDate(comment.createdAt)}
                </span>
            </div>
            <p className="font-reader text-sm text-reader-text mb-2">{comment.content}</p>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => handleReaction(comment.id, 'like')}
                    disabled={!isAuthenticated}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                        userReactions[comment.id] === 'like'
                            ? 'text-antique-gold'
                            : 'text-reader-muted hover:text-ink'
                    } disabled:cursor-not-allowed`}
                >
                    👍 {comment.likes}
                </button>
                <button
                    onClick={() => handleReaction(comment.id, 'dislike')}
                    disabled={!isAuthenticated}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                        userReactions[comment.id] === 'dislike'
                            ? 'text-burgundy'
                            : 'text-reader-muted hover:text-ink'
                    } disabled:cursor-not-allowed`}
                >
                    👎 {comment.dislikes}
                </button>
                {isAuthenticated && comment.status !== 'rejected' && (
                    <button
                        onClick={() => {
                            setReplyingTo(replyingTo === comment.id ? null : comment.id);
                            setReplyContent('');
                        }}
                        className="text-sm text-reader-muted hover:text-ink transition-colors"
                    >
                        Ответить
                    </button>
                )}
                {(userRole === 'admin' || userRole === 'moderator') && (
                    <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="text-sm text-reader-muted hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                        title="Удалить комментарий"
                    >
                        <Trash2 size={16} />
                        {deletingCommentId === comment.id ? 'Удаление...' : 'Удалить'}
                    </button>
                )}
            </div>

            {replyingTo === comment.id && (
                <div className="mt-3">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Написать ответ..."
                        className="w-full border border-archive-olive/30 rounded-lg p-2 font-interface text-sm text-ink resize-none focus:outline-none focus:border-antique-gold"
                        rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={submittingReply || !replyContent.trim()}
                            className="px-3 py-1 bg-antique-gold text-white rounded-lg text-sm font-interface hover:bg-ink transition-colors disabled:opacity-50"
                        >
                            {submittingReply ? 'Отправка...' : 'Отправить'}
                        </button>
                        <button
                            onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                            }}
                            className="px-3 py-1 text-sm text-reader-muted hover:text-ink transition-colors"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div>
                    {comment.replies.map((reply) => renderComment(reply, depth + 1))}
                </div>
            )}
        </div>
    );

    return (
        <section className="mt-16 pt-8 border-t border-archive-olive/20">
            <h2 className="font-display text-h3 text-ink mb-6">Комментарии</h2>

            {isAuthenticated === false && (
                <div className="bg-antique-gold/10 border border-antique-gold/30 rounded-lg p-4 mb-6 text-sm font-interface text-ink">
                    Чтобы оставить комментарий, пожалуйста,{' '}
                    <a href="/login" className="text-antique-gold underline hover:text-ink">
                        войдите
                    </a>{' '}
                    или{' '}
                    <a href="/register" className="text-antique-gold underline hover:text-ink">
                        зарегистрируйтесь
                    </a>
                    .
                </div>
            )}

            {isAuthenticated && (
                <form onSubmit={handleSubmit} className="mb-8">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Написать комментарий..."
                        className="w-full border border-archive-olive/30 rounded-lg p-3 font-interface text-sm text-ink resize-none focus:outline-none focus:border-antique-gold"
                        rows={3}
                    />
                    <button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="mt-2 px-4 py-2 bg-antique-gold text-white rounded-lg text-sm font-interface hover:bg-ink transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Отправка...' : 'Отправить'}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="text-reader-muted font-reader text-sm">Загрузка комментариев...</div>
            ) : comments.length === 0 ? (
                <div className="text-reader-muted font-reader text-sm">Комментариев пока нет. Будьте первым!</div>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => renderComment(comment))}
                </div>
            )}
        </section>
    );
}