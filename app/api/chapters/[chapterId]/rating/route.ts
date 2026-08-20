// app/api/chapters/[chapterId]/rating/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ chapterId: string }> }
) {
    const { chapterId } = await params;
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { rating?: number };
    const { rating } = body;

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
    }

    // Проверяем, что глава существует
    const { data: chapter } = await supabase
        .from("chapters")
        .select("id")
        .eq("id", chapterId)
        .single();

    if (!chapter) {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // upsert — если уже оценивал эту главу, обновляем оценку, а не дублируем
    const { error } = await supabase
        .from("chapter_ratings")
        .upsert(
            {
                user_id: userData.user.id,
                chapter_id: chapterId,
                rating,
            },
            { onConflict: "user_id,chapter_id" }
        );

    if (error) {
        console.error("Failed to save chapter rating:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}