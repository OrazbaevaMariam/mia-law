// shared/lib/authErrors.ts
export function translateAuthError(message: string): string {
    const errors: Record<string, string> = {
        'Invalid login credentials': 'Неверный email или пароль',
        'Email not confirmed': 'Email не подтверждён. Проверьте почту и перейдите по ссылке из письма',
        'User already registered': 'Пользователь с таким email уже зарегистрирован',
        'Password should be at least 6 characters': 'Пароль должен содержать минимум 6 символов',
        'Unable to validate email address: invalid format': 'Некорректный формат email',
    }

    return errors[message] || 'Произошла ошибка. Попробуйте снова'
}