"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import KpiCard from "@/components/admin/KpiCard";
import TrendChart from "@/components/admin/TrendChart";
import CompletionDonut from "@/components/admin/CompletionDonut";

type RevenueData = {
  plan_distribution: { free: number; pro: number; total: number };
  estimated_mrr: number;
  conversion: {
    signup_30d: number;
    active_users_30d: number;
    activation_rate: number;
    profile_completion_rate: number;
    power_users: number;
  };
  limit_hits: {
    session_limit_hit_users: number;
    image_limit_hit_users: number;
  };
  daily_signups: { date: string; count: number }[];
  daily_active: { date: string; count: number }[];
  retention: { week1: number; week2: number; week4: number };
  upgrade_candidates: {
    id: string;
    name: string;
    email: string;
    sessions_this_month: number;
    total_images: number;
    created_at: string;
  }[];
};

function RetentionBar({ label, value }: { label: string; value: number }) {
  const color = value >= 50 ? "bg-accent-olive" : value >= 30 ? "bg-accent-gold" : "bg-accent-warm";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-border-light rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-24 text-right shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-border-light rounded-full overflow-hidden">
        <div className="h-full bg-accent-warm/60 rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right">{value}</span>
    </div>
  );
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-[960px]">
        <div className="mb-8">
          <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-2">Revenue</span>
          <h1 className="text-2xl font-bold">売上管理</h1>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-bg-secondary rounded-[12px] border border-border-light animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  // TrendChart用にデータ変換
  const trendData = data.daily_signups.map((d, i) => ({
    date: d.date,
    users: d.count,
    sessions: data.daily_active[i]?.count || 0,
    images: 0,
  }));

  const limitTotal = data.limit_hits.session_limit_hit_users + data.limit_hits.image_limit_hit_users;

  return (
    <div className="max-w-[960px]">
      {/* ヘッダー */}
      <div className="mb-8">
        <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-2">
          Revenue
        </span>
        <h1 className="text-2xl font-bold">売上管理</h1>
        <p className="text-sm text-text-secondary mt-1">プラン分布・転換指標・リテンション</p>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="推定MRR"
          value={data.estimated_mrr}
          suffix="円"
          accentColor="text-accent-warm"
          chartColor="#C4713B"
          changePercent={0}
          sparklineData={[]}
        />
        <div className="bg-bg-secondary rounded-[12px] border border-border-light p-4 flex flex-col items-center justify-center">
          <div className="text-xs text-text-muted mb-1">Free / Pro</div>
          <CompletionDonut completed={data.plan_distribution.pro} active={data.plan_distribution.free} />
        </div>
        <KpiCard
          label="アクティブ率"
          value={data.conversion.activation_rate}
          suffix="%"
          changePercent={0}
          accentColor="text-accent-olive"
          chartColor="#7B8A64"
          sparklineData={[]}
        />
        <KpiCard
          label="制限到達者"
          value={limitTotal}
          suffix="人"
          changePercent={0}
          accentColor="text-accent-gold"
          chartColor="#D4A853"
          sparklineData={[]}
        />
      </div>

      {/* トレンドチャート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-bg-secondary rounded-[12px] border border-border-light p-4">
          <div className="text-xs text-text-muted mb-3 uppercase tracking-wider">新規登録・アクティブ 30日トレンド</div>
          <TrendChart data={trendData} />
        </div>

        {/* 転換ファネル + リテンション */}
        <div className="space-y-6">
          {/* ファネル */}
          <div className="bg-bg-secondary rounded-[12px] border border-border-light p-4">
            <div className="text-xs text-text-muted mb-3 uppercase tracking-wider">転換ファネル</div>
            <div className="space-y-3">
              <FunnelBar label="登録（30日）" value={data.conversion.signup_30d} max={data.conversion.signup_30d} />
              <FunnelBar label="アクティブ" value={data.conversion.active_users_30d} max={data.conversion.signup_30d} />
              <FunnelBar label="Power User" value={data.conversion.power_users} max={data.conversion.signup_30d} />
            </div>
            <div className="mt-3 text-[11px] text-text-muted">
              プロフィール設定率: {data.conversion.profile_completion_rate}%
            </div>
          </div>

          {/* リテンション */}
          <div className="bg-bg-secondary rounded-[12px] border border-border-light p-4">
            <div className="text-xs text-text-muted mb-3 uppercase tracking-wider">リテンション</div>
            <div className="space-y-3">
              <RetentionBar label="1週間後" value={data.retention.week1} />
              <RetentionBar label="2週間後" value={data.retention.week2} />
              <RetentionBar label="4週間後" value={data.retention.week4} />
            </div>
          </div>
        </div>
      </div>

      {/* Pro転換候補テーブル */}
      <div className="bg-bg-secondary rounded-[12px] border border-border-light overflow-x-auto">
        <div className="px-4 py-3 border-b border-border-light">
          <div className="text-xs text-text-muted uppercase tracking-wider">Pro転換候補</div>
          <p className="text-[11px] text-text-muted mt-0.5">
            セッション上限に達したアクティブユーザー（Stripe連携後、招待メール送信可能になります）
          </p>
        </div>

        {data.upgrade_candidates.length === 0 ? (
          <div className="text-center py-8 text-sm text-text-muted">該当するユーザーはいません</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">Name</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">Email</th>
                <th className="text-right px-4 py-3 text-xs text-text-muted uppercase tracking-wider">Sessions</th>
                <th className="text-right px-4 py-3 text-xs text-text-muted uppercase tracking-wider">Images</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider">登録日</th>
              </tr>
            </thead>
            <tbody>
              {data.upgrade_candidates.map((user) => (
                <tr key={user.id} className="border-b border-border-light last:border-none hover:bg-bg-primary transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${user.id}`} className="text-accent-warm hover:underline no-underline font-medium">
                      {user.name}
                    </Link>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-text-secondary">{user.email}</td>
                  <td className="px-4 py-3 text-right font-semibold">{user.sessions_this_month}</td>
                  <td className="px-4 py-3 text-right">{user.total_images}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-text-muted text-xs">
                    {new Date(user.created_at).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
