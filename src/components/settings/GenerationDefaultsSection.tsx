"use client";

import { useState, useEffect } from "react";
import SettingsCard from "@/components/settings/shared/SettingsCard";
import type { ImageSize, DesignStyle, PhotoStyle } from "@/lib/types";

const SIZE_OPTIONS: { value: ImageSize; label: string; desc: string }[] = [
  { value: "1:1", label: "1:1", desc: "正方形（Instagram等）" },
  { value: "9:16", label: "9:16", desc: "縦長（Stories等）" },
  { value: "16:9", label: "16:9", desc: "横長（Twitter等）" },
];

const STYLE_OPTIONS: { value: DesignStyle; label: string }[] = [
  { value: "pop", label: "ポップ" },
  { value: "chic", label: "シック" },
  { value: "japanese", label: "和風" },
  { value: "modern", label: "モダン" },
  { value: "natural", label: "ナチュラル" },
  { value: "minimal", label: "ミニマル" },
];

const PHOTO_STYLE_OPTIONS: { value: PhotoStyle; label: string }[] = [
  { value: "realistic", label: "リアル" },
  { value: "illustration", label: "イラスト" },
  { value: "watercolor", label: "水彩風" },
  { value: "flat", label: "フラットデザイン" },
];

const LANGUAGE_OPTIONS = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
];

type SettingsData = {
  default_sizes: ImageSize[];
  default_style: DesignStyle | null;
  default_text_language: string;
  default_photo_style: PhotoStyle | null;
};

const selectClass = "w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-primary text-text-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)] cursor-pointer";

export default function GenerationDefaultsSection() {
  const [settings, setSettings] = useState<SettingsData>({
    default_sizes: ["1:1"],
    default_style: null,
    default_text_language: "ja",
    default_photo_style: null,
  });
  const [original, setOriginal] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/account/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
          setOriginal(data.settings);
        }
      } catch {
        // フォールバック
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const isDirty = original ? JSON.stringify(settings) !== JSON.stringify(original) : false;

  const toggleSize = (size: ImageSize) => {
    setSettings((prev) => {
      const current = prev.default_sizes;
      if (current.includes(size)) {
        if (current.length <= 1) return prev;
        return { ...prev, default_sizes: current.filter((s) => s !== size) };
      }
      return { ...prev, default_sizes: [...current, size] };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "保存しました。");
        setOriginal(settings);
      } else {
        setError(data.error || "保存に失敗しました。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard id="generation" title="画像生成デフォルト" accentColor="gold" animationDelay="0.15s">
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-border-light rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {message && (
            <div className="mb-4 p-3 rounded-[8px] bg-accent-olive/10 border border-accent-olive/20 text-accent-olive text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* デフォルト画像サイズ */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                デフォルト画像サイズ
              </label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleSize(opt.value)}
                    className={`px-3 py-2 rounded-[8px] text-xs font-medium cursor-pointer border transition-all duration-200 ${
                      settings.default_sizes.includes(opt.value)
                        ? "bg-accent-gold/15 text-accent-gold border-accent-gold/30"
                        : "bg-transparent text-text-secondary border-border-light hover:border-accent-gold/30"
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* デフォルトスタイル */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                デフォルトスタイル
              </label>
              <select
                value={settings.default_style || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, default_style: (e.target.value || null) as DesignStyle | null }))}
                className={selectClass}
              >
                <option value="">指定なし</option>
                {STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* テキスト表示言語 */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                テキスト表示言語
              </label>
              <select
                value={settings.default_text_language}
                onChange={(e) => setSettings((prev) => ({ ...prev, default_text_language: e.target.value }))}
                className={selectClass}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* 写真スタイル */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                写真スタイル
              </label>
              <select
                value={settings.default_photo_style || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, default_photo_style: (e.target.value || null) as PhotoStyle | null }))}
                className={selectClass}
              >
                <option value="">指定なし</option>
                {PHOTO_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="mt-6 px-6 py-3 rounded-[28px] bg-accent-warm text-white text-sm font-semibold transition-all duration-300 hover:bg-accent-warm-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? "保存中..." : "変更を保存"}
          </button>
        </>
      )}
    </SettingsCard>
  );
}
