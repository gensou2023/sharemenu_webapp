"use client";

import { useState, useEffect, useCallback } from "react";

type ApiLog = {
  id: string;
  api_type: string;
  model: string;
  status: string;
  duration_ms: number | null;
  tokens_in: number | null;
  tokens_out: number | null;
  error_message: string | null;
  created_at: string;
  user_email: string;
};

type Pagination = {
  page: number;
  total_pages: number;
  total_count: number;
};

type FilterStatus = "all" | "success" | "error";
type FilterApiType = "all" | "chat" | "image_gen";
type FilterPeriod = "24h" | "7d" | "30d" | "all";

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] border transition-colors cursor-pointer ${
        active
          ? "bg-accent-warm text-white border-accent-warm"
          : "bg-bg-primary text-text-secondary border-border-light hover:bg-bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminApiLogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [apiTypeFilter, setApiTypeFilter] = useState<FilterApiType>("all");
  const [periodFilter, setPeriodFilter] = useState<FilterPeriod>("7d");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (apiTypeFilter !== "all") params.set("api_type", apiTypeFilter);

    if (periodFilter !== "all") {
      const now = new Date();
      const ms = periodFilter === "24h" ? 86400000 : periodFilter === "7d" ? 7 * 86400000 : 30 * 86400000;
      params.set("from", new Date(now.getTime() - ms).toISOString());
    }

    try {
      const res = await fetch(`/api/admin/api-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setPagination(data.pagination);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, apiTypeFilter, periodFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // フィルタ変更時はページ1に戻す
  const handleStatusFilter = (v: FilterStatus) => { setStatusFilter(v); setPage(1); };
  const handleApiTypeFilter = (v: FilterApiType) => { setApiTypeFilter(v); setPage(1); };
  const handlePeriodFilter = (v: FilterPeriod) => { setPeriodFilter(v); setPage(1); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">API利用ログ</h1>

      {/* フィルタバー */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-bg-secondary rounded-[12px] border border-border-light p-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted mr-1">ステータス:</span>
          <FilterButton active={statusFilter === "all"} onClick={() => handleStatusFilter("all")}>全て</FilterButton>
          <FilterButton active={statusFilter === "success"} onClick={() => handleStatusFilter("success")}>成功</FilterButton>
          <FilterButton active={statusFilter === "error"} onClick={() => handleStatusFilter("error")}>エラー</FilterButton>
        </div>

        <div className="w-px h-6 bg-border-light" />

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted mr-1">種別:</span>
          <FilterButton active={apiTypeFilter === "all"} onClick={() => handleApiTypeFilter("all")}>全て</FilterButton>
          <FilterButton active={apiTypeFilter === "chat"} onClick={() => handleApiTypeFilter("chat")}>Chat</FilterButton>
          <FilterButton active={apiTypeFilter === "image_gen"} onClick={() => handleApiTypeFilter("image_gen")}>Image</FilterButton>
        </div>

        <div className="w-px h-6 bg-border-light" />

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted mr-1">期間:</span>
          <select
            value={periodFilter}
            onChange={(e) => handlePeriodFilter(e.target.value as FilterPeriod)}
            className="text-xs px-2 py-1.5 rounded-[6px] border border-border-light bg-bg-primary text-text-primary cursor-pointer"
          >
            <option value="24h">過去24時間</option>
            <option value="7d">7日</option>
            <option value="30d">30日</option>
            <option value="all">全期間</option>
          </select>
        </div>

        {pagination && (
          <span className="ml-auto text-xs text-text-muted">
            {pagination.total_count}件
          </span>
        )}
      </div>

      {/* テーブル */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-border-light rounded-[8px] animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <div className="text-5xl mb-4">📈</div>
          <p className="text-sm">該当するログがありません</p>
        </div>
      ) : (
        <div className="bg-bg-secondary rounded-[12px] border border-border-light overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-4 py-3 text-xs text-text-muted uppercase">種別</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted uppercase">モデル</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted uppercase">ステータス</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted uppercase">応答時間</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted uppercase">トークン</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted uppercase">ユーザー</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted uppercase">日時</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className={`border-b border-border-light last:border-none hover:bg-bg-primary transition-colors ${
                    log.status === "error" ? "bg-red-50" : ""
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      log.api_type === "chat"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {log.api_type === "chat" ? "Chat" : "Image"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-text-muted font-mono text-xs">{log.model}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium ${
                      log.status === "success" ? "text-accent-olive" : "text-red-500"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-text-muted">
                    {log.duration_ms ? `${log.duration_ms}ms` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-text-muted text-xs">
                    {log.tokens_in || log.tokens_out
                      ? `${log.tokens_in || 0} / ${log.tokens_out || 0}`
                      : "—"
                    }
                  </td>
                  <td className="px-4 py-2.5 text-text-muted text-xs">{log.user_email}</td>
                  <td className="px-4 py-2.5 text-text-muted text-xs">
                    {new Date(log.created_at).toLocaleString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ページネーション */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm rounded-[8px] border border-border-light bg-bg-secondary hover:bg-bg-primary disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-default"
          >
            前へ
          </button>
          <span className="px-4 py-2 text-sm text-text-muted">
            {page} / {pagination.total_pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
            disabled={page === pagination.total_pages}
            className="px-4 py-2 text-sm rounded-[8px] border border-border-light bg-bg-secondary hover:bg-bg-primary disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-default"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
