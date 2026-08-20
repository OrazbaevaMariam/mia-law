import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as { id: string; email: string };
        const { id, email } = body;

        if (!id || !email) {
            return NextResponse.json(
                { error: "id и email обязательны" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("users")
            .insert({
                id,
                email,
                role: "user",
                status: "active",
                created_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Insert user error:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Register endpoint error:", err);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}