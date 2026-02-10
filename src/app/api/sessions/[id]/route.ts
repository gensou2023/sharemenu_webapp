import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// セッションの更新（ステータス変更・店名更新など）
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id: sessionId } = await params;
  const supabase = createAdminClient();

  // セッションの所有権確認
  const { data: chatSession } = await supabase
    .from("chat_sessions")
    .select("id, user_id")
    .eq("id", sessionId)
    .single();

  if (!chatSession || chatSession.user_id !== session.user.id) {
    return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
  }

  const body = await req.json();
  const updates: Record<string, string> = {};

  // 許可するフィールドのみ更新
  if (body.status === "active" || body.status === "completed") {
    updates.status = body.status;
  }
  if (body.shop_name) {
    updates.shop_name = body.shop_name;
  }
  if (body.title) {
    updates.title = body.title;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "更新するフィールドがありません" }, { status: 400 });
  }

  const { error } = await supabase
    .from("chat_sessions")
    .update(updates)
    .eq("id", sessionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// セッションの削除（関連する画像・メッセージも削除）
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id: sessionId } = await params;
  const supabase = createAdminClient();

  // セッションの所有権確認
  const { data: chatSession } = await supabase
    .from("chat_sessions")
    .select("id, user_id")
    .eq("id", sessionId)
    .single();

  if (!chatSession || chatSession.user_id !== session.user.id) {
    return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
  }

  // 関連する画像のストレージパスを取得
  const { data: images } = await supabase
    .from("generated_images")
    .select("storage_path")
    .eq("session_id", sessionId);

  // ストレージから画像ファイルを削除
  if (images && images.length > 0) {
    const paths = images.map((img) => img.storage_path);
    await supabase.storage.from("generated").remove(paths);
  }

  // セッションを削除（CASCADE で messages, generated_images も自動削除）
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
