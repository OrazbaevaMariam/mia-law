import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

export async function GET() {
    try {
        const supabase = await createServerSupabase();

        const { data: books, error } = await supabase
            .from("books")
            .select(`
                id,
                title,
                slug,
                description,
                cover_url,
                chapters (
                    id,
                    title,
                    number
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(books || []);
    } catch (error) {
        console.error("Error fetching books:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
