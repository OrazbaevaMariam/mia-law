import { NextResponse, NextRequest } from "next/server";
import { detectCurrencyByCountry } from "@/lib/currency";

export async function GET(request: NextRequest) {
    const country = request.headers.get("x-vercel-ip-country") || "RU";
    const currency = detectCurrencyByCountry(country);

    return NextResponse.json({ country, currency });
}