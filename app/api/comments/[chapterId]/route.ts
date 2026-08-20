// /app/api/comments/[chapterId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { createClient } from "@supabase/supabase-js";

interface CommentRow {
    id: string;
    user_id: string;
    book_id: string;
    chapter_id: string | null;
    parent_id: string | null;
    content: string;
    created_at: string;
    status?: string;
    ai_score?: number;
}

interface ReactionRow {
    comment_id: string;
    reaction_type: "like" | "dislike";
}

interface CommentWithReplies {
    id: string;
    userId: string;
    username: string;
    bookId: string;
    chapterId: string | null;
    parentId: string | null;
    content: string;
    createdAt: string;
    likes: number;
    dislikes: number;
    replies: CommentWithReplies[];
    status?: string;
}

interface UserRow {
    id: string;
    role: 'admin' | 'user' | 'moderator';
    status: 'active' | 'banned' | 'suspended';
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserRole(userId: string): Promise<UserRow | null> {
    const { data: user } = await supabase
        .from("users")
        .select("id, role, status")
        .eq("id", userId)
        .single();

    return user as UserRow | null;
}

async function getUsernamesMap(userIds: string[]): Promise<Map<string, string>> {
    const userMap = new Map<string, string>();

    const { data: users } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

    (users as { id: string; email: string; full_name: string | null }[] | null)?.forEach((u) => {
        const username = u.full_name?.trim() || u.email?.split("@")[0] || "Читатель";
        userMap.set(u.id, username);
    });

    return userMap;
}

// ============ GET — публичный, отдаёт только approved комментарии ============
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ chapterId: string }> }
) {
    const { chapterId } = await params;

    const { data: comments, error } = await supabase
        .from("comments")
        .select("id, user_id, book_id, chapter_id, parent_id, content, created_at, status")
        .eq("book_id", chapterId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("❌ Comments fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!comments || comments.length === 0) {
        return NextResponse.json([]);
    }

    const commentsData = comments as CommentRow[];
    const userIds = [...new Set(commentsData.map((c) => c.user_id))];
    const userMap = await getUsernamesMap(userIds);

    const commentIds = commentsData.map((c) => c.id);
    let reactions: ReactionRow[] = [];

    if (commentIds.length > 0) {
        const { data: reactionsData } = await supabase
            .from("comment_reactions")
            .select("comment_id, reaction_type")
            .in("comment_id", commentIds);

        reactions = (reactionsData as ReactionRow[]) || [];
    }

    const commentMap = new Map<string, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    commentsData.forEach((c) => {
        const commentReactions = reactions.filter((r) => r.comment_id === c.id);
        const likes = commentReactions.filter((r) => r.reaction_type === "like").length;
        const dislikes = commentReactions.filter((r) => r.reaction_type === "dislike").length;

        commentMap.set(c.id, {
            id: c.id,
            userId: c.user_id,
            username: userMap.get(c.user_id) || "Читатель",
            bookId: c.book_id,
            chapterId: c.chapter_id,
            parentId: c.parent_id,
            content: c.content,
            createdAt: c.created_at,
            likes,
            dislikes,
            replies: [],
            status: c.status,
        });
    });

    commentsData.forEach((c) => {
        const comment = commentMap.get(c.id)!;
        if (c.parent_id && commentMap.has(c.parent_id)) {
            commentMap.get(c.parent_id)!.replies.push(comment);
        } else if (!c.parent_id) {
            rootComments.push(comment);
        }
    });

    const sortReplies = (list: CommentWithReplies[]) => {
        list.forEach((c) => {
            c.replies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            sortReplies(c.replies);
        });
    };
    sortReplies(rootComments);

    return NextResponse.json(rootComments);
}

// ============ POST — добавить комментарий ============
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ chapterId: string }> }
) {
    const { chapterId } = await params;
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = await getUserRole(userData.user.id);

    // 🔒 Проверка на бан/приостановку
    if (!userRole || userRole.status !== 'active') {
        return NextResponse.json(
            { error: "Ваш аккаунт заблокирован или приостановлен" },
            { status: 403 }
        );
    }

    // Rate-limit: не более N комментариев в минуту на пользователя
    const { allowed } = await checkRateLimit(userData.user.id, "post-comment");
    if (!allowed) {
        return NextResponse.json(
            { error: "Слишком много комментариев. Подождите немного и попробуйте снова." },
            { status: 429 }
        );
    }

    const body = (await req.json()) as { content?: string; parentId?: string };
    const { content, parentId } = body;

    if (!content || !content.trim()) {
        return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // 🔒 Валидация parentId — существует ли и относится ли к этой же книге/главе
    if (parentId) {
        const { data: parentComment } = await supabase
            .from("comments")
            .select("id, book_id")
            .eq("id", parentId)
            .single();

        if (!parentComment || parentComment.book_id !== chapterId) {
            return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
        }
    }

    const { data: userRow } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userData.user.id)
        .single();

    const userRowData = userRow as { email: string; full_name: string | null } | null;
    const username = userRowData?.full_name?.trim() || userRowData?.email?.split("@")[0] || "Читатель";

    // 🤖 Проверяем через Google Perspective AI
    // 🤖 Проверяем через Google Perspective AI
    let aiScore = 0;
    let aiChecked = false; // была ли проверка реально выполнена

    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const aiResponse = await fetch(`${baseUrl}/api/comments/check-ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: content }),
        });
        const aiData = await aiResponse.json();
        aiScore = aiData.score || 0;
        aiChecked = aiData.checked === true;
        console.log(`🤖 AI Score: ${(aiScore * 100).toFixed(1)}% - ${aiData.reason} (checked: ${aiChecked})`);
    } catch (err) {
        console.error('❌ AI check failed:', err);
        aiScore = 0;
        aiChecked = false;
    }

    const isPrivileged = userRole.role === 'admin' || userRole.role === 'moderator';

    // ⚠️ Если AI не смог проверить текст — уходим в pending на ручную модерацию,
    // даже если формально score = 0. Автоматическое approve без проверки — риск.
    const finalStatus = isPrivileged
        ? 'approved'
        : !aiChecked
            ? 'pending'
            : aiScore > 0.4
                ? 'pending'
                : 'approved';

    if (!isPrivileged && !aiChecked) {
        console.warn(`⚠️ Комментарий ушёл в pending из-за недоступности AI-проверки (user: ${userData.user.id})`);
    }

    const { data: newComment, error } = await supabase
        .from("comments")
        .insert({
            user_id: userData.user.id,
            book_id: chapterId,
            chapter_id: chapterId,
            parent_id: parentId || null,
            content: content.trim(),
            status: finalStatus,
            ai_score: aiScore,
        })
        .select("id, user_id, book_id, chapter_id, parent_id, content, created_at, status, ai_score")
        .single();

    if (error) {
        console.error("Insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const newCommentData = newComment as CommentRow;

    return NextResponse.json({
        id: newCommentData.id,
        userId: newCommentData.user_id,
        username,
        bookId: newCommentData.book_id,
        chapterId: newCommentData.chapter_id,
        parentId: newCommentData.parent_id,
        content: newCommentData.content,
        createdAt: newCommentData.created_at,
        likes: 0,
        dislikes: 0,
        replies: [],
        status: newCommentData.status,
    });
}

// ============ DELETE — удалить комментарий (только admin/moderator) ============
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ chapterId: string }> }
) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = await getUserRole(userData.user.id);

    if (!userRole || userRole.status !== 'active' || (userRole.role !== 'admin' && userRole.role !== 'moderator')) {
        return NextResponse.json(
            { error: "Only active admins and moderators can delete comments" },
            { status: 403 }
        );
    }

    const body = (await req.json()) as { commentId?: string };
    const { commentId } = body;

    if (!commentId) {
        return NextResponse.json({ error: "commentId is required" }, { status: 400 });
    }

    // ✅ Правильный порядок: сначала реакции и дочерние комментарии, потом сам комментарий
    await supabase.from("comment_reactions").delete().eq("comment_id", commentId);
    await supabase.from("comments").delete().eq("parent_id", commentId);

    const { error: deleteError } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

    if (deleteError) {
        console.error("Delete error:", deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Comment deleted" });
}