import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

const SAVE_LIMIT_FREE = 3;
const SAVE_LIMIT_PRO = 5;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const supabase = createAdminClient();

    // 既に保存済みか確認
    const { data: existing } = await supabase
      .from("image_saves")
      .select("id")
      .eq("shared_image_id", id)
      .eq("user_id", session.user.id)
      .single();

    if (existing) {
      // 保存解除
      await supabase.from("image_saves").delete().eq("id", existing.id);
    } else {
      // 保存枚数制限チェック
      const { count: currentCount } = await supabase
        .from("image_saves")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      const limit = session.user.role === "admin" ? SAVE_LIMIT_PRO : SAVE_LIMIT_FREE;
      if ((currentCount || 0) >= limit) {
        return NextResponse.json(
          { error: `保存枚数の上限（${limit}枚）に達しています。` },
          { status: 429 }
        );
      }

      // 保存追加
      const { error } = await supabase.from("image_saves").insert({
        shared_image_id: id,
        user_id: session.user.id,
      });
      if (error) {
        console.error("Save error:", error);
        return NextResponse.json({ error: "保存に失敗しました。" }, { status: 500 });
      }
    }

    // 最新の保存数を取得
    const { count } = await supabase
      .from("image_saves")
      .select("id", { count: "exact", head: true })
      .eq("shared_image_id", id);

    return NextResponse.json({
      saved: !existing,
      save_count: count || 0,
    });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
