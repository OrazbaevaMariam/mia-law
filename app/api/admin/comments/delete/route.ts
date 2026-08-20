import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
    try {
        const { error } = await requireAdmin();
        if (error) return error;

        const body = (await req.json()) as { commentId?: string };
        const { commentId } = body;

        if (!commentId) {
            return NextResponse.json({ error: "commentId is required" }, { status: 400 });
        }

        await supabaseAdmin.from("comment_reactions").delete().eq("comment_id", commentId);
        await supabaseAdmin.from("comments").delete().eq("parent_id", commentId);
        const { error: deleteError } = await supabaseAdmin.from("comments").delete().eq("id", commentId);

        if (deleteError) {
            console.error("Delete error:", deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete comment error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}