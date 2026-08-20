import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function requireAdmin() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            user: null,
        };
    }

    const { data: userRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (userRow?.role !== "admin") {
        return {
            error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
            user: null,
        };
    }

    return { error: null, user };
}