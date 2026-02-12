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

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
          setStats(data.stats || null);
        }
      } catch {
        // API失敗時はフォールバック表示
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { sessions, setSessions, stats, setStats, loading };
}
