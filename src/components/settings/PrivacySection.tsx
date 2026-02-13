"use client";

import { useState, useEffect, useCallback } from "react";
import SettingsCard from "./shared/SettingsCard";
import SettingsToggle from "./shared/SettingsToggle";

type PrivacySettings = {
  ai_data_usage: boolean;
  gallery_show_shop_name: boolean;
  analytics_data_sharing: boolean;
};

const DEFAULT_SETTINGS: PrivacySettings = {
  ai_data_usage: true,
  gallery_show_shop_name: true,
  analytics_data_sharing: true,
};

export default function PrivacySection() {
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/account/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings({
              ai_data_usage: data.settings.ai_data_usage ?? true,
              gallery_show_shop_name: data.settings.gallery_show_shop_name ?? true,
              analytics_data_sharing: data.settings.analytics_data_sharing ?? true,
            });
          }
        }
      } catch {
        // フォールバック
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleToggle = useCallback(async (field: keyof PrivacySettings, value: boolean) => {
    const prev = settings[field];
    setSettings((s) => ({ ...s, [field]: value }));
    setSaving(field);
    setError("");

    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) {
        setSettings((s) => ({ ...s, [field]: prev }));
        setError("保存に失敗しました。");
      }
    } catch {
      setSettings((s) => ({ ...s, [field]: prev }));
      setError("通信エラーが発生しました。");
    } finally {
      setSaving(null);
    }
  }, [settings]);

  if (loading) {
    return (
      <SettingsCard id="privacy" title="Privacy" accentColor="olive" animationDelay="0.3s">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-border-light/50 rounded-[8px] animate-pulse" />
          ))}
        </div>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard id="privacy" title="Privacy" accentColor="olive" animationDelay="0.3s">
      {error && (
        <div className="mb-4 p-2.5 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      <div className="divide-y divide-border-light">
        <SettingsToggle
          label="AI学習へのデータ提供"
          description="アップロード画像・チャット内容をAIモデルの改善に利用します"
          checked={settings.ai_data_usage}
          onChange={(v) => handleToggle("ai_data_usage", v)}
          disabled={saving === "ai_data_usage"}
        />
        <SettingsToggle
          label="ギャラリー公開時の店名表示"
          description="ギャラリーに画像を共有する際、店舗名を表示します"
          checked={settings.gallery_show_shop_name}
          onChange={(v) => handleToggle("gallery_show_shop_name", v)}
          disabled={saving === "gallery_show_shop_name"}
        />
        <SettingsToggle
          label="使用状況データの共有"
          description="サービス改善のための匿名利用データを共有します"
          checked={settings.analytics_data_sharing}
          onChange={(v) => handleToggle("analytics_data_sharing", v)}
          disabled={saving === "analytics_data_sharing"}
        />
      </div>
    </SettingsCard>
  );
}
