import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// プロンプト編集
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const supabase = createAdminClient();

    // 所有者チェック
    const { data: existing } = await supabase
      .from("user_prompts")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "このプロンプトを編集する権限がありません。" }, { status: 403 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0 || body.name.length > 100) {
        return NextResponse.json({ error: "名前は1〜100文字で入力してください。" }, { status: 400 });
      }
      updates.name = body.name.trim();
    }
    if (body.prompt_text !== undefined) {
      if (typeof body.prompt_text !== "string" || body.prompt_text.trim().length === 0 || body.prompt_text.length > 2000) {
        return NextResponse.json({ error: "プロンプトは1〜2000文字で入力してください。" }, { status: 400 });
      }
      updates.prompt_text = body.prompt_text.trim();
    }
    if (body.category !== undefined) {
      updates.category = body.category || null;
    }
    if (typeof body.usage_count === "number") {
      updates.usage_count = body.usage_count;
    }

    const { data, error } = await supabase
      .from("user_prompts")
      .update(updates)
      .eq("id", id)
      .select("id, name, prompt_text, category, usage_count, created_at, updated_at")
      .single();

    if (error) {
      console.error("Prompt update error:", error);
      return NextResponse.json({ error: "更新に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ prompt: data });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}

// プロンプト削除
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const supabase = createAdminClient();

    // 所有者チェック
    const { data: existing } = await supabase
      .from("user_prompts")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "このプロンプトを削除する権限がありません。" }, { status: 403 });
    }

    const { error } = await supabase
      .from("user_prompts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Prompt delete error:", error);
      return NextResponse.json({ error: "削除に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
