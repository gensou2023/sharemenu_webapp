"use client";

import { useState, useEffect } from "react";

type AdminSession = {
  id: string;
  title: string;
  status: string;
  shop_name: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  users: { email: string; name: string };
  imageCount: number;
  messageCount: number;
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/sessions?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">セッション一覧</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-border-light rounded-[8px] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="bg-bg-secondary rounded-[12px] border border-border-light overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">店名 / タイトル</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">ユーザー</th>
                  <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">ステータス</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">メッセージ</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">画像</th>
                  <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">更新日</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-border-light last:border-none hover:bg-bg-primary transition-colors">
                    <td className="px-4 py-3 font-medium">{s.shop_name || s.title}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-text-muted">{s.users?.name || s.users?.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        s.status === "completed"
                          ? "bg-accent-olive/20 text-accent-olive"
                          : "bg-accent-warm/20 text-accent-warm"
                      }`}>
                        {s.status === "completed" ? "完了" : "進行中"}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-text-muted">{s.messageCount}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-text-muted">{s.imageCount}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(s.updated_at).toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-[8px] border border-border-light disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <span className="px-4 py-2 text-sm text-text-muted">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm rounded-[8px] border border-border-light disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
