"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setIsLoading(true);
    // デモ版のため、登録完了メッセージを表示してからログインページへ誘導
    setTimeout(() => {
      setIsLoading(false);
      setShowDemoNotice(true);
    }, 800);
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

          {/* デモ版通知 */}
          {showDemoNotice && (
            <div className="mb-6 p-4 rounded-[12px] bg-[rgba(196,113,59,.08)] border border-[rgba(196,113,59,.2)]">
              <div className="text-sm font-semibold text-accent-warm mb-1">📋 デモ版のお知らせ</div>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                現在デモ版のため、新規アカウント登録は受け付けておりません。以下のデモアカウントでログインしてお試しください。
              </p>
              <div className="text-xs text-text-secondary mb-3">
                Email: <code className="bg-[#EDE8E0] px-1 rounded">demo@menucraft.jp</code><br/>
                Pass: <code className="bg-[#EDE8E0] px-1 rounded">demo1234</code>
              </div>
              <Link
                href="/login"
                className="inline-block px-5 py-2 rounded-[28px] bg-accent-warm text-white text-xs font-semibold no-underline transition-all duration-300 hover:bg-accent-warm-hover"
              >
                ログインページへ →
              </Link>
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

          {/* 区切り線 */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border-light" />
            <span className="text-xs text-text-muted">または</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>

          {/* Googleログイン */}
          <button className="w-full py-3 rounded-[28px] border border-border-medium bg-transparent text-text-primary text-sm font-medium transition-all duration-300 hover:border-text-primary flex items-center justify-center gap-2 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.92A8.78 8.78 0 0017.64 9.2z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A8.99 8.99 0 009 18z" fill="#34A853"/>
              <path d="M3.96 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A8.99 8.99 0 000 9c0 1.45.35 2.82.96 4.04l3-2.33z" fill="#FBBC05"/>
              <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.99 8.99 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Googleで登録
          </button>
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
