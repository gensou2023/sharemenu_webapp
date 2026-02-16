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
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [sessionsResult, statsResult, monthlyResult, recentSessionResult, sharedImagesResult] = await Promise.all([
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

    // 直近30日のセッション数
    supabase
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString()),

    // ギャラリー共有画像
    supabase
      .from("shared_images")
      .select("id, image_id, category, created_at, generated_images!inner(storage_path, prompt)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const recentSessionCount = recentSessionResult.count;
  const sharedImages = sharedImagesResult.data;

  // 共有画像ごとのいいね・保存数を取得（RPC で集計済みカウントを取得）
  const sharedIds = (sharedImages || []).map((s) => s.id);
  let sharedWithStats: Array<{
    id: string;
    image_id: string;
    image_url: string;
    prompt: string;
    category: string;
    like_count: number;
    save_count: number;
    created_at: string;
  }> = [];

  if (sharedIds.length > 0) {
    const { data: statsData } = await supabase.rpc("get_shared_image_stats", {
      p_shared_ids: sharedIds,
    });

    const statsMap: Record<string, { like_count: number; save_count: number }> = {};
    for (const row of statsData || []) {
      statsMap[row.shared_image_id] = {
        like_count: Number(row.like_count),
        save_count: Number(row.save_count),
      };
    }

    sharedWithStats = (sharedImages || []).map((s) => {
      const gen = s.generated_images as unknown as { storage_path: string; prompt: string };
      const { data: urlData } = supabase.storage.from("generated").getPublicUrl(gen.storage_path);
      const counts = statsMap[s.id] || { like_count: 0, save_count: 0 };
      return {
        id: s.id,
        image_id: s.image_id,
        image_url: urlData.publicUrl,
        prompt: gen.prompt,
        category: s.category,
        like_count: counts.like_count,
        save_count: counts.save_count,
        created_at: s.created_at,
      };
    });
  }

  // セッションの画像IDに対する共有状態マップ
  const sharedImageMap: Record<string, { like_count: number; save_count: number }> = {};
  for (const s of sharedWithStats) {
    sharedImageMap[s.image_id] = { like_count: s.like_count, save_count: s.save_count };
  }

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
    // 全画像の公開URLリストを生成
    const imageUrls = images.map((img) => {
      const { data: urlData } = supabase.storage
        .from("generated")
        .getPublicUrl(img.storage_path);
      return urlData.publicUrl;
    });

    // セッション内の画像が共有されているかチェック
    const shareInfo = images.reduce(
      (acc, img) => {
        const shared = sharedImageMap[img.id];
        if (shared) {
          acc.isShared = true;
          acc.totalLikes += shared.like_count;
          acc.totalSaves += shared.save_count;
        }
        return acc;
      },
      { isShared: false, totalLikes: 0, totalSaves: 0 }
    );

    return {
      ...s,
      imageCount: images.length,
      thumbnailUrl,
      imageUrls,
      imageIds: images.map((img) => img.id),
      ...shareInfo,
    };
  });

  return NextResponse.json({
    sessions: sessionsWithUrls,
    stats: {
      totalImages,
      monthlyImages,
      recentSessions: recentSessionCount || 0,
    },
    galleryStats: {
      sharedCount: sharedWithStats.length,
      totalLikes: sharedWithStats.reduce((sum, s) => sum + s.like_count, 0),
      totalSaves: sharedWithStats.reduce((sum, s) => sum + s.save_count, 0),
      topImages: sharedWithStats
        .sort((a, b) => (b.like_count + b.save_count) - (a.like_count + a.save_count))
        .slice(0, 6),
    },
  });
}
