import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { withAdmin } from "@/lib/admin-auth";

// ユーザー一覧（管理者用）
export const GET = withAdmin(async (req: NextRequest) => {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("users")
    .select(
      `
      id,
      email,
      name,
      role,
      created_at,
      deleted_at,
      chat_sessions (id),
      generated_images (id)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const users = (data || []).map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    created_at: u.created_at,
    deleted_at: u.deleted_at,
    sessionCount: (u.chat_sessions as { id: string }[])?.length || 0,
    imageCount: (u.generated_images as { id: string }[])?.length || 0,
  }));

  return NextResponse.json({
    users,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
});
