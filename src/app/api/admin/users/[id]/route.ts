import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase";

// ユーザー詳細（管理者用）
export const GET = withAdmin(async (_req, _session, context) => {
  const { id: userId } = await context.params;
  const supabase = createAdminClient();

  // ユーザー基本情報
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, name, role, created_at, updated_at, deleted_at")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "ユーザーが見つかりません。" },
      { status: 404 }
    );
  }

  // 統計情報を並列取得
  const [
    sessionsResult,
    completedSessionsResult,
    imagesResult,
    apiCallsResult,
    recentSessionsResult,
    recentImagesResult,
    lastActiveResult,
  ] = await Promise.all([
    // セッション数
    supabase
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    // 完了セッション数
    supabase
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    // 画像数
    supabase
      .from("generated_images")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    // API呼び出し数
    supabase
      .from("api_usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    // 最新10セッション
    supabase
      .from("chat_sessions")
      .select(
        `
        id, title, shop_name, status, created_at, updated_at,
        generated_images (id),
        messages (id)
      `
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10),
    // 最新12枚の生成画像
    supabase
      .from("generated_images")
      .select("id, storage_path, prompt, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12),
    // 最終アクティビティ
    supabase
      .from("api_usage_logs")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const totalSessions = sessionsResult.count || 0;
  const completedSessions = completedSessionsResult.count || 0;
  const totalImages = imagesResult.count || 0;
  const totalApiCalls = apiCallsResult.count || 0;
  const completionRate =
    totalSessions > 0 ? completedSessions / totalSessions : 0;
  const lastActiveAt = lastActiveResult.data?.[0]?.created_at || null;

  const recentSessions = (recentSessionsResult.data || []).map((s) => ({
    id: s.id,
    title: s.title,
    shop_name: s.shop_name,
    status: s.status,
    created_at: s.created_at,
    updated_at: s.updated_at,
    imageCount: (s.generated_images as { id: string }[])?.length || 0,
    messageCount: (s.messages as { id: string }[])?.length || 0,
  }));

  const recentImages = (recentImagesResult.data || []).map((img) => ({
    id: img.id,
    storage_path: img.storage_path,
    prompt: img.prompt,
    created_at: img.created_at,
  }));

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at,
      sessionCount: totalSessions,
      imageCount: totalImages,
      stats: {
        totalSessions,
        totalImages,
        completionRate,
        totalApiCalls,
        lastActiveAt,
      },
      recentSessions,
      recentImages,
    },
  });
});

// アカウント停止/復元（管理者用）
export const POST = withAdmin(async (req, session, context) => {
  const { id: userId } = await context.params;
  const supabase = createAdminClient();
  const body = await req.json();
  const { action } = body;

  if (action === "suspend") {
    // 自分自身の停止を拒否
    if (session.user?.id === userId) {
      return NextResponse.json(
        { error: "自分自身のアカウントは停止できません。" },
        { status: 400 }
      );
    }

    // 対象ユーザーを取得
    const { data: targetUser, error: fetchError } = await supabase
      .from("users")
      .select("id, role, deleted_at")
      .eq("id", userId)
      .single();

    if (fetchError || !targetUser) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    // adminロールの停止を拒否
    if (targetUser.role === "admin") {
      return NextResponse.json(
        { error: "管理者アカウントは停止できません。" },
        { status: 400 }
      );
    }

    // 既に停止済みの場合
    if (targetUser.deleted_at) {
      return NextResponse.json(
        { error: "このアカウントは既に停止されています。" },
        { status: 400 }
      );
    }

    // ソフトデリート
    const { error: updateError } = await supabase
      .from("users")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "アカウントの停止に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "アカウントを停止しました。",
    });
  }

  if (action === "restore") {
    // 復元
    const { error: updateError } = await supabase
      .from("users")
      .update({ deleted_at: null })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "アカウントの復元に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "アカウントを復元しました。",
    });
  }

  return NextResponse.json(
    { error: "不明なアクションです。" },
    { status: 400 }
  );
});
