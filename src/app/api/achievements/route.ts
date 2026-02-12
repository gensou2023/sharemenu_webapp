import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// バッジ一覧取得
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // 全バッジ定義
    const { data: achievements } = await supabase
      .from("achievements")
      .select("id, key, name, description, icon, is_hidden, sort_order")
      .order("sort_order");

    // ユーザーの獲得バッジ
    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at, notified")
      .eq("user_id", session.user.id);

    const unlockedMap = new Map(
      (userAchievements || []).map((ua) => [
        ua.achievement_id,
        { unlocked_at: ua.unlocked_at, notified: ua.notified },
      ])
    );

    // 表示バッジ: 全8個（獲得/未獲得含む）
    // 非表示バッジ: 獲得済みのもののみ
    const visible = (achievements || [])
      .filter((a) => !a.is_hidden)
      .map((a) => ({
        ...a,
        unlocked_at: unlockedMap.get(a.id)?.unlocked_at || null,
        notified: unlockedMap.get(a.id)?.notified ?? true,
      }));

    const hidden = (achievements || [])
      .filter((a) => a.is_hidden && unlockedMap.has(a.id))
      .map((a) => ({
        ...a,
        unlocked_at: unlockedMap.get(a.id)?.unlocked_at || null,
        notified: unlockedMap.get(a.id)?.notified ?? true,
      }));

    const unnotifiedCount = [...visible, ...hidden].filter((a) => a.unlocked_at && !a.notified).length;

    return NextResponse.json({
      visible,
      hidden,
      totalHidden: (achievements || []).filter((a) => a.is_hidden).length,
      unlockedHiddenCount: hidden.length,
      unnotifiedCount,
    });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}

// 通知済みマーク
export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    await supabase
      .from("user_achievements")
      .update({ notified: true })
      .eq("user_id", session.user.id)
      .eq("notified", false);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
