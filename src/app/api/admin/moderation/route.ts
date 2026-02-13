import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase";

const PAGE_SIZE = 20;

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = createAdminClient();

  // 統計
  const [totalReportsRes, pendingReportsRes, totalSharedRes] = await Promise.all([
    supabase.from("image_reports").select("*", { count: "exact", head: true }),
    supabase.from("image_reports").select("*", { count: "exact", head: true }),
    supabase.from("shared_images").select("*", { count: "exact", head: true }),
  ]);

  // 通報一覧（JOIN）
  const { data: reports, error } = await supabase
    .from("image_reports")
    .select(`
      id,
      reason,
      detail,
      created_at,
      shared_image_id,
      shared_images!inner (
        id,
        category,
        created_at,
        image_id,
        user_id,
        generated_images!inner (
          storage_path
        )
      ),
      users!image_reports_user_id_fkey (
        email
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("Moderation query error:", error);
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }

  // 投稿者のメール取得（shared_images.user_id）
  const uploaderIds = [...new Set((reports || []).map((r: Record<string, unknown>) => {
    const si = r.shared_images as Record<string, unknown> | null;
    return si?.user_id as string | undefined;
  }).filter(Boolean))];

  let uploaderMap: Record<string, string> = {};
  if (uploaderIds.length > 0) {
    const { data: uploaders } = await supabase
      .from("users")
      .select("id, email")
      .in("id", uploaderIds);
    if (uploaders) {
      uploaderMap = Object.fromEntries(uploaders.map((u: { id: string; email: string }) => [u.id, u.email]));
    }
  }

  // いいね・保存数を取得
  const sharedImageIds = (reports || []).map((r: Record<string, unknown>) => r.shared_image_id).filter(Boolean);
  const likeCounts: Record<string, number> = {};
  const saveCounts: Record<string, number> = {};

  if (sharedImageIds.length > 0) {
    const [likesRes, savesRes] = await Promise.all([
      supabase.from("image_likes").select("shared_image_id").in("shared_image_id", sharedImageIds),
      supabase.from("image_saves").select("shared_image_id").in("shared_image_id", sharedImageIds),
    ]);
    for (const like of (likesRes.data || [])) {
      likeCounts[like.shared_image_id] = (likeCounts[like.shared_image_id] || 0) + 1;
    }
    for (const save of (savesRes.data || [])) {
      saveCounts[save.shared_image_id] = (saveCounts[save.shared_image_id] || 0) + 1;
    }
  }

  // Storage公開URLを生成
  const formattedReports = (reports || []).map((r: Record<string, unknown>) => {
    const si = r.shared_images as Record<string, unknown> | null;
    const gi = si?.generated_images as Record<string, unknown> | null;
    const reporter = r.users as Record<string, unknown> | null;
    const storagePath = gi?.storage_path as string | undefined;

    let imageUrl = "";
    if (storagePath) {
      const { data: urlData } = supabase.storage.from("generated-images").getPublicUrl(storagePath);
      imageUrl = urlData?.publicUrl || "";
    }

    return {
      id: r.id,
      shared_image_id: r.shared_image_id,
      image_url: imageUrl,
      image_category: si?.category || "other",
      reporter_email: reporter?.email || "unknown",
      uploader_email: uploaderMap[(si?.user_id as string) || ""] || "unknown",
      uploader_id: si?.user_id || "",
      reason: r.reason,
      detail: r.detail,
      created_at: r.created_at,
      image_created_at: si?.created_at || "",
      like_count: likeCounts[(r.shared_image_id as string) || ""] || 0,
      save_count: saveCounts[(r.shared_image_id as string) || ""] || 0,
    };
  });

  const totalCount = totalReportsRes.count || 0;

  return NextResponse.json({
    reports: formattedReports,
    stats: {
      total_reports: totalReportsRes.count || 0,
      pending_reports: pendingReportsRes.count || 0,
      total_shared_images: totalSharedRes.count || 0,
    },
    pagination: {
      page,
      total_pages: Math.ceil(totalCount / PAGE_SIZE),
      total_count: totalCount,
    },
  });
});
