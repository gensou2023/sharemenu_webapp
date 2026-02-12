import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

// アカウント情報取得
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, role, created_at, deleted_at, onboarding_completed_at")
      .eq("id", session.user.id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "ユーザー情報の取得に失敗しました。" },
        { status: 404 }
      );
    }

    if (user.deleted_at) {
      return NextResponse.json(
        { error: "このアカウントは退会済みです。" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}

// アカウント退会（ソフトデリート）
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("users")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", session.user.id);

    if (error) {
      console.error("Account withdrawal error:", error);
      return NextResponse.json(
        { error: "退会処理に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "退会処理が完了しました。",
    });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}

// アカウント情報更新
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, onboarding_completed_at } = body;

    // バリデーション
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "店舗名を入力してください。" },
          { status: 400 }
        );
      }
      if (name.length > 100) {
        return NextResponse.json(
          { error: "店舗名は100文字以内で入力してください。" },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (onboarding_completed_at !== undefined) updateData.onboarding_completed_at = new Date().toISOString();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "更新する項目がありません。" },
        { status: 400 }
      );
    }

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", session.user.id)
      .select("id, email, name, role")
      .single();

    if (error) {
      console.error("Account update error:", error);
      return NextResponse.json(
        { error: "更新に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: updatedUser,
      message: "アカウント情報を更新しました。",
    });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
