import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase";

const PRO_PRICE = 700; // 円/月

export const GET = withAdmin(async (_req: NextRequest) => {
  const supabase = createAdminClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // --- 並列クエリ ---
  const [
    totalUsersRes,
    activeUsersRes,
    profileCompletionRes,
    totalUsersForProfileRes,
    signup30dRes,
    monthlySessionsRes,
    dailySignupsRes,
    dailyActiveRes,
  ] = await Promise.all([
    // 全ユーザー数（deleted除外）
    supabase.from("users").select("*", { count: "exact", head: true }).is("deleted_at", null),
    // 30日以内にセッション作成したユニークユーザー
    supabase.from("chat_sessions").select("user_id").gte("created_at", thirtyDaysAgo),
    // プロフィール設定済みユーザー
    supabase.from("users").select("*", { count: "exact", head: true }).not("business_type", "is", null).is("deleted_at", null),
    // 全ユーザー（プロフィール率の分母）
    supabase.from("users").select("*", { count: "exact", head: true }).is("deleted_at", null),
    // 30日新規登録
    supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo).is("deleted_at", null),
    // 今月のセッション（ユーザー別カウント用）
    supabase.from("chat_sessions").select("user_id").gte("created_at", monthStart),
    // 日別新規登録（30日）
    supabase.from("users").select("created_at").gte("created_at", thirtyDaysAgo).is("deleted_at", null).order("created_at"),
    // 日別アクティブ（30日）
    supabase.from("chat_sessions").select("created_at, user_id").gte("created_at", thirtyDaysAgo).order("created_at"),
  ]);

  const totalUsers = totalUsersRes.count || 0;

  // plan カラムから Pro ユーザー数を取得
  const { count: proUsersCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("plan", "pro")
    .is("deleted_at", null);
  const proUsers = proUsersCount || 0;
  const freeUsers = totalUsers - proUsers;

  // アクティブユーザー（ユニーク）
  const activeUserIds = new Set((activeUsersRes.data || []).map((r: { user_id: string }) => r.user_id));
  const activeUsers30d = activeUserIds.size;

  // プロフィール完了率
  const profileCompleted = profileCompletionRes.count || 0;
  const profileTotal = totalUsersForProfileRes.count || 1;
  const profileCompletionRate = Math.round((profileCompleted / profileTotal) * 100);

  // パワーユーザー（今月5セッション以上）
  const sessionCountByUser: Record<string, number> = {};
  for (const s of (monthlySessionsRes.data || [])) {
    sessionCountByUser[s.user_id] = (sessionCountByUser[s.user_id] || 0) + 1;
  }
  const powerUsers = Object.values(sessionCountByUser).filter((c) => c >= 5).length;

  // 画像上限到達者（今月、Free上限 = 10枚/月）
  const { data: monthlyImages } = await supabase
    .from("generated_images")
    .select("user_id")
    .gte("created_at", monthStart);

  const imageCountByUser: Record<string, number> = {};
  for (const img of (monthlyImages || [])) {
    imageCountByUser[img.user_id] = (imageCountByUser[img.user_id] || 0) + 1;
  }
  const imageLimitHitUsers = Object.values(imageCountByUser).filter((c) => c >= 10).length;

  // 日別トレンド: 新規登録
  const dailySignupMap: Record<string, number> = {};
  for (const u of (dailySignupsRes.data || [])) {
    const date = new Date(u.created_at).toISOString().slice(0, 10);
    dailySignupMap[date] = (dailySignupMap[date] || 0) + 1;
  }

  // 日別トレンド: アクティブ
  const dailyActiveMap: Record<string, Set<string>> = {};
  for (const s of (dailyActiveRes.data || [])) {
    const date = new Date(s.created_at).toISOString().slice(0, 10);
    if (!dailyActiveMap[date]) dailyActiveMap[date] = new Set();
    dailyActiveMap[date].add(s.user_id);
  }

  // 30日分のデータ生成
  const dailySignups: { date: string; count: number }[] = [];
  const dailyActive: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    dailySignups.push({ date: dateStr, count: dailySignupMap[dateStr] || 0 });
    dailyActive.push({ date: dateStr, count: dailyActiveMap[dateStr]?.size || 0 });
  }

  // リテンション（簡易コホート）
  const retention = await calcRetention(supabase);

  // Pro転換候補（今月画像生成数が多いユーザー上位20名）
  const limitHitUserIds = Object.entries(imageCountByUser)
    .filter(([, c]) => c >= 5)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([id]) => id);

  let upgradeCandidates: { id: string; name: string; email: string; images_this_month: number; total_images: number; created_at: string }[] = [];
  if (limitHitUserIds.length > 0) {
    const { data: candidates } = await supabase
      .from("users")
      .select("id, name, email, created_at")
      .in("id", limitHitUserIds);

    // 各候補の画像数を取得
    const { data: imageCounts } = await supabase
      .from("generated_images")
      .select("user_id")
      .in("user_id", limitHitUserIds);

    const imagesByUser: Record<string, number> = {};
    for (const img of (imageCounts || [])) {
      imagesByUser[img.user_id] = (imagesByUser[img.user_id] || 0) + 1;
    }

    upgradeCandidates = (candidates || []).map((u: { id: string; name: string; email: string; created_at: string }) => ({
      id: u.id,
      name: u.name || "—",
      email: u.email,
      images_this_month: imageCountByUser[u.id] || 0,
      total_images: imagesByUser[u.id] || 0,
      created_at: u.created_at,
    })).sort((a: { images_this_month: number }, b: { images_this_month: number }) => b.images_this_month - a.images_this_month);
  }

  return NextResponse.json({
    plan_distribution: { free: freeUsers, pro: proUsers, total: totalUsers },
    estimated_mrr: proUsers * PRO_PRICE,
    conversion: {
      signup_30d: signup30dRes.count || 0,
      active_users_30d: activeUsers30d,
      activation_rate: totalUsers > 0 ? Math.round((activeUsers30d / totalUsers) * 100) : 0,
      profile_completion_rate: profileCompletionRate,
      power_users: powerUsers,
    },
    limit_hits: {
      image_limit_hit_users: imageLimitHitUsers,
    },
    daily_signups: dailySignups,
    daily_active: dailyActive,
    retention,
    upgrade_candidates: upgradeCandidates,
  });
});

// 簡易リテンション計算
async function calcRetention(supabase: ReturnType<typeof createAdminClient>) {
  const now = Date.now();
  const week = (n: number) => new Date(now - n * 7 * 24 * 60 * 60 * 1000).toISOString();

  // 1/2/4週間前に登録したユーザーを取得
  const results = { week1: 0, week2: 0, week4: 0 };

  for (const [key, weeksAgo] of [["week1", 1], ["week2", 2], ["week4", 4]] as const) {
    const cohortStart = week(weeksAgo + 1);
    const cohortEnd = week(weeksAgo);

    const { data: cohortUsers } = await supabase
      .from("users")
      .select("id")
      .gte("created_at", cohortStart)
      .lt("created_at", cohortEnd)
      .is("deleted_at", null);

    if (!cohortUsers || cohortUsers.length === 0) continue;

    const cohortIds = cohortUsers.map((u: { id: string }) => u.id);
    const { data: activeSessions } = await supabase
      .from("chat_sessions")
      .select("user_id")
      .in("user_id", cohortIds)
      .gte("created_at", cohortEnd);

    const activeSet = new Set((activeSessions || []).map((s: { user_id: string }) => s.user_id));
    results[key] = Math.round((activeSet.size / cohortUsers.length) * 100);
  }

  return results;
}
