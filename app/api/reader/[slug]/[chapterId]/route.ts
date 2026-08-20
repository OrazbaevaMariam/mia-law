// app/api/reader/[slug]/[chapterId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; chapterId: string }> }
) {
    try {
        const { slug, chapterId } = await params;
        const supabase = await createServerSupabase();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rateLimit = await checkRateLimit(user.id, "reader-chapter");
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Слишком много запросов. Подождите минуту." },
                { status: 429 }
            );
        }

        // ✅ Найти книгу по slug
        const { data: book, error: bookError } = await supabase
            .from("books")
            .select("id")
            .eq("slug", slug)
            .single();

        if (bookError || !book) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }

        // ✅ Найти главу с правильным book.id
        const { data: chapter, error } = await supabase
            .from("chapters")
            .select("*")
            .eq("id", chapterId)
            .eq("book_id", book.id)
            .single();

        if (error) throw error;

        // ✅ Получить все главы с правильным book.id
        const { data: allChapters, error: chaptersError } = await supabase
            .from("chapters")
            .select("id, order_index")
            .eq("book_id", book.id)  // ← ИСПРАВЛЕНО
            .order("order_index", { ascending: true });

        if (chaptersError) throw chaptersError;

        const currentIndex = allChapters.findIndex((c) => c.id === chapterId);
        const prevChapterId = currentIndex > 0 ? allChapters[currentIndex - 1].id : null;
        const nextChapterId =
            currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1].id : null;

        // Главы 1 и 2 бесплатны, с 3-й — платно
        let hasAccess = chapter.is_free || chapter.order_index <= 2;

        if (!hasAccess) {
            const { data: sub } = await supabase
                .from("subscriptions")
                .select("status")
                .eq("user_id", user.id)
                .eq("status", "active")
                .maybeSingle();

            if (sub) {
                hasAccess = true;
            } else {
                const { data: purchase } = await supabase
                    .from("purchases")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("book_id", book.id)  // ← ИСПРАВЛЕНО
                    .maybeSingle();

                hasAccess = !!purchase;
            }
        }

        const watermarkedContent = hasAccess
            ? insertWatermark(chapter.content, user.id, user.email ?? "")
            : null;

        return NextResponse.json({
            ...chapter,
            content: watermarkedContent,
            prevChapterId,
            nextChapterId,
            hasAccess,
        });
    } catch (error) {
        console.error("Chapter fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch chapter" },
            { status: 500 }
        );
    }
}

function insertWatermark(html: string, userId: string, email: string): string {
    const payload = Buffer.from(`${userId}:${email}:${Date.now()}`).toString("base64");
    const visibleMarker = `<span style="display:none" data-uid="${payload}"></span>`;
    const zeroWidthMarker = payload
        .split("")
        .map((char) => char.charCodeAt(0).toString(2))
        .join("")
        .split("")
        .map((bit) => (bit === "1" ? "\u200B" : "\u200C"))
        .join("");

    return html + visibleMarker + `<span style="display:none">${zeroWidthMarker}</span>`;
}