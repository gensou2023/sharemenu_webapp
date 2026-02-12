import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import { checkAchievements } from "@/lib/achievement-checker";

const PAGE_SIZE = 12;

// ギャラリー一覧
export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || null;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "recent";

  try {
    const supabase = createAdminClient();
    const offset = (page - 1) * PAGE_SIZE;

    // 共有画像を取得
    let query = supabase
      .from("shared_images")
      .select(
        "id, category, show_shop_name, created_at, image_id, user_id, generated_images!inner(storage_path, prompt), users!inner(name)",
        { count: "exact" }
      );

    if (category) {
      query = query.eq("category", category);
    }

    if (sort === "recent") {
      query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + PAGE_SIZE - 1);

    const { data: shared, count, error } = await query;

    if (error) {
      console.error("Gallery list error:", error);
      return NextResponse.json({ error: "取得に失敗しました。" }, { status: 500 });
    }

    // 各画像のいいね数・保存数を取得
    const sharedIds = (shared || []).map((s) => s.id);

    const likeCounts: Record<string, number> = {};
    const saveCounts: Record<string, number> = {};
    const userLikes: Set<string> = new Set();
    const userSaves: Set<string> = new Set();

    if (sharedIds.length > 0) {
      // いいね数
      const { data: likes } = await supabase
        .from("image_likes")
        .select("shared_image_id")
        .in("shared_image_id", sharedIds);

      for (const like of likes || []) {
        likeCounts[like.shared_image_id] = (likeCounts[like.shared_image_id] || 0) + 1;
      }

      // 保存数
      const { data: saves } = await supabase
        .from("image_saves")
        .select("shared_image_id")
        .in("shared_image_id", sharedIds);

      for (const save of saves || []) {
        saveCounts[save.shared_image_id] = (saveCounts[save.shared_image_id] || 0) + 1;
      }

      // ログインユーザーのいいね・保存状態
      if (userId) {
        const { data: myLikes } = await supabase
          .from("image_likes")
          .select("shared_image_id")
          .in("shared_image_id", sharedIds)
          .eq("user_id", userId);

        for (const l of myLikes || []) {
          userLikes.add(l.shared_image_id);
        }

        const { data: mySaves } = await supabase
          .from("image_saves")
          .select("shared_image_id")
          .in("shared_image_id", sharedIds)
          .eq("user_id", userId);

        for (const s of mySaves || []) {
          userSaves.add(s.shared_image_id);
        }
      }
    }

    // いいね順・保存順のソート
    const items = (shared || []).map((s) => {
      const gen = s.generated_images as unknown as { storage_path: string; prompt: string };
      const user = s.users as unknown as { name: string };

      const { data: urlData } = supabase.storage
        .from("generated")
        .getPublicUrl(gen.storage_path);

      return {
        id: s.id,
        image_url: urlData.publicUrl,
        prompt: gen.prompt,
        category: s.category,
        shop_name: s.show_shop_name ? (user.name || null) : null,
        show_shop_name: s.show_shop_name,
        user_name: user.name || "匿名",
        created_at: s.created_at,
        like_count: likeCounts[s.id] || 0,
        save_count: saveCounts[s.id] || 0,
        is_liked: userLikes.has(s.id),
        is_saved: userSaves.has(s.id),
      };
    });

    if (sort === "likes") {
      items.sort((a, b) => b.like_count - a.like_count);
    } else if (sort === "saves") {
      items.sort((a, b) => b.save_count - a.save_count);
    }

    const total = count || 0;

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}

// 画像をギャラリーに共有
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { image_id, category, show_shop_name } = body;

    if (!image_id) {
      return NextResponse.json({ error: "画像IDが必要です。" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 画像の所有者チェック
    const { data: image } = await supabase
      .from("generated_images")
      .select("id, user_id")
      .eq("id", image_id)
      .single();

    if (!image || image.user_id !== session.user.id) {
      return NextResponse.json({ error: "この画像を共有する権限がありません。" }, { status: 403 });
    }

    // 重複チェック
    const { data: existing } = await supabase
      .from("shared_images")
      .select("id")
      .eq("image_id", image_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "この画像は既に共有されています。" }, { status: 409 });
    }

    const { data: shared, error } = await supabase
      .from("shared_images")
      .insert({
        image_id,
        user_id: session.user.id,
        category: category || "other",
        show_shop_name: show_shop_name || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Gallery share error:", error);
      return NextResponse.json({ error: "共有に失敗しました。" }, { status: 500 });
    }

    // バッジ判定（非ブロッキング）
    checkAchievements(session.user.id).catch(() => {});

    return NextResponse.json({ shared_image: shared });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
