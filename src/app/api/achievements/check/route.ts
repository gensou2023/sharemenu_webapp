import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkAchievements } from "@/lib/achievement-checker";

// バッジ判定実行
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const newAchievements = await checkAchievements(session.user.id);

    return NextResponse.json({
      newAchievements,
      count: newAchievements.length,
    });
  } catch (error) {
    console.error("Achievement check error:", error);
    return NextResponse.json({ error: "判定に失敗しました。" }, { status: 500 });
  }
}
