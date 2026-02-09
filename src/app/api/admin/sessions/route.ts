import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// 全セッション一覧（管理者用）
export async function GET(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("chat_sessions")
    .select(`
      id,
      title,
      status,
      shop_name,
      category,
      created_at,
      updated_at,
      users!inner (email, name),
      generated_images (id),
      messages (id)
    `, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sessions = (data || []).map((s) => ({
    ...s,
    imageCount: (s.generated_images as { id: string }[])?.length || 0,
    messageCount: (s.messages as { id: string }[])?.length || 0,
  }));

  return NextResponse.json({
    sessions,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
