import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST — поставить/снять/переключить реакцию
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId, reactionType } = await req.json();

    if (!commentId || !["like", "dislike"].includes(reactionType)) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const userId = userData.user.id;

    // Проверяем, есть ли уже реакция этого юзера на этот коммент
    const { data: existing } = await supabase
        .from("comment_reactions")
        .select("id, reaction_type")
        .eq("comment_id", commentId)
        .eq("user_id", userId)
        .maybeSingle();

    if (existing) {
        if (existing.reaction_type === reactionType) {
            // Та же реакция — снимаем её
            await supabase.from("comment_reactions").delete().eq("id", existing.id);
            return NextResponse.json({ status: "removed" });
        } else {
            // Другая реакция — меняем
            await supabase
                .from("comment_reactions")
                .update({ reaction_type: reactionType })
                .eq("id", existing.id);
            return NextResponse.json({ status: "updated" });
        }
    } else {
        // Реакции нет — создаём
        await supabase.from("comment_reactions").insert({
            comment_id: commentId,
            user_id: userId,
            reaction_type: reactionType,
        });
        return NextResponse.json({ status: "created" });
    }
}