import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password-validation";

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
    const { name, onboarding_completed_at, current_password, new_password } = body;

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

    // パスワード変更処理
    let passwordChanged = false;
    if (current_password !== undefined || new_password !== undefined) {
      if (!current_password || !new_password) {
        return NextResponse.json(
          { error: "現在のパスワードと新しいパスワードの両方を入力してください。" },
          { status: 400 }
        );
      }

      const validation = validatePassword(new_password);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // 現在のパスワードハッシュを取得
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("password_hash")
        .eq("id", session.user.id)
        .single();

      if (fetchError || !userData?.password_hash) {
        return NextResponse.json(
          { error: "パスワード情報の取得に失敗しました。" },
          { status: 500 }
        );
      }

      // 現在のパスワード検証
      const isCurrentValid = await bcrypt.compare(current_password, userData.password_hash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "現在のパスワードが正しくありません。" },
          { status: 400 }
        );
      }

      // 新旧同一チェック
      const isSame = await bcrypt.compare(new_password, userData.password_hash);
      if (isSame) {
        return NextResponse.json(
          { error: "新しいパスワードは現在のパスワードと異なるものを設定してください。" },
          { status: 400 }
        );
      }

      const newHash = await bcrypt.hash(new_password, 10);
      updateData.password_hash = newHash;
      passwordChanged = true;
    }

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
      message: passwordChanged ? "パスワードを変更しました。" : "アカウント情報を更新しました。",
    });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
