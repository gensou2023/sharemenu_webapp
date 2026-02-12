import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { reason, detail } = body;

    if (!reason || !["inappropriate", "spam", "other"].includes(reason)) {
      return NextResponse.json({ error: "報告理由を選択してください。" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("image_reports").insert({
      shared_image_id: id,
      user_id: session.user.id,
      reason,
      detail: detail || null,
    });

    if (error) {
      console.error("Report error:", error);
      return NextResponse.json({ error: "報告に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ message: "報告を受け付けました。" });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
