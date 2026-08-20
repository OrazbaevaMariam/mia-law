"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/app/components/ui/Container";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";
import { NotificationBell } from "@/app/components/layout/NotificationBell";

const links = [
    { href: "/", label: "Главная" },
    { href: "/library", label: "Библиотека" },
    { href: "/blog", label: "Блог" },
];

export function Header() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profileName, setProfileName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleProfileUpdated = (e: Event) => {
            const customEvent = e as CustomEvent<{ fullName: string }>;
            setProfileName(customEvent.detail.fullName);
        };

        window.addEventListener("profile-updated", handleProfileUpdated);

        return () => {
            window.removeEventListener("profile-updated", handleProfileUpdated);
        };
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();

                setProfileName(profile?.full_name ?? null);
            }

            setLoading(false);
        };
        void getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user || null);

            if (session?.user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", session.user.id)
                    .single();
                setProfileName(profile?.full_name ?? null);
            } else {
                setProfileName(null);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const userName = profileName || user?.email?.split('@')[0] || 'Пользователь';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <header className="border-b border-slate-200">
            <Container>
                <nav className="flex items-center justify-between h-16">
                    <Link href="/" className="font-bold text-xl">
                        MIA Law
                    </Link>
                    <div className="flex items-center gap-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-slate-600 hover:text-slate-900 transition"
                            >
                                {link.label}
                            </Link>
                        ))}
                        {!loading && user && (
                            <Link
                                href="/favorites"
                                className="text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
                                title="Мои избранные книги"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Избранное
                            </Link>
                        )}
                        {!loading && user && <NotificationBell />}
                        {!loading && (
                            user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-600 text-sm">
                                        👤 {userName}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                                    >
                                        Выход
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                >
                                    Вход
                                </Link>
                            )
                        )}
                    </div>
                </nav>
            </Container>
        </header>
    );
}