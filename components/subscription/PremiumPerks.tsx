// components/subscription/PremiumPerks.tsx

export function PremiumPerks() {
    return (
        <div className="space-y-4">
            <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                <h4 className="text-gold font-serif mb-2">💎 Премиум перки:</h4>
                <ul className="text-warmText space-y-2">
                    <li>✅ Ранний доступ к новым главам</li>
                    <li>✅ Эксклюзивные истории (спин-офф)</li>
                    <li>✅ <a
                        href="https://t.me/mia_low_exclusive"
                        target="_blank"
                        className="text-gold hover:underline"
                    >
                        Приватный Telegram канал
                    </a></li>
                    <li>✅ Личный Q&A со мной</li>
                </ul>
            </div>
        </div>
    )
}