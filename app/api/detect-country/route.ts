import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    // Vercel добавляет этот заголовок автоматически на проде
    const country = request.headers.get("x-vercel-ip-country") || "RU";

    return NextResponse.json({ country });
}