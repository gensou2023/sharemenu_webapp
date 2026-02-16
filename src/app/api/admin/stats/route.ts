import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { withAdmin } from "@/lib/admin-auth";

// --- 型定義 ---

type DailyDataPoint = {
  date: string;
  users: number;
  sessions: number;
  images: number;
};

type KpiMetric = {
  current: number;
  previous: number;
  changePercent: number;
  sparkline: number[];
};

type RecentSession = {
  id: string;
  shop_name: string | null;
  title: string;
  status: string;
  user_name: string;
  created_at: string;
  imageCount: number;
};

type AdminDashboardStats = {
  kpi: {
    totalUsers: KpiMetric;
    totalSessions: KpiMetric;
    totalImages: KpiMetric;
    completionRate: KpiMetric;
  };
  timeseries: DailyDataPoint[];
  completion: {
    completed: number;
    active: number;
  };
  recentSessions: RecentSession[];
  apiHealth: {
    totalCalls: number;
    successRate: number;
    avgResponseMs: number;
    errorCount: number;
  };
  gallery: {
    total_shared: number;
    total_likes: number;
    total_saves: number;
    pending_reports: number;
  };
  profile_completion_rate: number;
};

// --- ヘルパー関数 ---

function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// --- メインハンドラー ---

export const GET = withAdmin(async () => {
  const supabase = createAdminClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000).toISOString();

  const [
    // 全期間カウント
    allUsers,
    allSessions,
    allImages,
    // 直近30日カウント
    currentUsers,
    currentSessions,
    currentImages,
    // 前期（31〜60日前）カウント
    prevUsers,
    prevSessions,
    prevImages,
    // セッション完了/進行中
    completedSessions,
    activeSessions,
    // 直近5セッション
    recentSessionsData,
    // APIヘルス（直近30日のログ）
    apiLogsData,
    // ギャラリー統計
    sharedImagesCount,
    likesCount,
    savesCount,
    reportsCount,
    // プロフィール設定率
    profileCompletedCount,
  ] = await Promise.all([
    // 全期間
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("chat_sessions").select("id", { count: "exact", head: true }),
    supabase.from("generated_images").select("id", { count: "exact", head: true }),
    // 直近30日
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("generated_images")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo),
    // 前期（31〜60日前）
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sixtyDaysAgo)
      .lt("created_at", thirtyDaysAgo),
    supabase
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sixtyDaysAgo)
      .lt("created_at", thirtyDaysAgo),
    supabase
      .from("generated_images")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sixtyDaysAgo)
      .lt("created_at", thirtyDaysAgo),
    // 完了/進行中
    supabase
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    // 直近5セッション
    supabase
      .from("chat_sessions")
      .select(
        "id, title, status, shop_name, created_at, users!inner(name, email)"
      )
      .order("created_at", { ascending: false })
      .limit(5),
    // APIログ（直近30日）
    supabase
      .from("api_usage_logs")
      .select("status, duration_ms")
      .gte("created_at", thirtyDaysAgo),
    // ギャラリー統計
    supabase.from("shared_images").select("id", { count: "exact", head: true }),
    supabase.from("image_likes").select("id", { count: "exact", head: true }),
    supabase.from("image_saves").select("id", { count: "exact", head: true }),
    supabase.from("image_reports").select("id", { count: "exact", head: true }),
    // プロフィール設定率
    supabase.from("users").select("id", { count: "exact", head: true }).not("business_type", "is", null).is("deleted_at", null),
  ]);

  // --- 時系列集計（RPC で DB 側で集計） ---
  const { data: timeseriesData } = await supabase.rpc("get_admin_timeseries", {
    p_since: thirtyDaysAgo,
  });

  const timeseries: DailyDataPoint[] = (timeseriesData || []).map(
    (row: { day: string; user_count: number; session_count: number; image_count: number }) => ({
      date: row.day,
      users: Number(row.user_count),
      sessions: Number(row.session_count),
      images: Number(row.image_count),
    })
  );

  // --- 完了率 ---
  const completedCount = completedSessions.count || 0;
  const activeCount = activeSessions.count || 0;
  const totalSessionsAll = completedCount + activeCount;
  const completionRateCurrent =
    totalSessionsAll > 0
      ? Math.round((completedCount / totalSessionsAll) * 1000) / 10
      : 0;

  // --- APIヘルス ---
  const apiLogs = apiLogsData.data || [];
  const totalApiCalls = apiLogs.length;
  const successCalls = apiLogs.filter(
    (l: { status: string }) => l.status === "success"
  ).length;
  const errorCount = totalApiCalls - successCalls;
  const successRate =
    totalApiCalls > 0
      ? Math.round((successCalls / totalApiCalls) * 1000) / 10
      : 100;
  const avgResponseMs =
    totalApiCalls > 0
      ? Math.round(
          apiLogs.reduce(
            (sum: number, l: { duration_ms: number | null }) =>
              sum + (l.duration_ms || 0),
            0
          ) / totalApiCalls
        )
      : 0;

  // --- 直近セッション整形 ---
  const recentSessions: RecentSession[] = (recentSessionsData.data || []).map(
    (s: {
      id: string;
      title: string;
      status: string;
      shop_name: string | null;
      created_at: string;
      users: { name: string; email: string } | { name: string; email: string }[];
    }) => {
      const user = Array.isArray(s.users) ? s.users[0] : s.users;
      return {
        id: s.id,
        shop_name: s.shop_name,
        title: s.title,
        status: s.status,
        user_name: user?.name || user?.email || "—",
        created_at: s.created_at,
        imageCount: 0,
      };
    }
  );

  // --- レスポンス ---
  const stats: AdminDashboardStats = {
    kpi: {
      totalUsers: {
        current: allUsers.count || 0,
        previous: prevUsers.count || 0,
        changePercent: calcChange(
          currentUsers.count || 0,
          prevUsers.count || 0
        ),
        sparkline: timeseries.slice(-7).map((d) => d.users),
      },
      totalSessions: {
        current: allSessions.count || 0,
        previous: prevSessions.count || 0,
        changePercent: calcChange(
          currentSessions.count || 0,
          prevSessions.count || 0
        ),
        sparkline: timeseries.slice(-7).map((d) => d.sessions),
      },
      totalImages: {
        current: allImages.count || 0,
        previous: prevImages.count || 0,
        changePercent: calcChange(
          currentImages.count || 0,
          prevImages.count || 0
        ),
        sparkline: timeseries.slice(-7).map((d) => d.images),
      },
      completionRate: {
        current: completionRateCurrent,
        previous: 0,
        changePercent: 0,
        sparkline: [],
      },
    },
    timeseries,
    completion: {
      completed: completedCount,
      active: activeCount,
    },
    recentSessions,
    apiHealth: {
      totalCalls: totalApiCalls,
      successRate,
      avgResponseMs,
      errorCount,
    },
    gallery: {
      total_shared: sharedImagesCount.count || 0,
      total_likes: likesCount.count || 0,
      total_saves: savesCount.count || 0,
      pending_reports: reportsCount.count || 0,
    },
    profile_completion_rate: (allUsers.count || 0) > 0
      ? Math.round(((profileCompletedCount.count || 0) / (allUsers.count || 1)) * 100)
      : 0,
  };

  return NextResponse.json(stats);
});
