import { NextResponse, NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const supabase = await createServerSupabase();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: book, error } = await supabase
            .from("books")
            .select("*")
            .eq("id", slug)
            .single();

        if (error) throw error;

        return NextResponse.json(book);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch book" },
            { status: 500 }
        );
    }
}
