"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import PasswordChangeForm from "@/components/settings/PasswordChangeForm";

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
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

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

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/login" });
      } else {
        const data = await res.json();
        setError(data.error || "退会処理に失敗しました。");
        setShowWithdrawModal(false);
      }
    } catch {
      setError("通信エラーが発生しました。");
      setShowWithdrawModal(false);
    } finally {
      setWithdrawing(false);
    }
  };

  const planLabel = "Free（無料プラン）";

  return (
    <AppLayout>
      <main className="min-h-full relative overflow-hidden">
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
              <section id="profile" className="scroll-mt-[72px]">
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
              </section>

              {/* プラン情報 */}
              <section id="plan" className="scroll-mt-[72px]">
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
              </section>

              {/* パスワード変更 */}
              <section id="security" className="scroll-mt-[72px]">
                <div className="bg-bg-secondary rounded-[20px] border border-border-light p-6 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-olive via-accent-warm to-transparent" />
                  <h2 className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-5">
                    セキュリティ
                  </h2>

                  <PasswordChangeForm />
                </div>
              </section>

              {/* 退会 */}
              <section id="danger" className="scroll-mt-[72px]">
                <div className="bg-bg-secondary rounded-[20px] border border-red-200 p-6 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-400 via-red-300 to-transparent" />
                  <h2 className="text-[11px] font-semibold text-red-500 uppercase tracking-[1px] mb-5">
                    退会
                  </h2>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[15px] mb-1">
                        アカウントを削除
                      </div>
                      <div className="text-xs text-text-secondary">
                        退会すると、ログインできなくなります
                      </div>
                    </div>
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="px-5 py-2.5 rounded-[28px] bg-red-500 text-white text-[13px] font-semibold transition-all duration-300 hover:bg-red-600 cursor-pointer"
                    >
                      退会する
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* 退会確認モーダル */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-bg-secondary rounded-[16px] border border-border-light p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-2">退会の確認</h3>
            <p className="text-sm text-text-secondary mb-1">
              本当に退会しますか？
            </p>
            <p className="text-sm text-red-500 mb-4">
              退会するとログインできなくなります。この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                disabled={withdrawing}
                className="px-4 py-2 rounded-[8px] border border-border-light text-sm cursor-pointer hover:bg-bg-primary transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="px-4 py-2 rounded-[8px] bg-red-500 text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawing ? "処理中..." : "退会する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
