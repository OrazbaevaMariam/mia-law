import { createServerSupabase } from "@/lib/supabase-server";

const WINDOW_MS = 60 * 1000; // 1 минута
const MAX_REQUESTS = 20; // максимум 20 запросов в минуту на юзера

export async function checkRateLimit(userId: string, endpoint: string) {
    const supabase = await createServerSupabase();

    const { data: existing } = await supabase
        .from("api_rate_limits")
        .select("*")
        .eq("user_id", userId)
        .eq("endpoint", endpoint)
        .maybeSingle();

    const now = Date.now();

    if (!existing) {
        await supabase.from("api_rate_limits").insert({
            user_id: userId,
            endpoint,
            request_count: 1,
            window_start: new Date().toISOString(),
        });
        return { allowed: true };
    }

    const windowStart = new Date(existing.window_start).getTime();

    if (now - windowStart > WINDOW_MS) {
        // окно истекло — сбрасываем счётчик
        await supabase
            .from("api_rate_limits")
            .update({ request_count: 1, window_start: new Date().toISOString() })
            .eq("user_id", userId)
            .eq("endpoint", endpoint);
        return { allowed: true };
    }

    if (existing.request_count >= MAX_REQUESTS) {
        return { allowed: false };
    }

    await supabase
        .from("api_rate_limits")
        .update({ request_count: existing.request_count + 1 })
        .eq("user_id", userId)
        .eq("endpoint", endpoint);

    return { allowed: true };
}