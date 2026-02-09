"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

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
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      {/* 背景グラデーション */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 20% 50%, rgba(196,113,59,.06), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(212,168,83,.06), transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(123,138,100,.04), transparent 40%)"
      }} />

      <div className="w-full max-w-[420px] relative z-10">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 no-underline">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#D4A853" strokeWidth="2" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="10" r="1" fill="#D4A853" />
              <circle cx="15" cy="10" r="1" fill="#D4A853" />
            </svg>
            <span className="font-[family-name:var(--font-playfair)] text-accent-gold text-xl font-bold tracking-wide">
              MenuCraft AI
            </span>
          </Link>
        </div>

        {/* カード */}
        <div className="bg-bg-secondary rounded-[20px] border border-border-light p-8 shadow-[0_4px_24px_rgba(26,23,20,.10)]">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-center mb-2">
            おかえりなさい
          </h1>
          <p className="text-text-secondary text-sm text-center mb-8">
            アカウントにログインしてください
          </p>

          {/* デモ情報 */}
          <div className="mb-6 p-3 rounded-[8px] bg-[rgba(123,138,100,.1)] border border-[rgba(123,138,100,.2)]">
            <div className="text-xs font-semibold text-accent-olive mb-1">デモアカウント</div>
            <div className="text-xs text-text-secondary">
              Email: <code className="bg-[#EDE8E0] px-1 rounded">demo@menucraft.jp</code><br/>
              Pass: <code className="bg-[#EDE8E0] px-1 rounded">demo1234</code>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-4 p-3 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* メールアドレス */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-primary text-text-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)] placeholder:text-text-muted"
              />
            </div>

            {/* パスワード */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-text-secondary tracking-wide">
                  パスワード
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-accent-warm hover:text-accent-warm-hover transition-colors no-underline"
                >
                  パスワードをお忘れですか？
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
                className="w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-primary text-text-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)] placeholder:text-text-muted"
              />
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-[28px] bg-bg-dark text-text-inverse text-sm font-semibold transition-all duration-300 hover:shadow-[0_12px_40px_rgba(26,23,20,.14)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              {isLoading ? "ログイン中..." : "ログイン →"}
            </button>
          </form>

          {/* 区切り線 */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border-light" />
            <span className="text-xs text-text-muted">または</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>

          {/* Googleログイン（未実装） */}
          <button
            disabled
            className="w-full py-3 rounded-[28px] border border-border-medium bg-transparent text-text-muted text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.92A8.78 8.78 0 0017.64 9.2z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A8.99 8.99 0 009 18z" fill="#34A853"/>
              <path d="M3.96 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A8.99 8.99 0 000 9c0 1.45.35 2.82.96 4.04l3-2.33z" fill="#FBBC05"/>
              <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.99 8.99 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Googleでログイン（準備中）
          </button>
        </div>

        {/* サインアップリンク */}
        <p className="text-center text-sm text-text-secondary mt-6">
          アカウントをお持ちでないですか？{" "}
          <Link
            href="/signup"
            className="text-accent-warm font-semibold hover:text-accent-warm-hover transition-colors no-underline"
          >
            無料で登録
          </Link>
        </p>
      </div>
    </div>
  );
}
