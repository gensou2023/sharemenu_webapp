import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { withAdmin } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const status = searchParams.get("status"); // "success" | "error"
  const apiType = searchParams.get("api_type"); // "chat" | "image_gen"
  const from = searchParams.get("from"); // ISO date string
  const to = searchParams.get("to"); // ISO date string

  const offset = (page - 1) * PAGE_SIZE;
  const supabase = createAdminClient();

  let query = supabase
    .from("api_usage_logs")
    .select(`
      id,
      api_type,
      model,
      status,
      duration_ms,
      tokens_in,
      tokens_out,
      error_message,
      created_at,
      users!inner (email)
    `, { count: "exact" })
    .order("created_at", { ascending: false });

  // フィルタ適用
  if (status === "success" || status === "error") {
    query = query.eq("status", status);
  }
  if (apiType === "chat" || apiType === "image_gen") {
    query = query.eq("api_type", apiType);
  }
  if (from) {
    query = query.gte("created_at", from);
  }
  if (to) {
    query = query.lte("created_at", to);
  }

  const { data, error, count } = await query.range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const logs = (data || []).map((log) => ({
    ...log,
    user_email: (log.users as unknown as { email: string })?.email || "—",
  }));

  const totalCount = count || 0;

  return NextResponse.json({
    logs,
    pagination: {
      page,
      total_pages: Math.ceil(totalCount / PAGE_SIZE),
      total_count: totalCount,
    },
  });
});
