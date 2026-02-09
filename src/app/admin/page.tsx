"use client";

import { useState, useEffect } from "react";

type AdminStats = {
  totalUsers: number;
  totalSessions: number;
  totalImages: number;
  monthlyImages: number;
  recentApiCalls: number;
  recentApiErrors: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "総ユーザー数", value: stats?.totalUsers, color: "text-accent-warm" },
    { label: "総セッション数", value: stats?.totalSessions, color: "text-accent-olive" },
    { label: "総生成画像", value: stats?.totalImages, color: "text-accent-warm" },
    { label: "今月の生成", value: stats?.monthlyImages, color: "text-accent-olive" },
    { label: "API呼び出し (30日)", value: stats?.recentApiCalls, color: "text-text-primary" },
    { label: "APIエラー (30日)", value: stats?.recentApiErrors, color: "text-red-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">管理ダッシュボード</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-secondary rounded-[12px] p-5 border border-border-light"
          >
            <div className="text-xs text-text-muted uppercase tracking-[1px] mb-2">
              {card.label}
            </div>
            <div className={`text-3xl font-bold ${card.color}`}>
              {loading ? (
                <div className="w-10 h-8 bg-border-light rounded animate-pulse" />
              ) : (
                card.value ?? "—"
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
