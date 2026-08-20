import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { Footer } from "@/app/components/layout/Footer";

export default async function ProtectedLayout({
                                                  children,
                                              }: {
    children: ReactNode;
}) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <>
            <main>{children}</main>
            <Footer />
        </>
    );
}
