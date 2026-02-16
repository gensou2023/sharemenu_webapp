import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";

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

    // 既にいいね済みか確認
    const { data: existing } = await supabase
      .from("image_likes")
      .select("id")
      .eq("shared_image_id", id)
      .eq("user_id", session.user.id)
      .single();

    if (existing) {
      // いいね解除
      await supabase.from("image_likes").delete().eq("id", existing.id);
    } else {
      // いいね追加
      const { error } = await supabase.from("image_likes").insert({
        shared_image_id: id,
        user_id: session.user.id,
      });
      if (error) {
        console.error("Like error:", error);
        return NextResponse.json({ error: "いいねに失敗しました。" }, { status: 500 });
      }
    }

    // 新規いいね時にオーナーへ通知
    if (!existing) {
      const { data: image } = await supabase
        .from("shared_images")
        .select("user_id")
        .eq("id", id)
        .single();
      if (image && image.user_id !== session.user.id) {
        createNotification({
          userId: image.user_id,
          type: "gallery_reaction",
          title: "いいねされました",
          message: "あなたの画像にいいねが付きました。",
          metadata: { sharedImageId: id, fromUserId: session.user.id },
        });
      }
    }

    // 最新のいいね数を取得
    const { count } = await supabase
      .from("image_likes")
      .select("id", { count: "exact", head: true })
      .eq("shared_image_id", id);

    return NextResponse.json({
      liked: !existing,
      like_count: count || 0,
    });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
