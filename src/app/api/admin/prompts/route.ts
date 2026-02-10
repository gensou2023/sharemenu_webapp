import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import { clearPromptCache } from "@/lib/prompt-loader";

// プロンプト一覧取得
export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .order("name")
    .order("version", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ prompts: data });
}

// プロンプト更新（新しいバージョンとして保存）
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const body = await req.json();
  const { name, content } = body;

  if (!name || !content) {
    return NextResponse.json({ error: "name と content は必須です" }, { status: 400 });
  }

  // 現在のアクティブバージョンを無効化
  await supabase
    .from("prompt_templates")
    .update({ is_active: false })
    .eq("name", name)
    .eq("is_active", true);

  // 最新バージョン番号を取得
  const { data: latest } = await supabase
    .from("prompt_templates")
    .select("version")
    .eq("name", name)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const newVersion = (latest?.version || 0) + 1;

  // 新しいバージョンを作成
  const { data, error } = await supabase
    .from("prompt_templates")
    .insert({
      name,
      content,
      version: newVersion,
      is_active: true,
      updated_by: session!.user!.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // プロンプトキャッシュをクリアして即時反映
  clearPromptCache();

  return NextResponse.json({ prompt: data });
}
