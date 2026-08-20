import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET() {
    try {
        const supabase = await createServerSupabase();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: books, error } = await supabase
            .from("books")
            .select("*");

        if (error) throw error;

        return NextResponse.json(books);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch books" },
            { status: 500 }
        );
    }
}
