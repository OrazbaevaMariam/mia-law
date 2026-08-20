import { requireAdmin } from "@/lib/requireAdmin";
import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    const supabase = await createServerSupabase();
    const { data: topChapters } = await supabase.rpc("get_top_chapters", { limit_count: 10 });
    const { data: dailyViews } = await supabase.rpc("get_daily_views", { days: 30 });

    return NextResponse.json({ topChapters, dailyViews });
}