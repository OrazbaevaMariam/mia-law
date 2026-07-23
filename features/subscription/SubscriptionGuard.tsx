import { createServerSupabase } from "@/shared/lib/supabaseServer";
import { PaywallMoment } from "@/components/sections/PaywallMoment";

export async function SubscriptionGuard({
                                            bookSlug,
                                            children,
                                        }: {
    bookSlug?: string;
    children: React.ReactNode;
}) {
    const supabase = await createServerSupabase();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return <PaywallMoment bookSlug={bookSlug} />;
    }

    const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .maybeSingle();

    if (!sub) {
        return <PaywallMoment bookSlug={bookSlug} />;
    }

    return <>{children}</>;
}