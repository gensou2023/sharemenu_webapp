"use client";

import { useState, useEffect } from "react";
import type { UsageStats } from "@/lib/types";

export function useUsage() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/account/usage");
        if (res.ok) {
          const data = await res.json();
          setUsage(data);
        }
      } catch {
        // フォールバック
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  return { usage, loading };
}
