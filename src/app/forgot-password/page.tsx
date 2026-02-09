"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: パスワードリセットメール送信API連携
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 20% 50%, rgba(196,113,59,.06), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(212,168,83,.06), transparent 50%)"
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
          {!submitted ? (
            <>
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-center mb-2">
                パスワードをリセット
              </h1>
              <p className="text-text-secondary text-sm text-center mb-8">
                登録メールアドレスにリセットリンクをお送りします
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-[28px] bg-bg-dark text-text-inverse text-sm font-semibold transition-all duration-300 hover:shadow-[0_12px_40px_rgba(26,23,20,.14)] hover:-translate-y-0.5 mt-2 cursor-pointer"
                >
                  リセットリンクを送信 →
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2">
                メールを送信しました
              </h2>
              <p className="text-text-secondary text-sm mb-6">
                <strong>{email}</strong> にパスワードリセットのリンクを送信しました。メールをご確認ください。
              </p>
              <p className="text-text-muted text-xs">
                ※ 現在デモ版のため、実際のメール送信は行われません
              </p>
            </div>
          )}
        </div>

        {/* 戻るリンク */}
        <p className="text-center text-sm text-text-secondary mt-6">
          <Link
            href="/login"
            className="text-accent-warm font-semibold hover:text-accent-warm-hover transition-colors no-underline"
          >
            ← ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
