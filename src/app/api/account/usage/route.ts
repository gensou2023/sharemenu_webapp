import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import type { UserPlan } from "@/lib/types";

const PLAN_IMAGE_LIMITS: Record<UserPlan, number> = {
  free: 10,
  pro: 50,
  business: 200,
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const userId = session.user.id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // 並行でクエリ実行
    const [userRes, monthlyImagesRes, totalImagesRes, totalSessionsRes, dailyRes] = await Promise.all([
      // ユーザーの plan を取得
      supabase
        .from("users")
        .select("plan")
        .eq("id", userId)
        .single(),
      // 今月の画像生成数
      supabase
        .from("generated_images")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", monthStart),
      // 累計画像数
      supabase
        .from("generated_images")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      // 累計セッション数
      supabase
        .from("chat_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      // 直近30日の日別生成数
      supabase
        .from("generated_images")
        .select("created_at")
        .eq("user_id", userId)
        .gte("created_at", new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true }),
    ]);

    // 日別集計
    const dailyMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = 0;
    }
    if (dailyRes.data) {
      for (const row of dailyRes.data) {
        const key = new Date(row.created_at).toISOString().slice(0, 10);
        if (dailyMap[key] !== undefined) {
          dailyMap[key]++;
        }
      }
    }
    const daily_chart = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    const plan: UserPlan = (userRes.data?.plan as UserPlan) || "free";
    const imageLimit = PLAN_IMAGE_LIMITS[plan];

    return NextResponse.json({
      plan,
      current_period: {
        image_generations_this_month: monthlyImagesRes.count ?? 0,
        image_generation_limit_month: imageLimit,
      },
      totals: {
        total_images: totalImagesRes.count ?? 0,
        total_sessions: totalSessionsRes.count ?? 0,
        storage_used_mb: Math.round((totalImagesRes.count ?? 0) * 0.5 * 10) / 10,
      },
      daily_chart,
    });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
