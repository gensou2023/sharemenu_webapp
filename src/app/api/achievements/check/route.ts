import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkAchievements } from "@/lib/achievement-checker";
import { createNotification } from "@/lib/notifications";

// バッジ判定実行
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const newAchievements = await checkAchievements(session.user.id);

    // 新規獲得バッジの通知を生成
    for (const badge of newAchievements) {
      createNotification({
        userId: session.user.id,
        type: "achievement_unlock",
        title: badge.name,
        message: `「${badge.name}」を獲得しました！`,
        metadata: { achievementKey: badge.key, icon: badge.icon },
      });
    }

    return NextResponse.json({
      newAchievements,
      count: newAchievements.length,
    });
  } catch (error) {
    console.error("Achievement check error:", error);
    return NextResponse.json({ error: "判定に失敗しました。" }, { status: 500 });
  }
}
