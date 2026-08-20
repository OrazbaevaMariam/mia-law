"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { emitProfileUpdated } from "@/app/lib/profile-events";
import { Container } from "@/app/components/ui/Container";

export default function ProfilePage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setInitialLoading(false);
                return;
            }

            setUserId(user.id);
            setEmail(user.email ?? "");

            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single();

            if (profile?.full_name) {
                setFullName(profile.full_name);
            }

            setInitialLoading(false);
        };

        loadProfile();
    }, []);

    const handleUpdate = async () => {
        if (!userId) return;
        setLoading(true);
        setMessage("");

        const { error } = await supabase
            .from("profiles")
            .update({ full_name: fullName })
            .eq("id", userId);

        setLoading(false);

        if (error) {
            setMessage("❌ Ошибка: " + error.message);
        } else {
            setMessage("✅ Профиль обновлён!");
            emitProfileUpdated(fullName);
            router.refresh();
        }
    };

    if (initialLoading) {
        return (
            <Container>
                <div className="py-12">Загрузка...</div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="py-12 max-w-xl">
                <h1 className="text-3xl font-bold mb-8">Мой профиль</h1>

                <div className="mb-6">
                    <label className="block text-sm text-gray-500 mb-1">Email</label>
                    <p className="text-lg">{email}</p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-gray-500 mb-1">Имя</label>
                    <input
                        type="text"
                        placeholder="Введите ваше имя"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="border px-4 py-2 rounded w-full"
                    />
                </div>

                <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mb-8"
                >
                    {loading ? "Сохраняю..." : "Сохранить"}
                </button>

                {message && <p className="mb-8">{message}</p>}

                <div className="border-t pt-6 flex flex-col gap-3">
                    <Link href="/favorites" className="text-blue-600 hover:underline">
                        ❤️ Мои избранные книги
                    </Link>
                    <Link href="/profile/subscription" className="text-blue-600 hover:underline">
                        💳 Моя подписка
                    </Link>
                    <Link href="/profile/settings" className="text-blue-600 hover:underline">
                        ⚙️ Настройки
                    </Link>
                </div>
            </div>
        </Container>
    );
}