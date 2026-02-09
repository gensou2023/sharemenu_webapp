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

  const { data, error } = await supabase
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
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const logs = (data || []).map((log) => ({
    ...log,
    user_email: (log.users as unknown as { email: string })?.email || "—",
  }));

  return NextResponse.json({ logs });
}
