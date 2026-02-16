"use client";

import { useState, useEffect, useCallback } from "react";

type Report = {
  id: string;
  shared_image_id: string;
  image_url: string;
  image_category: string;
  reporter_email: string;
  uploader_email: string;
  uploader_id: string;
  reason: string;
  detail: string | null;
  created_at: string;
  image_created_at: string;
  like_count: number;
  save_count: number;
};

type Stats = {
  total_reports: number;
  pending_reports: number;
  total_shared_images: number;
};

type Pagination = {
  page: number;
  total_pages: number;
  total_count: number;
};

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  inappropriate: { label: "不適切", color: "bg-red-100 text-red-700" },
  spam: { label: "スパム", color: "bg-orange-100 text-orange-700" },
  other: { label: "その他", color: "bg-gray-100 text-gray-600" },
};

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionTarget, setActionTarget] = useState<{ id: string; action: "remove" | "dismiss" } | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/moderation?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async () => {
    if (!actionTarget) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/moderation/${actionTarget.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionTarget.action }),
      });
      if (res.ok) {
        setActionTarget(null);
        fetchData();
      }
    } catch {
      // silent
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-[960px]">
      {/* ヘッダー */}
      <div className="mb-8">
        <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-2">
          Moderation
        </span>
        <h1 className="text-2xl font-bold">モデレーション</h1>
        <p className="text-sm text-text-secondary mt-1">通報された画像の確認と対応</p>
      </div>

      {/* 統計カード */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "全通報数", value: stats.total_reports, color: "text-text-primary" },
            { label: "未対応", value: stats.pending_reports, color: stats.pending_reports > 0 ? "text-red-600" : "text-accent-olive" },
            { label: "全公開画像数", value: stats.total_shared_images, color: "text-text-primary" },
          ].map((item) => (
            <div key={item.label} className="bg-bg-secondary rounded-[12px] border border-border-light p-4">
              <div className="text-xs text-text-muted mb-1">{item.label}</div>
              <div className={`text-2xl font-bold font-[family-name:var(--font-playfair)] ${item.color}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 通報一覧 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-bg-secondary rounded-[12px] border border-border-light animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-bg-secondary rounded-[12px] border border-border-light">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-text-secondary text-sm">未対応の通報はありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const reasonInfo = REASON_LABELS[report.reason] || REASON_LABELS.other;
            return (
              <div
                key={report.id}
                className="bg-bg-secondary rounded-[12px] border border-border-light p-4 flex gap-4"
              >
                {/* サムネイル */}
                <div className="w-24 h-24 rounded-[8px] bg-border-light overflow-hidden flex-shrink-0">
                  {report.image_url ? (
                    <img
                      src={report.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${reasonInfo.color}`}>
                      {reasonInfo.label}
                    </span>
                    <span className="text-xs text-text-muted">
                      {report.image_category}
                    </span>
                    <span className="text-xs text-text-muted">
                      ♥ {report.like_count} / 保存 {report.save_count}
                    </span>
                  </div>

                  <div className="text-xs text-text-secondary space-y-0.5">
                    <div>通報者: {report.reporter_email}</div>
                    <div>投稿者: {report.uploader_email}</div>
                    {report.detail && (
                      <div className="mt-1 text-text-muted italic">&quot;{report.detail}&quot;</div>
                    )}
                  </div>

                  <div className="text-[11px] text-text-muted mt-2">
                    通報: {new Date(report.created_at).toLocaleString("ja-JP")}
                    {" / "}
                    公開: {new Date(report.image_created_at).toLocaleString("ja-JP")}
                  </div>
                </div>

                {/* アクション */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => setActionTarget({ id: report.id, action: "remove" })}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-[6px] hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    非公開にする
                  </button>
                  <button
                    onClick={() => setActionTarget({ id: report.id, action: "dismiss" })}
                    className="px-3 py-1.5 text-xs font-semibold text-text-secondary bg-bg-primary border border-border-light rounded-[6px] hover:bg-border-light transition-colors cursor-pointer"
                  >
                    問題なし
                  </button>
                </div>
              </div>
            );
          })}
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

      {/* 確認モーダル */}
      {actionTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-bg-primary rounded-[16px] border border-border-light p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-2">
              {actionTarget.action === "remove" ? "画像を非公開にしますか？" : "通報を却下しますか？"}
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              {actionTarget.action === "remove"
                ? "この画像はギャラリーから削除されます。関連するいいね・保存・通報も削除されます。"
                : "この通報を問題なしとして処理します。"}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActionTarget(null)}
                disabled={processing}
                className="px-4 py-2 text-sm rounded-[8px] border border-border-light hover:bg-bg-secondary transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                className={`px-4 py-2 text-sm font-semibold rounded-[8px] text-white transition-colors cursor-pointer ${
                  actionTarget.action === "remove"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-accent-olive hover:bg-accent-olive/90"
                }`}
              >
                {processing ? "処理中..." : actionTarget.action === "remove" ? "非公開にする" : "問題なし"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
