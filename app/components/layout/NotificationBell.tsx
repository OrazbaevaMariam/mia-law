"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase-client";

interface Notification {
    id: string;
    type: string;
    message: string;
    comment_id: string | null;
    is_read: boolean;
    created_at: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const loadNotifications = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setLoading(true);
        try {
            const res = await fetch("/api/notifications", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (err) {
            console.error("Error loading notifications:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadNotifications();
        const interval = setInterval(() => void loadNotifications(), 60000);
        return () => clearInterval(interval);
    }, [loadNotifications]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (notificationId: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );

        await fetch("/api/notifications", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ notificationId }),
        });
    };

    const markAllAsRead = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

        await fetch("/api/notifications", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ markAll: true }),
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative p-2 text-slate-600 hover:text-slate-900 transition"
                title="Уведомления"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between p-3 border-b border-slate-100">
                        <span className="font-semibold text-slate-900">Уведомления</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => void markAllAsRead()}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Прочитать все
                            </button>
                        )}
                    </div>

                    {loading && (
                        <div className="p-4 text-center text-slate-500 text-sm">Загрузка...</div>
                    )}

                    {!loading && notifications.length === 0 && (
                        <div className="p-4 text-center text-slate-500 text-sm">Нет уведомлений</div>
                    )}

                    {!loading && notifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => !n.is_read && void markAsRead(n.id)}
                            className={`p-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition ${
                                !n.is_read ? "bg-blue-50" : ""
                            }`}
                        >
                            <p className="text-sm text-slate-800">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{formatDate(n.created_at)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}