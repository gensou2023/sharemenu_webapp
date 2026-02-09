import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// セッション一覧取得（ダッシュボード用）
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const userId = session.user.id;

  const { data, error } = await supabase
    .from("chat_sessions")
    .select(`
      id,
      title,
      status,
      shop_name,
      category,
      created_at,
      updated_at,
      generated_images (id, storage_path)
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data });
}

// 新規セッション作成
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: session.user.id,
      title: body.title || "新規セッション",
    })
    .select("id, title, status, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session: data });
}
