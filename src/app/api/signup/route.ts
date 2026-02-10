import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// ユーザー新規登録API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // --- バリデーション ---
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "店舗名、メールアドレス、パスワードは必須です。" },
        { status: 400 }
      );
    }

    // メール形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "メールアドレスの形式が正しくありません。" },
        { status: 400 }
      );
    }

    // パスワード強度チェック
    if (password.length < 8) {
      return NextResponse.json(
        { error: "パスワードは8文字以上で設定してください。" },
        { status: 400 }
      );
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "パスワードには英字と数字の両方を含めてください。" },
        { status: 400 }
      );
    }

    // 店舗名の長さチェック
    if (name.length > 100) {
      return NextResponse.json(
        { error: "店舗名は100文字以内で入力してください。" },
        { status: 400 }
      );
    }

    // --- Supabase 接続 ---
    const supabase = createAdminClient();

    // 重複チェック
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています。" },
        { status: 409 }
      );
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, 10);

    // ユーザー作成
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        name,
        role: "user",
        password_hash: passwordHash,
      })
      .select("id, email, name, role")
      .single();

    if (insertError) {
      console.error("User registration error:", insertError);
      return NextResponse.json(
        { error: "アカウントの作成に失敗しました。しばらくしてからお試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: newUser,
      message: "アカウントが作成されました。",
    });
  } catch (err) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
