'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Container } from '@/app/components/ui/Container';

const SUPER_ADMIN_EMAIL = 'mariam.orazbaeva@icloud.com';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 2FA состояние
    const [show2FA, setShow2FA] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaEmail, setMfaEmail] = useState('');
    const [mfaLoading, setMfaLoading] = useState(false);

    const sendMFACode = async (userEmail: string) => {
        try {
            const res = await fetch('/api/auth/send-mfa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
            });

            if (!res.ok) throw new Error('Ошибка отправки кода');

            setMfaEmail(userEmail);
            setShow2FA(true);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Не удалось отправить код';
            setError(message);
        }
    };

    const verifyMFACode = async () => {
        setMfaLoading(true);
        try {
            const res = await fetch('/api/auth/verify-mfa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: mfaEmail, code: mfaCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Неверный код');
                return;
            }

            console.log('✅ MFA успешно подтверждён, устанавливаю сессию...');

            // 🆕 Устанавливаем сессию используя токены из ответа
            if (data.access_token && data.refresh_token) {
                await supabase.auth.setSession({
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                });
                console.log('✅ Сессия установлена');
            }

            setShow2FA(false);
            setMfaCode('');
            setError(null);

            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('🔄 Переходим на библиотеку...');

            router.refresh();
            router.push('/library');

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ошибка проверки кода';
            console.error('❌ Error:', message);
            setError(message);
        } finally {
            setMfaLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                // ===== РЕГИСТРАЦИЯ =====
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });

                if (signUpError) {
                    setError(signUpError.message);
                    return;
                }

                if (data.user) {
                    // 🆕 Используем API вместо прямой вставки
                    const res = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: data.user.id,
                            email: email
                        }),
                    });

                    if (!res.ok) {
                        const errData = await res.json();
                        console.error('Ошибка при создании записи пользователя:', errData);
                        // Но не выходим из потока — сессия создана, просто профиль не инициализирован
                    }

                    setError('Проверьте почту для подтверждения!');
                }
            } else {
                // ===== ВХОД =====
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) {
                    setError(signInError.message);
                    return;
                }

                if (!signInData.user) {
                    setError('Не удалось получить данные пользователя');
                    return;
                }

                // Проверяем статус пользователя
                const { data: userRow } = await supabase
                    .from('users')
                    .select('status, ban_reason, id')
                    .eq('id', signInData.user.id)
                    .maybeSingle();

                if (!userRow) {
                    // 🆕 Если пользователя нет в таблице users — создаём через API
                    const res = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: signInData.user.id,
                            email: signInData.user.email
                        }),
                    });

                    if (!res.ok) {
                        const errData = await res.json();
                        console.error('Ошибка при создании записи пользователя:', errData);
                        setError('Ошибка при инициализации профиля');
                        return;
                    }
                } else {
                    if (userRow.status === 'banned') {
                        await supabase.auth.signOut();
                        setError('Ваш аккаунт заблокирован. Обратитесь в поддержку: mia.law.official@gmail.com');
                        return;
                    }

                    if (userRow.status === 'suspended') {
                        await supabase.auth.signOut();
                        setError('Ваш аккаунт временно заморожен. Обратитесь в поддержку.');
                        return;
                    }
                }

                // Если это суперадмин — требуем 2FA
                if (signInData.user.email === SUPER_ADMIN_EMAIL) {
                    await supabase.auth.signOut();
                    await sendMFACode(signInData.user.email);
                    return;
                }

                // Обновляем last_login для обычных пользователей
                await supabase
                    .from('users')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', signInData.user.id);

                router.push('/');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Произошла ошибка';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // ===== UI =====
    if (show2FA) {
        return (
            <Container>
                <div className="max-w-md mx-auto py-20">
                    <h1 className="text-3xl font-bold mb-8 text-center">Двухфакторная аутентификация</h1>

                    {error && (
                        <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
                            {error}
                        </div>
                    )}

                    <p className="text-gray-600 text-sm mb-6 text-center">
                        На адрес <strong>{mfaEmail}</strong> отправлен код подтверждения. Введите его ниже:
                    </p>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Код подтверждения (6 символов)"
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="w-full px-4 py-3 border border-slate-300 rounded text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500"
                        />

                        <button
                            onClick={verifyMFACode}
                            disabled={mfaLoading || mfaCode.length !== 6}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-slate-400"
                        >
                            {mfaLoading ? 'Проверка...' : 'Подтвердить'}
                        </button>

                        <button
                            onClick={() => {
                                setShow2FA(false);
                                setMfaCode('');
                                setError(null);
                            }}
                            className="w-full px-4 py-2 text-slate-600 hover:text-slate-900 transition"
                        >
                            Вернуться к входу
                        </button>
                    </div>

                    <p className="text-gray-500 text-xs text-center mt-6">
                        Код действует 10 минут
                    </p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="max-w-md mx-auto py-20">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    {isSignUp ? 'Регистрация' : 'Вход'}
                </h1>

                {error && (
                    <div className={`mb-4 p-3 rounded ${
                        error.includes('Проверьте почту')
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {isSignUp && (
                        <input
                            type="text"
                            placeholder="Полное имя"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                    />

                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-slate-400"
                    >
                        {loading ? 'Загрузка...' : isSignUp ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                        }}
                        className="text-blue-500 hover:underline"
                    >
                        {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
                    </button>
                </div>
            </div>
        </Container>
    );
}