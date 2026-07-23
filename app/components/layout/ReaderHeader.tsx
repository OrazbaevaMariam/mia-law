"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function ReaderHeader() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);

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
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/reader" className="text-xl font-bold text-blue-600">
                    MiaLaw Reader
                </Link>
                <div className="relative">
                    {loading ? (
                        <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
                    ) : user ? (
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100"
                        >
                            <span className="text-sm text-slate-700">{user.email}</span>
                        </button>
                    ) : (
                        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Вход
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
