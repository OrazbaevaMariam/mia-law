"use client";

import Link from "next/link";
import { Container } from "@/app/components/ui/Container";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const links = [
    { href: "/", label: "Главная" },
    { href: "/library", label: "Библиотека" },
];

export function Header() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return (
        <header className="bg-white border-b border-slate-200">
            <Container>
                <div className="flex items-center justify-between py-4">
                    <Link href="/" className="text-2xl font-bold text-blue-600">
                        MiaLaw
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-slate-700 hover:text-blue-600 transition"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex gap-2">
                        {loading ? (
                            <div className="w-8 h-8 bg-slate-200 rounded animate-pulse" />
                        ) : user ? (
                            <Link href="/profile" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded">
                                Профиль
                            </Link>
                        ) : (
                            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Вход
                            </Link>
                        )}
                    </div>
                </div>
            </Container>
        </header>
    );
}
