"use client";

import { useState, useEffect } from "react";
import Header from "@/components/landing/Header";
import Link from "next/link";

type UserData = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      try {
        const res = await fetch("/api/account");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setName(data.user.name || "");
        }
      } catch {
        setError("アカウント情報の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    }
    fetchAccount();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "更新しました。");
        setUser((prev) => (prev ? { ...prev, name } : null));
      } else {
        setError(data.error || "更新に失敗しました。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  const planLabel = "Free（無料プラン）";

  return (
    <>
      <Header activeTab="settings" />
      <main className="mt-[56px] min-h-[calc(100vh-56px)] bg-bg-primary relative overflow-hidden">
        {/* 背景ブラーサークル */}
        <div className="absolute top-[5%] left-[3%] w-72 h-72 bg-accent-warm/[.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] right-[5%] w-56 h-56 bg-accent-gold/[.05] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[10%] left-[12%] w-48 h-48 bg-accent-olive/[.04] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-10 relative z-10">
          {/* ヘッダー */}
          <div className="mb-8 animate-fade-in-up">
            <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-2">
              Account Settings
            </span>
            <h1 className="font-[family-name:var(--font-playfair)] text-[28px] font-bold mb-2">
              アカウント設定
            </h1>
            <p className="text-text-secondary text-sm">
              プロフィールとプランの管理
            </p>
            {/* 装飾ライン */}
            <div className="flex items-center gap-2 mt-3">
              <div className="w-8 h-[2px] bg-accent-warm/30 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-accent-warm/40" />
              <div className="w-8 h-[2px] bg-accent-warm/30 rounded-full" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-bg-secondary rounded-[12px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {message && (
                <div className="p-3 rounded-[8px] bg-accent-olive/10 border border-accent-olive/20 text-accent-olive text-sm animate-fade-in-up">
                  {message}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in-up">
                  {error}
                </div>
              )}

              {/* プロフィール情報 */}
              <div className="bg-bg-secondary rounded-[20px] border border-border-light p-6 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-warm via-accent-gold to-transparent" />
                <h2 className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-5">
                  プロフィール
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      店舗名 / ユーザー名
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-primary text-text-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className="w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-tag text-text-muted text-sm outline-none cursor-not-allowed"
                    />
                    <p className="text-[11px] text-text-muted mt-1">
                      メールアドレスの変更はサポートまでお問い合わせください
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      登録日
                    </label>
                    <div className="text-sm text-text-primary">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "—"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || name === user?.name}
                  className="mt-6 px-6 py-3 rounded-[28px] bg-accent-warm text-white text-sm font-semibold transition-all duration-300 hover:bg-accent-warm-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? "保存中..." : "変更を保存"}
                </button>
              </div>

              {/* プラン情報 */}
              <div className="bg-bg-secondary rounded-[20px] border border-border-light p-6 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-gold via-accent-olive to-transparent" />
                <h2 className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-5">
                  プラン
                </h2>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[15px] mb-1">
                      {planLabel}
                    </div>
                    <div className="text-xs text-text-secondary">
                      月3セッションまで · 基本テンプレート
                    </div>
                  </div>
                  <Link
                    href="/#pricing"
                    className="px-5 py-2.5 rounded-[28px] border border-accent-warm text-accent-warm text-[13px] font-semibold no-underline transition-all duration-300 hover:bg-accent-warm hover:text-white"
                  >
                    プランを変更
                  </Link>
                </div>
              </div>

              {/* パスワード変更 */}
              <div className="bg-bg-secondary rounded-[20px] border border-border-light p-6 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-olive via-accent-warm to-transparent" />
                <h2 className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-5">
                  セキュリティ
                </h2>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[15px] mb-1">
                      パスワード
                    </div>
                    <div className="text-xs text-text-secondary">
                      パスワードを変更できます
                    </div>
                  </div>
                  <button
                    disabled
                    className="px-5 py-2.5 rounded-[28px] border border-border-medium text-text-secondary text-[13px] font-semibold transition-all duration-300 cursor-not-allowed opacity-50"
                  >
                    準備中
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
