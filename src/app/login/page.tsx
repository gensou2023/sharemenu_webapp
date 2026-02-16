"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthErrorMessage from "@/components/auth/AuthErrorMessage";
import AuthFooterLink from "@/components/auth/AuthFooterLink";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      setIsLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <AuthLayout title="おかえりなさい" subtitle="アカウントにログインしてください">
      {/* デモ情報（デモモード時のみ表示） */}
      {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
        <div className="mb-6 p-3 rounded-[8px] bg-[rgba(123,138,100,.1)] border border-[rgba(123,138,100,.2)]">
          <div className="text-xs font-semibold text-accent-olive mb-1">デモアカウント</div>
          <div className="text-xs text-text-secondary">
            Email: <code className="bg-bg-tag px-1 rounded">demo@menucraft.jp</code><br/>
            Pass: <code className="bg-bg-tag px-1 rounded">demo1234</code>
          </div>
        </div>
      )}

      {error && <AuthErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          required
        />

        <AuthInput
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワードを入力"
          required
          labelRight={
            <Link
              href="/forgot-password"
              className="text-xs text-accent-warm hover:text-accent-warm-hover transition-colors no-underline"
            >
              パスワードをお忘れですか？
            </Link>
          }
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-[28px] bg-bg-dark text-text-inverse text-sm font-semibold transition-all duration-300 hover:shadow-[0_12px_40px_rgba(26,23,20,.14)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2 cursor-pointer"
        >
          {isLoading ? "ログイン中..." : "ログイン →"}
        </button>
      </form>

      <AuthFooterLink
        text="アカウントをお持ちでないですか？"
        href="/signup"
        linkText="無料で登録"
      />
    </AuthLayout>
  );
}
