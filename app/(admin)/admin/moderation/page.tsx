'use client'

import {useEffect, useState, useCallback} from 'react'
import toast from 'react-hot-toast'
import {supabase} from '@/lib/supabase-client'

interface Comment {
    id: string
    content: string
    book_id: string
    user_id: string
    status: 'pending' | 'approved' | 'rejected'
    ai_score: number
    created_at: string
    chapter_id: string | null
    parent_id: string | null
    username?: string
    email?: string
    bookTitle?: string
    likes?: number
    dislikes?: number
    parentContent?: string
    parentStatus?: 'pending' | 'approved' | 'rejected' | null
}

export default function ModerationPage() {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [rejectReason, setRejectReason] = useState<Record<string, string>>({})
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const PAGE_SIZE = 20
    const [searchQuery, setSearchQuery] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [pageInput, setPageInput] = useState('')

    const loadComments = useCallback(async () => {
        try {
            setLoading(true)

            const {data: allComments, error: commentsError} = await supabase
                .from('comments')
                .select('*')
                .order('created_at', {ascending: false})

            if (commentsError) {
                console.error('Error fetching comments:', commentsError)
                setLoading(false)
                return
            }

            if (!allComments || allComments.length === 0) {
                setComments([])
                setLoading(false)
                return
            }

            const userIds = [...new Set(allComments.map((c: Comment) => c.user_id))]
            const bookIds = [...new Set(allComments.map((c: Comment) => c.book_id))]
            const parentCommentIds = [...new Set(
                allComments
                    .filter((c: Comment) => c.parent_id)
                    .map((c: Comment) => c.parent_id as string)
            )]

            const profilesRes = await fetch('/api/admin/profiles', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userIds}),
            })
            const profilesData = await profilesRes.json()
            const profiles = profilesData.profiles

            const [chaptersRes, booksRes, reactionsRes, parentCommentsRes] = await Promise.all([
                supabase.from('chapters').select('id, title, book_id').in('id', bookIds),
                supabase.from('books').select('slug, title').in('slug', bookIds),
                supabase
                    .from('comment_reactions')
                    .select('comment_id, reaction_type')
                    .in('comment_id', allComments.map((c: Comment) => c.id)),
                parentCommentIds.length > 0
                    ? supabase.from('comments').select('id, content, status').in('id', parentCommentIds)
                    : Promise.resolve({data: []}),
            ])

            const chapters = chaptersRes.data
            const books = booksRes.data
            const reactions = reactionsRes.data
            const parentComments = parentCommentsRes.data

            const profileMap = new Map()
            profiles?.forEach((p: { id: string; email: string; full_name: string | null }) => {
                const username = p.full_name?.trim() || p.email?.split('@')[0] || 'Unknown'
                profileMap.set(p.id, {username, email: p.email})
            })

            const chapterMap = new Map(chapters?.map((c: { id: string; title: string }) => [c.id, c.title]) || [])
            const bookMap = new Map(books?.map((b: { slug: string; title: string }) => [b.slug, b.title]) || [])
            const parentMap = new Map(
                parentComments?.map((c: { id: string; content: string; status: string }) => [
                    c.id,
                    {content: c.content, status: c.status},
                ]) || []
            )

            const reactionsMap = new Map<string, { likes: number; dislikes: number }>()
            reactions?.forEach((r: { comment_id: string; reaction_type: string }) => {
                if (!reactionsMap.has(r.comment_id)) {
                    reactionsMap.set(r.comment_id, {likes: 0, dislikes: 0})
                }
                const current = reactionsMap.get(r.comment_id)!
                if (r.reaction_type === 'like') {
                    current.likes++
                } else {
                    current.dislikes++
                }
            })

            const enrichedComments = allComments.map((c: Comment) => {
                const userInfo = profileMap.get(c.user_id) || {username: 'Unknown', email: 'unknown@example.com'}

                let bookTitle = chapterMap.get(c.book_id)
                if (!bookTitle) bookTitle = bookMap.get(c.book_id)
                if (!bookTitle) bookTitle = c.book_id

                const reactionData = reactionsMap.get(c.id) || {likes: 0, dislikes: 0}
                const parentData = c.parent_id ? parentMap.get(c.parent_id) : undefined

                return {
                    ...c,
                    username: userInfo.username,
                    email: userInfo.email,
                    bookTitle,
                    likes: reactionData.likes,
                    dislikes: reactionData.dislikes,
                    parentContent: parentData?.content,
                    parentStatus: parentData?.status,
                } as Comment
            })

            setComments(enrichedComments)
        } catch (err) {
            console.error('Error loading comments:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadComments()
    }, [loadComments])

    const getAuthHeader = async (): Promise<Record<string, string>> => {
        const {data: {session}} = await supabase.auth.getSession()
        return session?.access_token ? {Authorization: `Bearer ${session.access_token}`} : {}
    }

    const approve = async (commentId: string) => {
        try {
            const authHeader = await getAuthHeader()
            const res = await fetch('/api/admin/comments/status', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', ...authHeader},
                body: JSON.stringify({commentId, status: 'approved'}),
            })

            if (res.ok) {
                setComments((prev) => prev.map((c) => (c.id === commentId ? {...c, status: 'approved'} : c)))
                setSelectedComment(null)
                toast.success('Комментарий одобрен')
            } else {
                const data = await res.json().catch(() => ({}))
                toast.error(data.error || 'Не удалось одобрить комментарий')
            }
        } catch (err) {
            toast.error('Ошибка при одобрении')
            console.error(err)
        }
    }

    const reject = async (commentId: string) => {
        try {
            const reason = rejectReason[commentId] || 'Нарушение правил'
            const authHeader = await getAuthHeader()

            const res = await fetch('/api/admin/comments/status', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', ...authHeader},
                body: JSON.stringify({commentId, status: 'rejected', reason}),
            })

            if (res.ok) {
                setComments((prev) => prev.map((c) => (c.id === commentId ? {...c, status: 'rejected'} : c)))
                setSelectedComment(null)
                setRejectReason((prev) => {
                    const next = {...prev}
                    delete next[commentId]
                    return next
                })
                toast.success('Комментарий отклонён')
            } else {
                const data = await res.json().catch(() => ({}))
                toast.error(data.error || 'Не удалось отклонить комментарий')
            }
        } catch (err) {
            toast.error('Ошибка при отклонении')
            console.error(err)
        }
    }

    const deleteComment = async (commentId: string) => {
        if (!window.confirm('Вы уверены? Комментарий будет удален навсегда.')) return
        try {
            const authHeader = await getAuthHeader()
            const response = await fetch('/api/admin/comments/delete', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json', ...authHeader},
                body: JSON.stringify({commentId}),
            })

            if (response.ok) {
                setComments((prev) => prev.filter((c) => c.id !== commentId))
                setSelectedComment(null)
                toast.success('Комментарий удалён')
            } else {
                const data = await response.json().catch(() => ({}))
                toast.error(data.error || 'Не удалось удалить комментарий')
            }
        } catch (err) {
            toast.error('Ошибка при удалении')
            console.error(err)
        }
    }

    const scrollToComment = (commentId: string) => {
        setFilterStatus('all')
        setTimeout(() => {
            const row = document.getElementById(`comment-row-${commentId}`)
            if (row) {
                row.scrollIntoView({behavior: 'smooth', block: 'center'})
                row.classList.add('bg-yellow-100')
                setTimeout(() => row.classList.remove('bg-yellow-100'), 2000)
            }
        }, 100)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getRiskColor = (score: number) => {
        if (score > 0.7) return 'bg-red-100 text-red-800'
        if (score > 0.4) return 'bg-yellow-100 text-yellow-800'
        return 'bg-green-100 text-green-800'
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const filteredComments = comments.filter((c) => {
        if (filterStatus !== 'all' && c.status !== filterStatus) return false

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase()
            const matches =
                c.content?.toLowerCase().includes(q) ||
                c.username?.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q)
            if (!matches) return false
        }

        if (dateFrom) {
            const from = new Date(dateFrom)
            from.setHours(0, 0, 0, 0)
            if (new Date(c.created_at) < from) return false
        }

        if (dateTo) {
            const to = new Date(dateTo)
            to.setHours(23, 59, 59, 999)
            if (new Date(c.created_at) > to) return false
        }

        return true
    })

    const totalPages = Math.max(1, Math.ceil(filteredComments.length / PAGE_SIZE))
    const safePage = Math.min(currentPage, totalPages)
    const paginatedComments = filteredComments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

    const goToPage = (page: number) => {
        const target = Math.min(Math.max(1, page), totalPages)
        setCurrentPage(target)
        setPageInput('')
    }

    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = []
        const delta = 1
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= safePage - delta && i <= safePage + delta)) {
                pages.push(i)
            } else if (pages[pages.length - 1] !== 'ellipsis') {
                pages.push('ellipsis')
            }
        }
        return pages
    }

    const stats = {
        total: comments.length,
        pending: comments.filter((c) => c.status === 'pending').length,
        approved: comments.filter((c) => c.status === 'approved').length,
        rejected: comments.filter((c) => c.status === 'rejected').length,
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">📝 Модерация комментариев</h1>

            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 font-semibold">Всего</div>
                    <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-600 font-semibold">На модерации</div>
                    <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600 font-semibold">Одобрено</div>
                    <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-sm text-red-600 font-semibold">Отклонено</div>
                    <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 items-end bg-gray-50 p-4 rounded-lg border">
                <div className="flex-1 min-w-[240px]">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Поиск (автор, email, текст)
                    </label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder="Введите текст, имя или email..."
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Дата от</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Дата до</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>
                {(searchQuery || dateFrom || dateTo) && (
                    <button
                        onClick={() => {
                            setSearchQuery('')
                            setDateFrom('')
                            setDateTo('')
                            setCurrentPage(1)
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold transition"
                    >
                        Сбросить
                    </button>
                )}
            </div>

            <div className="flex gap-2 mb-8 flex-wrap">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => {
                            setFilterStatus(status)
                            setCurrentPage(1)
                        }}
                        className={`px-4 py-2 rounded font-semibold transition ${
                            filterStatus === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        {status === 'all'
                            ? 'Все'
                            : status === 'pending'
                                ? '⏳ На модерации'
                                : status === 'approved'
                                    ? '✓ Одобрено'
                                    : '✗ Отклонено'}
                    </button>
                ))}
            </div>

            {loading && <div className="text-gray-600 text-center py-12">Загрузка комментариев...</div>}

            {!loading && filteredComments.length === 0 && (
                <div className="text-gray-500 text-center py-12 bg-gray-50 rounded">✓ Нет комментариев</div>
            )}

            {!loading && filteredComments.length > 0 && (
                <div className="overflow-x-auto border rounded-lg shadow-sm">
                    <table className="w-full min-w-max text-sm">
                        <thead className="bg-gray-50 border-b sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Автор</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Комментарий</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Ответ на</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Книга</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Дата</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">👍 👎</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Риск</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">Статус</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700 w-32 sticky right-0 bg-gray-50 z-10">
                                Действия
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {paginatedComments.map((comment) => (
                            <tr
                                key={comment.id}
                                id={`comment-row-${comment.id}`}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedComment(comment)}
                            >
                                <td className="px-3 py-2">
                                    <div className="font-medium text-gray-900">{comment.username}</div>
                                    <div className="text-xs text-gray-500">{comment.email}</div>
                                </td>
                                <td className="px-3 py-2 max-w-xs">
                                    <p className="truncate">{comment.content}</p>
                                </td>
                                <td className="px-3 py-2 max-w-xs">
                                    {comment.parent_id ? (
                                        comment.parentStatus === 'approved' ? (
                                            <a
                                                href={`/reader/${comment.book_id}#comment-${comment.parent_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {comment.parentContent?.substring(0, 30)}...
                                            </a>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    scrollToComment(comment.parent_id!)
                                                }}
                                                className="text-gray-500 hover:text-blue-600 text-sm italic underline decoration-dotted text-left"
                                                title="Перейти к родительскому комментарию в очереди модерации"
                                            >
                                                {comment.parentContent?.substring(0, 30)}... (на модерации)
                                            </button>
                                        )
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="px-3 py-2">
                                    <a
                                        href={`/reader/${comment.book_id}#comment-${comment.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline font-medium text-xs"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {comment.bookTitle} ↗
                                    </a>
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                                    {formatDate(comment.created_at)}
                                </td>
                                <td className="px-3 py-2 text-center text-xs whitespace-nowrap">
                                    <span className="text-green-600">{comment.likes || 0}</span>
                                    {' / '}
                                    <span className="text-red-600">{comment.dislikes || 0}</span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <span
                                        className={`inline-block px-2 py-1 rounded text-xs font-bold ${getRiskColor(comment.ai_score)}`}
                                    >
                                        {Math.round(comment.ai_score * 100)}%
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <span
                                        className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusColor(comment.status)}`}
                                    >
                                        {comment.status === 'approved' ? '✓' : comment.status === 'pending' ? '⏳' : '✗'}
                                    </span>
                                </td>
                                <td className="px-3 py-2 sticky right-0 bg-white z-10">
                                    <div className="flex gap-1 justify-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedComment(comment)
                                            }}
                                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-semibold transition"
                                            title="Просмотр"
                                        >
                                            👁
                                        </button>
                                        {comment.status !== 'approved' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    void approve(comment.id)
                                                }}
                                                className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-semibold transition"
                                                title="Одобрить"
                                            >
                                                ✓
                                            </button>
                                        )}
                                        {comment.status !== 'rejected' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    void reject(comment.id)
                                                }}
                                                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-semibold transition"
                                                title="Отклонить"
                                            >
                                                ✗
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                void deleteComment(comment.id)
                                            }}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-semibold transition"
                                            title="Удалить"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && filteredComments.length > 0 && (
                <div className="flex items-center justify-between mt-6 gap-4 flex-wrap">
                    <div className="text-sm text-gray-600">
                        Страница {safePage} из {totalPages} · Всего: {filteredComments.length}
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                        <button
                            onClick={() => goToPage(safePage - 1)}
                            disabled={safePage === 1}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold transition"
                        >
                            ← Назад
                        </button>

                        {getPageNumbers().map((p, idx) =>
                            p === 'ellipsis' ? (
                                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => goToPage(p)}
                                    className={`px-3 py-2 rounded text-sm font-semibold transition min-w-[36px] ${
                                        p === safePage
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                >
                                    {p}
                                </button>
                            )
                        )}

                        <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const page = parseInt(pageInput, 10)
                                    if (!isNaN(page)) goToPage(page)
                                }
                            }}
                            placeholder="№"
                            className="w-16 px-2 py-2 border border-gray-300 rounded text-center text-sm focus:border-blue-500 focus:outline-none"
                        />

                        <button
                            onClick={() => goToPage(safePage + 1)}
                            disabled={safePage === totalPages}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold transition"
                        >
                            Вперёд →
                        </button>
                    </div>
                </div>
            )}

            {selectedComment && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedComment(null)}
                >
                    <div
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold">Детали комментария</h2>
                            <button
                                onClick={() => setSelectedComment(null)}
                                className="text-2xl text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Автор</label>
                                <p className="text-gray-900 font-medium">{selectedComment.username}</p>
                                <p className="text-sm text-gray-600">{selectedComment.email}</p>
                            </div>

                            {selectedComment.status === 'approved' && (
                                <div>
                                    <a
                                        href={`/reader/${selectedComment.book_id}#comment-${selectedComment.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-semibold"
                                    >
                                        📖 Перейти к комментарию на странице книги ↗
                                    </a>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Текст комментария</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedComment.content}</p>
                            </div>

                            {selectedComment.parent_id && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ответ на:</label>
                                    <a
                                        href={`/reader/${selectedComment.book_id}#comment-${selectedComment.parent_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block bg-blue-50 p-3 rounded border border-blue-200 hover:bg-blue-100 transition"
                                    >
                                        <p className="text-xs text-blue-600 mb-1 font-semibold">
                                            ID: {selectedComment.parent_id}
                                        </p>
                                        <p className="text-gray-900 italic text-sm">
                                            {`"`}{selectedComment.parentContent || '(комментарий удален)'}{`"`}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-2 font-semibold">
                                            Открыть на странице книги ↗
                                        </p>
                                    </a>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Лайки</label>
                                    <p className="text-2xl font-bold text-green-600">{selectedComment.likes || 0}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Дизлайки</label>
                                    <p className="text-2xl font-bold text-red-600">{selectedComment.dislikes || 0}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">AI Риск</label>
                                    <span
                                        className={`inline-block px-3 py-1 rounded font-bold ${getRiskColor(selectedComment.ai_score)}`}
                                    >
                                        {Math.round(selectedComment.ai_score * 100)}%
                                    </span>
                                </div>
                            </div>

                            {selectedComment.status !== 'rejected' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Причина отклонения (опционально):
                                    </label>
                                    <textarea
                                        value={rejectReason[selectedComment.id] || ''}
                                        onChange={(e) =>
                                            setRejectReason((prev) => ({
                                                ...prev,
                                                [selectedComment.id]: e.target.value,
                                            }))
                                        }
                                        placeholder="Например: Оскорбление, спам, нецензурные выражения..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                                        rows={3}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Текущий статус:</label>
                                <span
                                    className={`inline-block px-3 py-1 rounded font-bold text-sm ${getStatusColor(selectedComment.status)}`}
                                >
                                    {selectedComment.status === 'approved'
                                        ? '✓ Одобрен'
                                        : selectedComment.status === 'pending'
                                            ? '⏳ На модерации'
                                            : '✗ Отклонен'}
                                </span>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                {selectedComment.status !== 'approved' && (
                                    <button
                                        onClick={() => void approve(selectedComment.id)}
                                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold"
                                    >
                                        ✓ Одобрить
                                    </button>
                                )}
                                {selectedComment.status !== 'rejected' && (
                                    <button
                                        onClick={() => void reject(selectedComment.id)}
                                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-semibold"
                                    >
                                        ✗ Отклонить
                                    </button>
                                )}
                                <button
                                    onClick={() => void deleteComment(selectedComment.id)}
                                    className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition font-semibold"
                                >
                                    🗑 Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}