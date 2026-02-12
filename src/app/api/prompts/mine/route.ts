import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// マイプロンプト一覧
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "この機能はAdmin限定です。" }, { status: 403 });
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("user_prompts")
      .select("id, name, prompt_text, category, usage_count, created_at, updated_at")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Prompts list error:", error);
      return NextResponse.json({ error: "取得に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ prompts: data || [] });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}

// プロンプト保存
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "この機能はAdmin限定です。" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, prompt_text, category } = body;

    // バリデーション
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      return NextResponse.json({ error: "名前は1〜100文字で入力してください。" }, { status: 400 });
    }
    if (!prompt_text || typeof prompt_text !== "string" || prompt_text.trim().length === 0 || prompt_text.length > 2000) {
      return NextResponse.json({ error: "プロンプトは1〜2000文字で入力してください。" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("user_prompts")
      .insert({
        user_id: session.user.id,
        name: name.trim(),
        prompt_text: prompt_text.trim(),
        category: category || null,
      })
      .select("id, name, prompt_text, category, usage_count, created_at, updated_at")
      .single();

    if (error) {
      console.error("Prompt save error:", error);
      return NextResponse.json({ error: "保存に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ prompt: data });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
