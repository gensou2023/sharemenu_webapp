"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthErrorMessage from "@/components/auth/AuthErrorMessage";
import AuthFooterLink from "@/components/auth/AuthFooterLink";

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

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("アカウントは作成されました。ログインページからログインしてください。");
        setIsLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="無料で始めましょう" subtitle="30秒で登録完了。クレジットカード不要です。">
      {error && <AuthErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="店舗名"
          type="text"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="さくらカフェ"
          required
        />

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
          placeholder="8文字以上で設定"
          required
          minLength={8}
          helperText="英数字を含む8文字以上"
        />

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

        <button
          type="submit"
          disabled={isLoading || !agreed}
          className="w-full py-3.5 rounded-[28px] bg-accent-warm text-white text-sm font-semibold transition-all duration-300 hover:bg-accent-warm-hover hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-1 cursor-pointer"
        >
          {isLoading ? "登録中..." : "無料アカウントを作成 →"}
        </button>
      </form>

      <AuthFooterLink
        text="すでにアカウントをお持ちですか？"
        href="/login"
        linkText="ログイン"
      />
    </AuthLayout>
  );
}
