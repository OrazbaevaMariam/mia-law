import { NextRequest, NextResponse } from 'next/server';

// 🗄️ Простой in-memory кэш (TTL 10 минут) — экономит квоту Perspective API
// при повторяющихся/спам-сообщениях с одинаковым текстом
interface CacheEntry {
    score: number;
    timestamp: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 минут
const aiCache = new Map<string, CacheEntry>();

function getCacheKey(text: string): string {
    return text.trim().toLowerCase();
}

function getFromCache(text: string): number | null {
    const key = getCacheKey(text);
    const entry = aiCache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        aiCache.delete(key);
        return null;
    }

    return entry.score;
}

function saveToCache(text: string, score: number) {
    const key = getCacheKey(text);
    aiCache.set(key, { score, timestamp: Date.now() });

    // 🧹 Простая защита от утечки памяти — чистим старые записи, если кэш разросся
    if (aiCache.size > 500) {
        const now = Date.now();
        for (const [k, v] of aiCache.entries()) {
            if (now - v.timestamp > CACHE_TTL_MS) {
                aiCache.delete(k);
            }
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text || text.length < 5) {
            return NextResponse.json({ score: 0, reason: 'Text too short', checked: true });
        }

        // ✅ Проверяем кэш перед вызовом внешнего API
        const cachedScore = getFromCache(text);
        if (cachedScore !== null) {
            console.log(`💾 AI Cache hit - Score: ${(cachedScore * 100).toFixed(1)}%`);
            return NextResponse.json({
                score: cachedScore,
                reason: 'Cached result',
                checked: true,
            });
        }

        // 🤖 ВЫЗЫВАЕМ GOOGLE PERSPECTIVE API
        const perspectiveScore = await checkWithPerspective(text);

        if (perspectiveScore !== null) {
            saveToCache(text, perspectiveScore);
            return NextResponse.json({
                score: perspectiveScore,
                reason: 'Google Perspective API',
                checked: true,
            });
        }

        // ❌ AI недоступен (ошибка сети/квота/нет ключа) — сообщаем об этом явно
        console.warn('⚠️ AI check unavailable — комментарий должен уйти на ручную модерацию');
        return NextResponse.json({ score: 0, reason: 'AI unavailable', checked: false });
    } catch (err) {
        console.error('❌ AI check error:', err);
        return NextResponse.json({ score: 0, reason: 'Error in check', checked: false });
    }
}

async function checkWithPerspective(text: string): Promise<number | null> {
    const apiKey = process.env.GOOGLE_PERSPECTIVE_API_KEY;

    if (!apiKey) {
        console.warn('⚠️ GOOGLE_PERSPECTIVE_API_KEY не установлен');
        return null;
    }

    try {
        const response = await fetch(
            `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comment: { text },
                    requestedAttributes: {
                        TOXICITY: {},
                        SEVERE_TOXICITY: {},
                        PROFANITY: {},
                        INSULT: {},
                        THREAT: {},
                        IDENTITY_ATTACK: {},
                    },
                    languages: ['ru', 'en'],
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('🔴 Perspective API error:', error);
            return null;
        }

        const data = await response.json();
        const scores = data.attributeScores;

        if (!scores) return null;

        const toxicity = scores.TOXICITY?.summaryScore?.value || 0;
        const severeToxicity = scores.SEVERE_TOXICITY?.summaryScore?.value || 0;
        const profanity = scores.PROFANITY?.summaryScore?.value || 0;
        const insult = scores.INSULT?.summaryScore?.value || 0;
        const threat = scores.THREAT?.summaryScore?.value || 0;

        // 📊 БЕРЁМ МАКСИМУМ
        const toxicityScore = Math.max(toxicity, severeToxicity, profanity, insult, threat);

        // 🔍 ДОПОЛНИТЕЛЬНО: проверяем на негативную тональность
        const sentimentScore = detectNegativeSentiment(text);

        // ✅ ФИНАЛЬНЫЙ СКОР: максимум из двух
        const finalScore = Math.max(toxicityScore, sentimentScore);

        console.log(
            `🤖 Perspective - Toxicity: ${(toxicity * 100).toFixed(1)}%, ` +
            `Profanity: ${(profanity * 100).toFixed(1)}%, ` +
            `Insult: ${(insult * 100).toFixed(1)}% | ` +
            `Sentiment: ${(sentimentScore * 100).toFixed(1)}% | ` +
            `FINAL: ${(finalScore * 100).toFixed(1)}%`
        );

        return finalScore;
    } catch (err) {
        console.error('❌ Perspective check error:', err);
        return null;
    }
}

// 🔍 ЛОКАЛЬНЫЙ АНАЛИЗ НЕГАТИВНОЙ ТОНАЛЬНОСТИ
function detectNegativeSentiment(text: string): number {
    let score = 0;
    const lowerText = text.toLowerCase();

    const negativeWords = [
        'фуфло', 'говно', 'дерьмо', 'хлам', 'мусор', 'не стоит', 'пустая',
        'скучно', 'скучная', 'скучную', 'скучну', 'надоело', 'надоедает',
        'не имеет', 'не имеет смысла', 'бессмысленно', 'бесполезно',
        'отвратительно', 'отвратная', 'ужасно', 'ужасная', 'ужас',
        'жалко', 'жалкая', 'паршиво', 'паршивая', 'убого', 'убогая',
        'унылая', 'уныло', 'депрессия', 'депрессивно',
        'не рекомендую', 'не советую', 'не читайте', 'не смотрите',
        'потраченное время', 'потраченные деньги', 'впустую', 'зря',
        'полный бред', 'полная ерунда', 'ерунда', 'бред',
        'бесит', 'злит', 'раздражает', 'омерзение', 'омерзител',
    ];

    negativeWords.forEach(word => {
        if (lowerText.includes(word)) {
            score += 0.25;
        }
    });

    const harshCriticism = [
        'не понравилось вообще', 'совсем не понравилось', 'вообще не понравилось',
        'полностью не понравилось', 'кошмар', 'кошмарно', 'адский',
        'издевательство', 'издевается',
    ];

    harshCriticism.forEach(phrase => {
        if (lowerText.includes(phrase)) {
            score += 0.35;
        }
    });

    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations >= 3) {
        score += 0.2;
    }

    const capsCount = (text.match(/[A-ZА-ЯЁ]/g) || []).length;
    if (text.length > 10 && capsCount / text.length > 0.4) {
        score += 0.25;
    }

    return Math.min(score, 1);
}