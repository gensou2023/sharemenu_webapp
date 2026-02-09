"use client";

import { useState, useEffect } from "react";

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

export default function AdminApiLogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/api-logs")
      .then((r) => r.json())
      .then((data) => setLogs(data.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">API利用ログ</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-border-light rounded-[8px] animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <div className="text-5xl mb-4">📈</div>
          <p className="text-sm">まだAPIログがありません</p>
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
                <tr key={log.id} className="border-b border-border-light last:border-none hover:bg-bg-primary transition-colors">
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
    </div>
  );
}
