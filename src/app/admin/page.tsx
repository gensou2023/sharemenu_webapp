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
  gallery?: {
    total_shared: number;
    total_likes: number;
    total_saves: number;
    pending_reports: number;
  };
  profile_completion_rate?: number;
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3">
          <RecentSessionsTable sessions={stats.recentSessions} />
        </div>
        <div className="lg:col-span-2">
          <ApiHealthIndicator {...stats.apiHealth} />
        </div>
      </div>

      {/* ギャラリー統計 + プロフィール設定率 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <div className="bg-bg-secondary rounded-[12px] border border-border-light p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Gallery Stats</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "公開画像", value: stats.gallery?.total_shared ?? 0, color: "text-text-primary" },
                { label: "いいね", value: stats.gallery?.total_likes ?? 0, color: "text-accent-warm" },
                { label: "保存", value: stats.gallery?.total_saves ?? 0, color: "text-accent-gold" },
                {
                  label: "未対応通報",
                  value: stats.gallery?.pending_reports ?? 0,
                  color: (stats.gallery?.pending_reports ?? 0) > 0 ? "text-red-600" : "text-accent-olive",
                },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className={`text-xl font-bold font-[family-name:var(--font-playfair)] ${item.color}`}>
                    {item.value}
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
            {(stats.gallery?.pending_reports ?? 0) > 0 && (
              <a href="/admin/moderation" className="inline-block mt-3 text-xs text-red-600 font-semibold hover:underline no-underline">
                モデレーション画面へ →
              </a>
            )}
            {(stats.gallery?.pending_reports ?? 0) === 0 && (
              <div className="mt-3 text-xs text-accent-olive font-medium">通報なし</div>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-bg-secondary rounded-[12px] border border-border-light p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Profile Completion</h3>
            <div className="text-2xl font-bold font-[family-name:var(--font-playfair)] mb-2">
              {stats.profile_completion_rate ?? 0}%
            </div>
            <div className="h-3 bg-border-light rounded-full overflow-hidden relative">
              <div
                className="h-full bg-accent-olive rounded-full transition-all duration-500"
                style={{ width: `${stats.profile_completion_rate ?? 0}%` }}
              />
              {/* 目標60%マーカー */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-accent-warm/60" style={{ left: "60%" }} />
            </div>
            <div className="flex justify-between text-[11px] text-text-muted mt-1">
              <span>プロフィール設定率</span>
              <span>目標: 60%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
