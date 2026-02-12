"use client";

import { useState, useEffect } from "react";

type SessionData = {
  id: string;
  title: string;
  status: "active" | "completed";
  shop_name: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  imageCount: number;
  thumbnailUrl: string | null;
  imageUrls: string[];
  imageIds: string[];
};

type StatsData = {
  totalImages: number;
  monthlyImages: number;
  recentSessions: number;
};

export type { SessionData, StatsData };

export function useDashboardData() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, accountRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/account"),
        ]);
        if (dashRes.ok) {
          const data = await dashRes.json();
          setSessions(data.sessions || []);
          setStats(data.stats || null);
        }
        if (accountRes.ok) {
          const accountData = await accountRes.json();
          setOnboardingCompleted(!!accountData.user?.onboarding_completed_at);
        }
      } catch {
        // API失敗時はフォールバック表示
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const completeOnboarding = async () => {
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_completed_at: true }),
      });
      if (res.ok) {
        setOnboardingCompleted(true);
      }
    } catch {
      // エラー時もUIは閉じる
      setOnboardingCompleted(true);
    }
  };

  return { sessions, setSessions, stats, setStats, loading, onboardingCompleted, completeOnboarding };
}
