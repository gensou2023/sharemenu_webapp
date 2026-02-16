import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// 通知一覧取得
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") || "20");

  try {
    const supabase = createAdminClient();

    const [notificationsResult, unreadResult] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, type, title, message, read, metadata, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("read", false),
    ]);

    return NextResponse.json({
      notifications: notificationsResult.data || [],
      unreadCount: unreadResult.count || 0,
    });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}

// 既読処理
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const supabase = createAdminClient();

    if (body.markAllRead) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", session.user.id)
        .eq("read", false);
    } else if (body.ids && Array.isArray(body.ids)) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", session.user.id)
        .in("id", body.ids);
    } else {
      return NextResponse.json({ error: "ids または markAllRead を指定してください。" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
