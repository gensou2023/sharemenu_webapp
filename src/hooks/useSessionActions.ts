"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionData, StatsData } from "./useDashboardData";

async function downloadImages(urls: string[], shopName: string | null) {
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i]);
      const blob = await res.blob();
      const ext = blob.type.includes("png") ? "png" : "jpg";
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${shopName || "menucraft"}-${i + 1}.${ext}`;
      link.click();
      URL.revokeObjectURL(link.href);
      if (i < urls.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch {
      // 個別のダウンロード失敗は無視
    }
  }
}

async function deleteSessionApi(sessionId: string) {
  const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("削除に失敗しました");
}

export function useSessionActions(
  sessions: SessionData[],
  setSessions: React.Dispatch<React.SetStateAction<SessionData[]>>,
  stats: StatsData | null,
  setStats: React.Dispatch<React.SetStateAction<StatsData | null>>
) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SessionData | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);
  const router = useRouter();

  const handleCreateNew = () => {
    router.push("/chat");
  };

  const handleDownload = (item: SessionData) => {
    setDownloading(item.id);
    downloadImages(item.imageUrls, item.shop_name).finally(() =>
      setDownloading(null)
    );
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingSession(true);
    try {
      await deleteSessionApi(deleteTarget.id);
      setSessions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      if (stats) {
        setStats({
          ...stats,
          totalImages: stats.totalImages - deleteTarget.imageCount,
          recentSessions: Math.max(0, stats.recentSessions - 1),
        });
      }
      setDeleteTarget(null);
    } catch {
      alert("削除に失敗しました。もう一度お試しください。");
    } finally {
      setDeletingSession(false);
    }
  };

  return {
    downloading,
    deleteTarget,
    setDeleteTarget,
    deletingSession,
    handleCreateNew,
    handleDownload,
    handleDeleteConfirm,
  };
}
