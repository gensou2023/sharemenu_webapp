"use client";

import Link from "next/link";
import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: パスワードリセットメール送信API連携
    setSubmitted(true);
  };

  return (
    <AuthLayout
      title={submitted ? "メールを送信しました" : "パスワードをリセット"}
      subtitle={submitted ? undefined : "登録メールアドレスにリセットリンクをお送りします"}
    >
      {!submitted ? (
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
      ) : (
        <div className="text-center py-4">
          <div className="text-4xl mb-4">✉️</div>
          <p className="text-text-secondary text-sm mb-6">
            <strong>{email}</strong> にパスワードリセットのリンクを送信しました。メールをご確認ください。
          </p>
          <p className="text-text-muted text-xs">
            ※ 現在デモ版のため、実際のメール送信は行われません
          </p>
        </div>
      )}

      <p className="text-center text-sm text-text-secondary mt-6">
        <Link
          href="/login"
          className="text-accent-warm font-semibold hover:text-accent-warm-hover transition-colors no-underline"
        >
          ← ログインに戻る
        </Link>
      </p>
    </AuthLayout>
  );
}
