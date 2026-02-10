"use client";

import { useState, useEffect } from "react";
import KpiCard from "@/components/admin/KpiCard";
import TrendChart from "@/components/admin/TrendChart";
import CompletionDonut from "@/components/admin/CompletionDonut";
import RecentSessionsTable from "@/components/admin/RecentSessionsTable";
import ApiHealthIndicator from "@/components/admin/ApiHealthIndicator";

// --- 型定義（API レスポンス） ---

type KpiMetric = {
  current: number;
  previous: number;
  changePercent: number;
  sparkline: number[];
};

type DailyDataPoint = {
  date: string;
  users: number;
  sessions: number;
  images: number;
};

type RecentSession = {
  id: string;
  shop_name: string | null;
  title: string;
  status: string;
  user_name: string;
  created_at: string;
  imageCount: number;
};

type AdminDashboardStats = {
  kpi: {
    totalUsers: KpiMetric;
    totalSessions: KpiMetric;
    totalImages: KpiMetric;
    completionRate: KpiMetric;
  };
  timeseries: DailyDataPoint[];
  completion: {
    completed: number;
    active: number;
  };
  recentSessions: RecentSession[];
  apiHealth: {
    totalCalls: number;
    successRate: number;
    avgResponseMs: number;
    errorCount: number;
  };
};

// --- KPI カード設定 ---

function getKpiCards(stats: AdminDashboardStats) {
  return [
    {
      label: "総ユーザー数",
      value: stats.kpi.totalUsers.current,
      changePercent: stats.kpi.totalUsers.changePercent,
      sparklineData: stats.kpi.totalUsers.sparkline,
      accentColor: "text-accent-warm",
      chartColor: "#C4713B",
    },
    {
      label: "総セッション数",
      value: stats.kpi.totalSessions.current,
      changePercent: stats.kpi.totalSessions.changePercent,
      sparklineData: stats.kpi.totalSessions.sparkline,
      accentColor: "text-accent-olive",
      chartColor: "#7B8A64",
    },
    {
      label: "生成画像数",
      value: stats.kpi.totalImages.current,
      changePercent: stats.kpi.totalImages.changePercent,
      sparklineData: stats.kpi.totalImages.sparkline,
      accentColor: "text-accent-gold",
      chartColor: "#D4A853",
    },
    {
      label: "完了率",
      value: stats.kpi.completionRate.current,
      changePercent: stats.kpi.completionRate.changePercent,
      sparklineData: stats.kpi.completionRate.sparkline,
      accentColor: "text-accent-olive",
      chartColor: "#7B8A64",
      suffix: "%",
    },
  ];
}

// --- メインコンポーネント ---

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLastUpdated(
          new Date().toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
        </div>

        {/* KPI スケルトン */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[110px] bg-border-light rounded-[12px] animate-pulse"
            />
          ))}
        </div>

        {/* チャートスケルトン */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          <div className="lg:col-span-3 h-[340px] bg-border-light rounded-[12px] animate-pulse" />
          <div className="lg:col-span-2 h-[340px] bg-border-light rounded-[12px] animate-pulse" />
        </div>

        {/* ボトムスケルトン */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 h-[260px] bg-border-light rounded-[12px] animate-pulse" />
          <div className="lg:col-span-2 h-[260px] bg-border-light rounded-[12px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-text-muted">データの取得に失敗しました</p>
      </div>
    );
  }

  const kpiCards = getKpiCards(stats);

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
        {lastUpdated && (
          <span className="text-xs text-text-muted">
            最終更新: {lastUpdated}
          </span>
        )}
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* チャートエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3">
          <TrendChart data={stats.timeseries} />
        </div>
        <div className="lg:col-span-2">
          <CompletionDonut
            completed={stats.completion.completed}
            active={stats.completion.active}
          />
        </div>
      </div>

      {/* ボトムエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <RecentSessionsTable sessions={stats.recentSessions} />
        </div>
        <div className="lg:col-span-2">
          <ApiHealthIndicator {...stats.apiHealth} />
        </div>
      </div>
    </div>
  );
}
