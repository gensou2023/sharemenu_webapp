"use client";

import { useState, useEffect, useCallback } from "react";
import type { Achievement } from "@/lib/types";

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

type AchievementData = {
  visible: Achievement[];
  hidden: Achievement[];
  totalHidden: number;
};

type NewAchievement = {
  icon: string;
  name: string;
};

export type { SessionData, StatsData, GalleryStatsData, AchievementData };

export function useDashboardData() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [galleryStats, setGalleryStats] = useState<GalleryStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [achievements, setAchievements] = useState<AchievementData | null>(null);
  const [newBadges, setNewBadges] = useState<NewAchievement[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, accountRes, achieveRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/account"),
          fetch("/api/achievements"),
        ]);
        if (dashRes.ok) {
          const data = await dashRes.json();
          setSessions(data.sessions || []);
          setStats(data.stats || null);
          setGalleryStats(data.galleryStats || null);
        }
        if (accountRes.ok) {
          const accountData = await accountRes.json();
          setUserName(accountData.user?.name || null);
          setOnboardingCompleted(!!accountData.user?.onboarding_completed_at);
        }
        if (achieveRes.ok) {
          const achieveData = await achieveRes.json();
          setAchievements({
            visible: achieveData.visible || [],
            hidden: achieveData.hidden || [],
            totalHidden: achieveData.totalHidden || 0,
          });

          // 未通知のバッジをトースト表示用に収集
          const unnotified = [
            ...(achieveData.visible || []),
            ...(achieveData.hidden || []),
          ].filter((a: Achievement) => a.unlocked_at && !a.notified);

          if (unnotified.length > 0) {
            setNewBadges(unnotified.map((a: Achievement) => ({ icon: a.icon, name: a.name })));
            // 通知済みマーク
            fetch("/api/achievements", { method: "PATCH" }).catch(() => {});
          }
        }
      } catch {
        // API失敗時はフォールバック表示
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const dismissBadge = useCallback(() => {
    setNewBadges((prev) => prev.slice(1));
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

  return { sessions, setSessions, stats, setStats, galleryStats, loading, userName, onboardingCompleted, completeOnboarding, achievements, newBadges, dismissBadge };
}
