"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { AdminUserDetail } from "@/lib/types";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suspending, setSuspending] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUser(data.user);
        }
      })
      .catch(() => setError("データの取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSuspend = async () => {
    setSuspending(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suspend" }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) =>
          prev ? { ...prev, deleted_at: new Date().toISOString() } : null
        );
        setShowSuspendModal(false);
      } else {
        setError(data.error || "停止に失敗しました。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setSuspending(false);
    }
  };

  const handleRestore = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, deleted_at: null } : null));
      } else {
        setError(data.error || "復元に失敗しました。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-border-light rounded-[12px] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error && !user) {
    return (
      <div>
        <Link
          href="/admin/users"
          className="text-sm text-accent-warm no-underline hover:underline mb-4 inline-block"
        >
          &larr; ユーザー管理に戻る
        </Link>
        <div className="p-4 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      {/* パンくず */}
      <Link
        href="/admin/users"
        className="text-sm text-accent-warm no-underline hover:underline mb-6 inline-block"
      >
        &larr; ユーザー管理に戻る
      </Link>

      {error && (
        <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
          {error}
        </div>
      )}

      {/* プロフィールカード */}
      <div className="bg-bg-secondary rounded-[12px] border border-border-light p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-warm via-accent-gold to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{user.name || "—"}</h1>
            <p className="text-text-muted text-sm mb-3">{user.email}</p>
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  user.role === "admin"
                    ? "bg-accent-gold/20 text-accent-gold"
                    : "bg-border-light text-text-secondary"
                }`}
              >
                {user.role === "admin" ? "管理者" : "ユーザー"}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  user.deleted_at
                    ? "bg-red-100 text-red-600"
                    : "bg-accent-olive/20 text-accent-olive"
                }`}
              >
                {user.deleted_at ? "停止" : "有効"}
              </span>
            </div>
            <div className="mt-3 text-xs text-text-muted space-y-1">
              <div>
                登録日:{" "}
                {new Date(user.created_at).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {user.stats.lastActiveAt && (
                <div>
                  最終アクティビティ:{" "}
                  {new Date(user.stats.lastActiveAt).toLocaleDateString(
                    "ja-JP",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </div>
              )}
            </div>
          </div>
          {/* 停止/復元ボタン — admin/自分自身は非表示 */}
          {user.role !== "admin" && (
            <div>
              {user.deleted_at ? (
                <button
                  onClick={handleRestore}
                  className="px-4 py-2 rounded-[8px] bg-accent-olive text-white text-sm font-semibold cursor-pointer transition-colors hover:opacity-80"
                >
                  復元する
                </button>
              ) : (
                <button
                  onClick={() => setShowSuspendModal(true)}
                  className="px-4 py-2 rounded-[8px] bg-red-500 text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-red-600"
                >
                  アカウント停止
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 統計カード4枚 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "セッション数", value: user.stats.totalSessions },
          { label: "画像数", value: user.stats.totalImages },
          {
            label: "完了率",
            value: `${Math.round(user.stats.completionRate * 100)}%`,
          },
          { label: "API呼び出し数", value: user.stats.totalApiCalls },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-secondary rounded-[12px] border border-border-light p-4 text-center"
          >
            <div className="text-2xl font-bold text-text-primary">
              {stat.value}
            </div>
            <div className="text-xs text-text-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* セッション履歴テーブル */}
      <div className="bg-bg-secondary rounded-[12px] border border-border-light overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-border-light">
          <h2 className="text-sm font-semibold">セッション履歴（直近10件）</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left px-4 py-2.5 text-xs text-text-muted uppercase tracking-wider">
                タイトル
              </th>
              <th className="text-left px-4 py-2.5 text-xs text-text-muted uppercase tracking-wider">
                ステータス
              </th>
              <th className="text-left px-4 py-2.5 text-xs text-text-muted uppercase tracking-wider">
                メッセージ
              </th>
              <th className="text-left px-4 py-2.5 text-xs text-text-muted uppercase tracking-wider">
                画像
              </th>
              <th className="text-left px-4 py-2.5 text-xs text-text-muted uppercase tracking-wider">
                日時
              </th>
            </tr>
          </thead>
          <tbody>
            {user.recentSessions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-text-muted"
                >
                  セッションがありません
                </td>
              </tr>
            ) : (
              user.recentSessions.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border-light last:border-none hover:bg-bg-primary transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium">
                    {s.shop_name || s.title}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        s.status === "completed"
                          ? "bg-accent-olive/20 text-accent-olive"
                          : "bg-accent-warm/20 text-accent-warm"
                      }`}
                    >
                      {s.status === "completed" ? "完了" : "進行中"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-text-muted">
                    {s.messageCount}
                  </td>
                  <td className="px-4 py-2.5 text-text-muted">
                    {s.imageCount}
                  </td>
                  <td className="px-4 py-2.5 text-text-muted">
                    {new Date(s.updated_at).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 生成画像ギャラリー */}
      <div className="bg-bg-secondary rounded-[12px] border border-border-light overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-border-light">
          <h2 className="text-sm font-semibold">生成画像（直近12枚）</h2>
        </div>
        {user.recentImages.length === 0 ? (
          <div className="px-4 py-6 text-center text-text-muted text-sm">
            生成画像がありません
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 p-4">
            {user.recentImages.map((img) => (
              <div
                key={img.id}
                className="aspect-square bg-bg-primary rounded-[8px] border border-border-light overflow-hidden relative group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/generated/${img.storage_path}`}
                  alt={img.prompt || "生成画像"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <div className="text-white text-[10px] line-clamp-2">
                    {img.prompt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 停止確認モーダル */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary rounded-[16px] border border-border-light p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-2">アカウント停止の確認</h3>
            <p className="text-sm text-text-secondary mb-4">
              <strong>{user.name}</strong>（{user.email}
              ）のアカウントを停止しますか？
              <br />
              停止するとこのユーザーはログインできなくなります。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 rounded-[8px] border border-border-light text-sm cursor-pointer hover:bg-bg-primary transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSuspend}
                disabled={suspending}
                className="px-4 py-2 rounded-[8px] bg-red-500 text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suspending ? "処理中..." : "停止する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
