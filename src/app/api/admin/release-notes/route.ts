import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { withAdmin } from "@/lib/admin-auth";

// リリースノート一覧取得（published + draft）
export const GET = withAdmin(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("release_notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ releaseNotes: data });
});

// リリースノート新規作成
export const POST = withAdmin(async (req: NextRequest) => {
  const supabase = createAdminClient();
  const body = await req.json();
  const { version, title, content, category, is_published } = body;

  if (!version || !title || !content) {
    return NextResponse.json({ error: "version, title, content は必須です" }, { status: 400 });
  }

  const insertData: Record<string, unknown> = {
    version,
    title,
    content,
    category: category || "feature",
    is_published: is_published || false,
  };

  if (is_published) {
    insertData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("release_notes")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ releaseNote: data });
});
