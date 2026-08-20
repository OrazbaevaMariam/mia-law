export type SupportedCurrency = "usd" | "eur" | "gbp";

// Базовая цена в USD, из неё считаем остальные (обновляйте вручную раз в месяц/квартал)
const BASE_PRICE_USD = 5;

const EXCHANGE_RATES: Record<SupportedCurrency, number> = {
    usd: 1,
    eur: 0.92,
    gbp: 0.79,
};

export function getPriceForCurrency(currency: SupportedCurrency): number {
    const rate = EXCHANGE_RATES[currency];
    return Math.round(BASE_PRICE_USD * rate * 100) / 100;
}

export function detectCurrencyByCountry(country: string): SupportedCurrency {
    const eurCountries = ["DE", "FR", "IT", "ES", "NL", "BE", "AT", "PT", "FI", "IE"];
    const gbpCountries = ["GB"];

    if (gbpCountries.includes(country)) return "gbp";
    if (eurCountries.includes(country)) return "eur";
    return "usd";
}