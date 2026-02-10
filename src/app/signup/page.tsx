"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setIsLoading(true);
    setError("");

    try {
      // 1. ユーザー登録API呼び出し
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: shopName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登録に失敗しました。");
        setIsLoading(false);
        return;
      }

      // 2. 登録成功 → 自動ログイン
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // 登録は成功したがログインに失敗（稀なケース）
        setError("アカウントは作成されました。ログインページからログインしてください。");
        setIsLoading(false);
        return;
      }

      // 3. ダッシュボードへリダイレクト
      window.location.href = "/dashboard";
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setIsLoading(false);
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
            無料で始めましょう
          </h1>
          <p className="text-text-secondary text-sm text-center mb-8">
            30秒で登録完了。クレジットカード不要です。
          </p>

          {/* エラー表示 */}
          {error && (
            <div className="mb-4 p-3 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 店舗名 */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide">
                店舗名
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="さくらカフェ"
                required
                className="w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-primary text-text-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)] placeholder:text-text-muted"
              />
            </div>

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
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上で設定"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-primary text-text-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)] placeholder:text-text-muted"
              />
              <p className="text-xs text-text-muted mt-1.5">
                英数字を含む8文字以上
              </p>
            </div>

            {/* 利用規約同意 */}
            <label className="flex items-start gap-2.5 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-accent-warm cursor-pointer"
              />
              <span className="text-xs text-text-secondary leading-relaxed">
                <Link href="/terms" className="text-accent-warm no-underline hover:text-accent-warm-hover">利用規約</Link>
                {" "}と{" "}
                <Link href="/privacy" className="text-accent-warm no-underline hover:text-accent-warm-hover">プライバシーポリシー</Link>
                {" "}に同意します
              </span>
            </label>

            {/* 登録ボタン */}
            <button
              type="submit"
              disabled={isLoading || !agreed}
              className="w-full py-3.5 rounded-[28px] bg-accent-warm text-white text-sm font-semibold transition-all duration-300 hover:bg-accent-warm-hover hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-1 cursor-pointer"
            >
              {isLoading ? "登録中..." : "無料アカウントを作成 →"}
            </button>
          </form>

          {/* OAuth連携（Google等）はPhase 3で実装予定 */}
        </div>

        {/* ログインリンク */}
        <p className="text-center text-sm text-text-secondary mt-6">
          すでにアカウントをお持ちですか？{" "}
          <Link
            href="/login"
            className="text-accent-warm font-semibold hover:text-accent-warm-hover transition-colors no-underline"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
