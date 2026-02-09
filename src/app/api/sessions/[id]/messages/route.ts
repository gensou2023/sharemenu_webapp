import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// セッションのメッセージ一覧取得
export async function GET(
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

  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, proposal_json, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}

// メッセージ保存（バッチ）
export async function POST(
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
  const { messages, shopName, category } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "メッセージが空です" }, { status: 400 });
  }

  // メッセージを保存
  const rows = messages.map((m: { role: string; content: string; proposal_json?: unknown }) => ({
    session_id: sessionId,
    role: m.role as "user" | "ai",
    content: m.content,
    proposal_json: m.proposal_json || null,
  }));

  const { error } = await supabase.from("messages").insert(rows);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // セッション情報を更新（店名・カテゴリが判明した場合）
  const updates: Record<string, string> = {};
  if (shopName) updates.shop_name = shopName;
  if (category) updates.category = category;
  if (Object.keys(updates).length > 0) {
    await supabase.from("chat_sessions").update(updates).eq("id", sessionId);
  }

  return NextResponse.json({ ok: true });
}
