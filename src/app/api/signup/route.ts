import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password-validation";
import { checkRateLimit } from "@/lib/rate-limiter";

// ユーザー新規登録API
export async function POST(req: NextRequest) {
  // レート制限（IPベース）
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateLimit = checkRateLimit(ip, "signup");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "登録リクエストが多すぎます。しばらくしてからお試しください。" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.retryAfterMs ?? 1000) / 1000)),
        },
      }
    );
  }

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
    const pwValidation = validatePassword(password);
    if (!pwValidation.valid) {
      return NextResponse.json(
        { error: pwValidation.error },
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
