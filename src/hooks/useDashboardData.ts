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
  isShared: boolean;
  totalLikes: number;
  totalSaves: number;
};

type StatsData = {
  totalImages: number;
  monthlyImages: number;
  recentSessions: number;
};

type GalleryStatsData = {
  sharedCount: number;
  totalLikes: number;
  totalSaves: number;
  topImages: Array<{
    id: string;
    image_url: string;
    prompt: string;
    category: string;
    like_count: number;
    save_count: number;
    created_at: string;
  }>;
};

export type { SessionData, StatsData, GalleryStatsData };

export function useDashboardData() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [galleryStats, setGalleryStats] = useState<GalleryStatsData | null>(null);
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
          setGalleryStats(data.galleryStats || null);
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

  return { sessions, setSessions, stats, setStats, galleryStats, loading, onboardingCompleted, completeOnboarding };
}
