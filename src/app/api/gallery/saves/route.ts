import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// 自分の保存画像一覧
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { data: saves, error } = await supabase
      .from("image_saves")
      .select(
        "id, created_at, shared_images!inner(id, category, show_shop_name, generated_images!inner(storage_path, prompt), users!inner(name))"
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Saved images error:", error);
      return NextResponse.json({ error: "取得に失敗しました。" }, { status: 500 });
    }

    const items = (saves || []).map((s) => {
      const shared = s.shared_images as unknown as {
        id: string;
        category: string;
        show_shop_name: boolean;
        generated_images: { storage_path: string; prompt: string };
        users: { name: string };
      };

      const { data: urlData } = supabase.storage
        .from("generated")
        .getPublicUrl(shared.generated_images.storage_path);

      return {
        id: shared.id,
        image_url: urlData.publicUrl,
        prompt: shared.generated_images.prompt,
        category: shared.category,
        shop_name: shared.show_shop_name ? (shared.users.name || null) : null,
        saved_at: s.created_at,
      };
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
