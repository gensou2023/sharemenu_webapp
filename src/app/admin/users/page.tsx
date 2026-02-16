"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminUserSummary } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);

    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>

      {/* 検索バー */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="名前・メールアドレスで検索..."
          className="flex-1 max-w-md px-4 py-2.5 rounded-[8px] border border-border-light bg-bg-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)]"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-[8px] bg-accent-warm text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-accent-warm-hover"
        >
          検索
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-[8px] border border-border-light text-text-secondary text-sm cursor-pointer hover:bg-bg-primary transition-colors"
          >
            クリア
          </button>
        )}
      </form>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-border-light rounded-[8px] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="bg-bg-secondary rounded-[12px] border border-border-light overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">
                    名前
                  </th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">
                    メール
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">
                    ロール
                  </th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">
                    セッション
                  </th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">
                    画像
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-text-muted"
                    >
                      ユーザーが見つかりません
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border-light last:border-none hover:bg-bg-primary transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-accent-warm no-underline hover:underline"
                        >
                          {u.name || "—"}
                        </Link>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-text-muted">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            u.role === "admin"
                              ? "bg-accent-gold/20 text-accent-gold"
                              : "bg-border-light text-text-secondary"
                          }`}
                        >
                          {u.role === "admin" ? "管理者" : "ユーザー"}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-text-muted">
                        {new Date(u.created_at).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-text-muted">
                        {u.sessionCount}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-text-muted">
                        {u.imageCount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            u.deleted_at
                              ? "bg-red-100 text-red-600"
                              : "bg-accent-olive/20 text-accent-olive"
                          }`}
                        >
                          {u.deleted_at ? "停止" : "有効"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
