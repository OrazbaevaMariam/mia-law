import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

interface RouteParams {
    params: {
        slug: string;
    };
}

export async function GET(_request: Request, { params }: RouteParams) {
    try {
        const { slug } = params;
        const supabase = await createServerSupabase();

        const { data: book, error } = await supabase
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
            .eq("slug", slug)
            .eq("published", true)
            .single();

        if (error || !book) {
            return NextResponse.json(
                { error: "Book not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(book);
    } catch (error) {
        console.error("Error fetching book:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
