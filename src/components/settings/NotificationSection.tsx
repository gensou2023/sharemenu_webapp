"use client";

import { useState, useEffect, useCallback } from "react";
import SettingsCard from "./shared/SettingsCard";
import SettingsToggle from "./shared/SettingsToggle";

type NotificationSettings = {
  new_features: boolean;
  generation_complete: boolean;
  gallery_reactions: boolean;
  marketing: boolean;
  email_frequency: string;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  new_features: true,
  generation_complete: true,
  gallery_reactions: true,
  marketing: false,
  email_frequency: "realtime",
};

const FREQUENCY_OPTIONS = [
  { value: "realtime", label: "リアルタイム" },
  { value: "daily", label: "日次まとめ" },
  { value: "weekly", label: "週次まとめ" },
  { value: "off", label: "受け取らない" },
];

export default function NotificationSection() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/account/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.notifications) {
            setSettings({
              new_features: data.notifications.new_features ?? true,
              generation_complete: data.notifications.generation_complete ?? true,
              gallery_reactions: data.notifications.gallery_reactions ?? true,
              marketing: data.notifications.marketing ?? false,
              email_frequency: data.notifications.email_frequency ?? "realtime",
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

  const patchNotification = useCallback(async (updates: Partial<NotificationSettings>) => {
    const res = await fetch("/api/account/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications: updates }),
    });
    if (!res.ok) throw new Error("save failed");
  }, []);

  const handleToggle = useCallback(async (field: keyof NotificationSettings, value: boolean) => {
    const prev = settings[field];
    setSettings((s) => ({ ...s, [field]: value }));
    setSaving(field);
    setError("");

    try {
      await patchNotification({ [field]: value });
    } catch {
      setSettings((s) => ({ ...s, [field]: prev }));
      setError("保存に失敗しました。");
    } finally {
      setSaving(null);
    }
  }, [settings, patchNotification]);

  const handleFrequencyChange = useCallback(async (value: string) => {
    const prev = settings.email_frequency;
    setSettings((s) => ({ ...s, email_frequency: value }));
    setSaving("email_frequency");
    setError("");

    try {
      await patchNotification({ email_frequency: value });
    } catch {
      setSettings((s) => ({ ...s, email_frequency: prev }));
      setError("保存に失敗しました。");
    } finally {
      setSaving(null);
    }
  }, [settings.email_frequency, patchNotification]);

  const isOff = settings.email_frequency === "off";

  if (loading) {
    return (
      <SettingsCard id="notifications" title="Notifications" accentColor="gold" animationDelay="0.35s">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-border-light/50 rounded-[8px] animate-pulse" />
          ))}
        </div>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard id="notifications" title="Notifications" accentColor="gold" animationDelay="0.35s">
      {error && (
        <div className="mb-4 p-2.5 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* メール受信頻度 */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          メール受信頻度
        </label>
        <select
          value={settings.email_frequency}
          onChange={(e) => handleFrequencyChange(e.target.value)}
          disabled={saving === "email_frequency"}
          className="w-full px-3 py-2.5 rounded-[8px] border border-border-light bg-bg-primary text-sm text-text-primary transition-colors duration-200 focus:outline-none focus:border-accent-warm disabled:opacity-50"
        >
          {FREQUENCY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-text-secondary mt-1">
          通知メールの配信タイミングを設定します
        </p>
      </div>

      {/* トグル群 */}
      <div className={`divide-y divide-border-light ${isOff ? "opacity-40 pointer-events-none" : ""}`}>
        <SettingsToggle
          label="新機能のお知らせ"
          description="サービスアップデート情報をお届けします"
          checked={settings.new_features}
          onChange={(v) => handleToggle("new_features", v)}
          disabled={saving === "new_features" || isOff}
        />
        <SettingsToggle
          label="画像生成完了"
          description="画像生成が完了した際に通知します"
          checked={settings.generation_complete}
          onChange={(v) => handleToggle("generation_complete", v)}
          disabled={saving === "generation_complete" || isOff}
        />
        <SettingsToggle
          label="ギャラリーの反応"
          description="いいね・保存された時に通知します"
          checked={settings.gallery_reactions}
          onChange={(v) => handleToggle("gallery_reactions", v)}
          disabled={saving === "gallery_reactions" || isOff}
        />
        <SettingsToggle
          label="マーケティングメール"
          description="キャンペーンやお得な情報をお届けします"
          checked={settings.marketing}
          onChange={(v) => handleToggle("marketing", v)}
          disabled={saving === "marketing" || isOff}
        />
      </div>
    </SettingsCard>
  );
}
