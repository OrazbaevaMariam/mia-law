import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

interface RouteParams {
    params: {
        slug: string;
        chapterId: string;
    };
}

export async function GET(_request: Request, { params }: RouteParams) {
    try {
        const { chapterId } = params;
        const supabase = await createServerSupabase();

        const { data: chapter } = await supabase
            .from("chapters")
            .select("*")
            .eq("id", chapterId)
            .single();

        if (!chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        }

        return NextResponse.json(chapter);
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
