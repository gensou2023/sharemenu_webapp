"use client";

import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthFooterLink from "@/components/auth/AuthFooterLink";

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
          <AuthInput
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
          />

          <button
            type="submit"
            className="w-full py-3.5 rounded-[28px] bg-bg-dark text-text-inverse text-sm font-semibold transition-all duration-300 hover:shadow-[0_12px_40px_rgba(26,23,20,.14)] hover:-translate-y-0.5 mt-2 cursor-pointer"
          >
            リセットリンクを送信 →
          </button>
        </form>
      ) : (
        <div className="text-center py-4">
          <div className="text-4xl mb-4">🔧</div>
          <p className="text-text-secondary text-sm mb-4">
            パスワードリセット機能は現在準備中です。
          </p>
          <p className="text-text-muted text-xs mb-2">
            お手数ですが、パスワードの再設定が必要な場合は管理者にお問い合わせください。
          </p>
          <p className="text-text-muted text-xs">
            連絡先: support@menucraft.jp
          </p>
        </div>
      )}

      <AuthFooterLink
        text=""
        href="/login"
        linkText="← ログインに戻る"
      />
    </AuthLayout>
  );
}
