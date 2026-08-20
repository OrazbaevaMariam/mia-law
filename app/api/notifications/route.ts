import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — получить уведомления текущего пользователя
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: notifications, error } = await supabase
        .from("notifications")
        .select("id, type, message, comment_id, is_read, created_at")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(30);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notifications: notifications || [] });
}

// PATCH — пометить уведомление(я) как прочитанные
export async function PATCH(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { notificationId?: string; markAll?: boolean };

    if (body.markAll) {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", userData.user.id)
            .eq("is_read", false);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    }

    if (!body.notificationId) {
        return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
    }

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", body.notificationId)
        .eq("user_id", userData.user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}