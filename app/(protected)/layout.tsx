import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import { ReaderHeader } from "@/app/components/layout/ReaderHeader";
import { Footer } from "@/app/components/layout/Footer";

export default async function ProtectedLayout({
    children,
}: {
    children: ReactNode;
}) {
    const supabase = await createServerSupabase();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-[#0F0F12] flex flex-col">
            <ReaderHeader />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
