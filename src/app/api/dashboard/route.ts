import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// ダッシュボード用データ取得
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const userId = session.user.id;

  // 並列でデータ取得
  const [sessionsResult, statsResult, monthlyResult] = await Promise.all([
    // 最近のセッション（最大10件）
    supabase
      .from("chat_sessions")
      .select(`
        id,
        title,
        status,
        shop_name,
        category,
        created_at,
        updated_at,
        generated_images (id, storage_path)
      `)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10),

    // 総生成画像数
    supabase
      .from("generated_images")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),

    // 今月の生成数
    supabase
      .from("generated_images")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  // 直近30日のセッション数
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { count: recentSessionCount } = await supabase
    .from("chat_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", thirtyDaysAgo.toISOString());

  const sessions = sessionsResult.data || [];
  const totalImages = statsResult.count || 0;
  const monthlyImages = monthlyResult.count || 0;

  // セッションに公開URLを付与
  const sessionsWithUrls = sessions.map((s) => {
    const images = (s.generated_images as { id: string; storage_path: string }[]) || [];
    const firstImage = images[0];
    let thumbnailUrl: string | null = null;
    if (firstImage) {
      const { data: urlData } = supabase.storage
        .from("generated")
        .getPublicUrl(firstImage.storage_path);
      thumbnailUrl = urlData.publicUrl;
    }
    return {
      ...s,
      imageCount: images.length,
      thumbnailUrl,
    };
  });

  return NextResponse.json({
    sessions: sessionsWithUrls,
    stats: {
      totalImages,
      monthlyImages,
      recentSessions: recentSessionCount || 0,
    },
  });
}
