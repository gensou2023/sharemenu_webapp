import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalUsers,
    totalSessions,
    totalImages,
    monthlyImages,
    recentLogs,
    errorLogs,
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("chat_sessions").select("id", { count: "exact", head: true }),
    supabase.from("generated_images").select("id", { count: "exact", head: true }),
    supabase.from("generated_images").select("id", { count: "exact", head: true }).gte("created_at", thisMonth),
    supabase.from("api_usage_logs").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("api_usage_logs").select("id", { count: "exact", head: true }).eq("status", "error").gte("created_at", thirtyDaysAgo),
  ]);

  return NextResponse.json({
    totalUsers: totalUsers.count || 0,
    totalSessions: totalSessions.count || 0,
    totalImages: totalImages.count || 0,
    monthlyImages: monthlyImages.count || 0,
    recentApiCalls: recentLogs.count || 0,
    recentApiErrors: errorLogs.count || 0,
  });
}
