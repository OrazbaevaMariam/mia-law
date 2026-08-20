'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {History, Download, X} from 'lucide-react'
import {formatDateTime} from '@/lib/format-utils'
import {supabase} from '@/lib/supabase-client'

interface User {
    id: string
    email: string
    username: string
    role: 'admin' | 'user' | 'moderator'
    status: 'active' | 'banned' | 'suspended'
    created_at: string
    last_sign_in_at: string | null
    last_login: string | null
    ban_reason: string | null
    banned_at: string | null
    banned_by: string | null
    favorites_count?: number
}

interface ModerationRecord {
    id: string
    action: string
    reason: string | null
    image_url: string | null
    created_at: string
    admin: { username: string; email: string } | null
}

interface BanModalState {
    isOpen: boolean
    userId: string | null
    reason: string
    imageFile: File | null
}

const SUPER_ADMIN_EMAIL = 'mariam.orazbaeva@icloud.com'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [showSpinner, setShowSpinner] = useState(false)
    const [filter, setFilter] = useState<'all' | 'admin' | 'user' | 'moderator'>('all')
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
    const [banModal, setBanModal] = useState<BanModalState>({
        isOpen: false,
        userId: null,
        reason: '',
        imageFile: null,
    })
    const [historyModal, setHistoryModal] = useState<{
        isOpen: boolean
        userId: string | null
        records: ModerationRecord[]
        loading: boolean
    }>({isOpen: false, userId: null, records: [], loading: false})

    const [lightboxImage, setLightboxImage] = useState<string | null>(null)

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 20

    const spinnerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    const isSuperAdmin = currentUserEmail === SUPER_ADMIN_EMAIL

    const loadUsers = useCallback(async () => {
        setLoading(true)
        spinnerTimeout.current = setTimeout(() => setShowSpinner(true), 400)

        try {
            const res = await fetch(`/api/admin/users?page=${page}&pageSize=${pageSize}`)
            if (!res.ok) throw new Error('Failed to load users')
            const data = await res.json()

            const filtered = filter === 'all'
                ? data.users
                : data.users.filter((u: User) => u.role === filter)

            setUsers(filtered)
            setTotalPages(data.totalPages)
        } catch (err) {
            console.error(err)
        } finally {
            if (spinnerTimeout.current) clearTimeout(spinnerTimeout.current)
            setShowSpinner(false)
            setLoading(false)
        }
    }, [filter, page])

    useEffect(() => {
        void loadUsers()
    }, [loadUsers])

    useEffect(() => {
        const getCurrentUser = async () => {
            const {data: {user}} = await supabase.auth.getUser()
            if (user) {
                setCurrentUserId(user.id)
                setCurrentUserEmail(user.email ?? null)
            }
        }
        void getCurrentUser()
    }, [])

    const updateRole = async (userId: string, newRole: User['role']) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId, role: newRole}),
            })

            if (!res.ok) {
                const data = await res.json()
                alert(data.error || 'Ошибка изменения роли')
                return
            }

            setUsers(users.map(u => u.id === userId ? {...u, role: newRole} : u))
        } catch (err) {
            console.error('Ошибка изменения роли:', err)
        }
    }

    const updateStatus = async (userId: string, newStatus: User['status']) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId, status: newStatus}),
            })

            if (!res.ok) throw new Error('Failed to update status')

            setUsers(users.map(u => u.id === userId ? {...u, status: newStatus} : u))
        } catch (err) {
            console.error('Ошибка изменения статуса:', err)
        }
    }

    const openBanModal = (userId: string, currentStatus: User['status']) => {
        if (currentStatus === 'banned') {
            void updateStatus(userId, 'active')
        } else {
            setBanModal({isOpen: true, userId, reason: '', imageFile: null})
        }
    }

    const uploadEvidenceImage = async (file: File, userId: string): Promise<string | null> => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`

        const {error} = await supabase.storage
            .from('moderation-evidence')
            .upload(fileName, file)

        if (error) {
            console.error('Ошибка загрузки изображения:', error)
            return null
        }

        const {data} = supabase.storage
            .from('moderation-evidence')
            .getPublicUrl(fileName)

        return data.publicUrl
    }

    const confirmBan = async () => {
        if (!banModal.userId) return

        try {
            let imageUrl: string | null = null

            if (banModal.imageFile) {
                imageUrl = await uploadEvidenceImage(banModal.imageFile, banModal.userId)
            }

            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    userId: banModal.userId,
                    status: 'banned',
                    ban_reason: banModal.reason || null,
                    imageUrl,
                }),
            })

            if (!res.ok) throw new Error('Failed to ban user')

            setUsers(users.map(u =>
                u.id === banModal.userId
                    ? {
                        ...u,
                        status: 'banned',
                        ban_reason: banModal.reason || null,
                        banned_at: new Date().toISOString(),
                    }
                    : u
            ))

            setBanModal({isOpen: false, userId: null, reason: '', imageFile: null})
        } catch (err) {
            console.error('Ошибка блокировки:', err)
        }
    }

    const openHistoryModal = async (userId: string) => {
        setHistoryModal({isOpen: true, userId, records: [], loading: true})

        try {
            const res = await fetch(`/api/admin/users/${userId}/history`)
            if (!res.ok) throw new Error('Failed to load history')
            const data = await res.json()
            setHistoryModal({isOpen: true, userId, records: data, loading: false})
        } catch (err) {
            console.error('Ошибка загрузки истории:', err)
            setHistoryModal({isOpen: true, userId, records: [], loading: false})
        }
    }

    const downloadImage = async (url: string) => {
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `evidence-${Date.now()}.jpg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        } catch (err) {
            console.error('Ошибка скачивания:', err)
        }
    }

    const getRoleBadge = (role: User['role']) => {
        const styles = {
            admin: 'bg-red-100 text-red-800',
            moderator: 'bg-blue-100 text-blue-800',
            user: 'bg-gray-100 text-gray-800'
        }
        return styles[role]
    }

    const getStatusBadge = (status: User['status']) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            banned: 'bg-red-100 text-red-800',
            suspended: 'bg-yellow-100 text-yellow-800'
        }
        return styles[status]
    }

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            banned: '🔴 Забанен',
            unbanned: '🟢 Разблокирован',
            suspended: '🟡 Заморожен',
            unsuspended: '🟢 Разморожен',
        }
        return labels[action] || action
    }

    const closeHistoryModal = () => {
        setHistoryModal({isOpen: false, userId: null, records: [], loading: false})
    }

    const closeBanModal = () => {
        setBanModal({isOpen: false, userId: null, reason: '', imageFile: null})
    }

    const getFormattedDate = (dateString: string | null) => {
        return formatDateTime(dateString)
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Пользователи</h1>
            <p className="text-gray-500 mb-8">Управление пользователями и их ролями</p>

            <div className="mb-6 flex gap-2">
                {(['all', 'admin', 'user', 'moderator'] as const).map(role => (
                    <button
                        key={role}
                        onClick={() => setFilter(role)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            filter === role
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {role === 'all' ? 'Все' : role === 'admin' ? 'Админы' : role === 'moderator' ? 'Модераторы' : 'Пользователи'}
                    </button>
                ))}
            </div>

            {showSpinner && loading && (
                <div className="p-8 text-center text-gray-500">Загрузка...</div>
            )}

            {!showSpinner && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-[1300px]">
                        <thead className="bg-gray-50 text-gray-500 text-left">
                        <tr>
                            <th className="p-4">Имя</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Роль</th>
                            <th className="p-4">Статус</th>
                            <th className="p-4">Избранное</th>
                            <th className="p-4">Последний вход</th>
                            <th className="p-4">Зарегистрирован</th>
                            <th className="p-4">Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="p-4 font-medium">{user.username || '—'}</td>
                                <td className="p-4 text-gray-600 text-xs">{user.email}</td>

                                <td className="p-4">
                                    <select
                                        value={user.role}
                                        disabled={user.id === currentUserId}
                                        onChange={(e) => updateRole(user.id, e.target.value as User['role'])}
                                        className={`${getRoleBadge(user.role)} px-3 py-1 rounded-lg font-medium text-sm cursor-pointer border-0 ${
                                            user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <option value="user">User</option>
                                        <option value="moderator">Moderator</option>
                                        {isSuperAdmin && (
                                            <option value="admin">Admin</option>
                                        )}
                                    </select>
                                </td>

                                <td className="p-4">
                                    <select
                                        value={user.status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value as User['status']
                                            if (newStatus === 'banned') {
                                                openBanModal(user.id, user.status)
                                            } else {
                                                void updateStatus(user.id, newStatus)
                                            }
                                        }}
                                        className={`${getStatusBadge(user.status)} px-3 py-1 rounded-lg font-medium text-sm cursor-pointer border-0`}
                                    >
                                        <option value="active">🟢 Активен</option>
                                        <option value="suspended">🟡 Заморожен</option>
                                        <option value="banned">🔴 Забанен</option>
                                    </select>
                                </td>

                                <td className="p-4">
                                    <span className="text-gray-600 font-medium">{user.favorites_count || 0}</span>
                                </td>

                                <td className="p-4 text-gray-600 text-xs">
                                    {getFormattedDate(user.last_sign_in_at || user.last_login)}
                                </td>

                                <td className="p-4 text-gray-600 text-xs">
                                    {getFormattedDate(user.created_at)}
                                </td>

                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openHistoryModal(user.id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-blue-600"
                                            title="История модерации"
                                        >
                                            <History size={18}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-100">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                ← Назад
                            </button>
                            <span className="text-sm text-gray-600">
                                Страница {page} из {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Вперёд →
                            </button>
                        </div>
                    )}

                    {users.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-500">
                            Пользователей не найдено
                        </div>
                    )}
                </div>
            )}

            {/* Модалка для блокировки */}
            {banModal.isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={closeBanModal}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Блокировка пользователя</h2>
                        <p className="text-gray-600 text-sm mb-4">
                            Введите причину блокировки (видна только вам):
                        </p>
                        <textarea
                            value={banModal.reason}
                            onChange={(e) =>
                                setBanModal({...banModal, reason: e.target.value})
                            }
                            placeholder="Например: спам, нарушение авторских прав, пиратство..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                        />

                        <p className="text-gray-600 text-sm mt-4 mb-2">
                            Прикрепить скриншот-доказательство (опционально):
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setBanModal({...banModal, imageFile: e.target.files?.[0] || null})
                            }
                            className="w-full text-sm text-gray-600 border border-gray-300 rounded-lg p-2"
                        />

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closeBanModal}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={confirmBan}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
                            >
                                Заблокировать
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка истории модерации */}
            {historyModal.isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={closeHistoryModal}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">История модерации</h2>
                            <button
                                onClick={closeHistoryModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24}/>
                            </button>
                        </div>

                        {historyModal.loading && (
                            <div className="text-center text-gray-500 py-8">Загрузка...</div>
                        )}

                        {!historyModal.loading && historyModal.records.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                История модерации пуста
                            </div>
                        )}

                        {!historyModal.loading && historyModal.records.length > 0 && (
                            <div className="space-y-4">
                                {historyModal.records.map((record) => (
                                    <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medium">{getActionLabel(record.action)}</span>
                                            <span className="text-xs text-gray-500">
                                                {getFormattedDate(record.created_at)}
                                            </span>
                                        </div>

                                        {record.reason && (
                                            <p className="text-sm text-gray-700 mb-2">
                                                <strong>Причина:</strong> {record.reason}
                                            </p>
                                        )}

                                        {record.image_url && (
                                            <div className="mt-2">
                                                <div className="relative inline-block group">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={record.image_url}
                                                        alt="Доказательство"
                                                        onClick={() => setLightboxImage(record.image_url)}
                                                        className="max-w-xs max-h-48 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition"
                                                    />
                                                    <button
                                                        onClick={() => void downloadImage(record.image_url!)}
                                                        className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded-lg shadow-sm transition opacity-0 group-hover:opacity-100"
                                                        title="Скачать"
                                                    >
                                                        <Download size={16} className="text-gray-700"/>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-500 mt-2">
                                            Модератор: {record.admin?.username || record.admin?.email || 'Неизвестно'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lightbox для полноэкранного просмотра картинки */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
                    >
                        <X size={32}/>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            void downloadImage(lightboxImage)
                        }}
                        className="absolute top-4 right-16 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition flex items-center gap-2"
                    >
                        <Download size={20}/>
                        <span className="text-sm">Скачать</span>
                    </button>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={lightboxImage}
                        alt="Доказательство (полный размер)"
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                </div>
            )}
        </div>
    )
}