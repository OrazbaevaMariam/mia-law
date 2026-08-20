// Кодирует UUID пользователя в невидимые zero-width символы
// и внедряет их в текст главы

const ZW_CHARS = ["\u200B", "\u200C", "\u200D"]; // 0, 1, 2 — троичная система

function encodeToZeroWidth(str: string): string {
    // Каждый символ ID переводим в код и в троичную последовательность
    let result = "";
    for (const char of str) {
        const code = char.charCodeAt(0);
        // переводим в троичное представление фиксированной длины (для латинских цифр/букв достаточно 4 "трита")
        let triits = "";
        let n = code;
        for (let i = 0; i < 6; i++) {
            triits = (n % 3) + triits;
            n = Math.floor(n / 3);
        }
        for (const t of triits) {
            result += ZW_CHARS[parseInt(t, 10)];
        }
    }
    return result;
}

function decodeFromZeroWidth(zwString: string): string {
    const triitGroups = zwString.match(/.{1,6}/g) || [];
    let result = "";
    for (const group of triitGroups) {
        let code = 0;
        for (const ch of group) {
            const digit = ZW_CHARS.indexOf(ch);
            if (digit === -1) continue;
            code = code * 3 + digit;
        }
        result += String.fromCharCode(code);
    }
    return result;
}

/**
 * Внедряет водяной знак (userId) в текст главы.
 * Вставляет невидимую метку после каждого N-го слова, чтобы она
 * пережила частичное копирование текста.
 */
export function embedWatermark(text: string, userId: string): string {
    const shortId = userId.replace(/-/g, "").slice(0, 12); // сокращаем UUID для компактности
    const watermark = encodeToZeroWidth(shortId);

    const words = text.split(" ");
    const interval = 40; // вставляем метку каждые 40 слов

    for (let i = interval; i < words.length; i += interval) {
        words[i] = watermark + words[i];
    }

    // Дублируем в начале текста на случай короткого фрагмента
    return watermark + words.join(" ");
}

/**
 * Извлекает userId (сокращённый) из текста, если он там есть.
 * Используйте на найденном в сети пиратском тексте, чтобы вычислить источник утечки.
 */
export function extractWatermark(text: string): string | null {
    const zwRegex = /[\u200B\u200C\u200D]+/;
    const match = text.match(zwRegex);
    if (!match) return null;

    try {
        return decodeFromZeroWidth(match[0]);
    } catch {
        return null;
    }
}