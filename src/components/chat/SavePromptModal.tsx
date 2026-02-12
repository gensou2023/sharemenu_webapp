"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "", label: "なし" },
  { value: "cafe", label: "カフェ" },
  { value: "izakaya", label: "居酒屋" },
  { value: "italian", label: "イタリアン" },
  { value: "sweets", label: "スイーツ" },
  { value: "ramen", label: "ラーメン" },
  { value: "chinese", label: "中華" },
  { value: "japanese", label: "和食" },
  { value: "other", label: "その他" },
];

type Props = {
  promptText: string;
  shopName?: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function SavePromptModal({
  promptText,
  shopName,
  onClose,
  onSaved,
}: Props) {
  const defaultName = shopName ? `${shopName} プロンプト` : "マイプロンプト";
  const [name, setName] = useState(defaultName);
  const [text, setText] = useState(promptText);
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !text.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/prompts/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          prompt_text: text.trim(),
          category: category || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "保存に失敗しました。");
        return;
      }

      setSaved(true);
      setTimeout(() => {
        onSaved();
      }, 800);
    } catch {
      setError("サーバーエラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-bg-secondary rounded-[20px] border border-border-light max-w-[480px] w-full mx-4 relative overflow-hidden animate-fade-in-up shadow-[0_20px_60px_rgba(0,0,0,.15)]">
        {/* アクセントバー */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-warm via-accent-gold to-transparent" />

        <div className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📝</span>
            プロンプトを保存
          </h3>

          {saved ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-sm font-semibold text-accent-olive">保存しました！</div>
            </div>
          ) : (
            <>
              {/* プロンプト名 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">プロンプト名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2.5 rounded-[12px] border border-border-light bg-bg-primary text-sm focus:outline-none focus:border-accent-warm transition-colors"
                  placeholder="例: カフェメニュー用プロンプト"
                />
              </div>

              {/* プロンプト内容 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">プロンプト内容</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={2000}
                  rows={6}
                  className="w-full px-4 py-2.5 rounded-[12px] border border-border-light bg-bg-primary text-sm focus:outline-none focus:border-accent-warm transition-colors resize-y"
                  placeholder="画像生成に使うプロンプトを入力..."
                />
                <div className="text-xs text-text-muted text-right mt-1">
                  {text.length}/2000
                </div>
              </div>

              {/* カテゴリ選択 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">カテゴリ（任意）</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[12px] border border-border-light bg-bg-primary text-sm focus:outline-none focus:border-accent-warm transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="text-sm text-red-500 mb-4">{error}</div>
              )}

              {/* ボタン */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-[28px] border border-border-light text-sm text-text-secondary cursor-pointer bg-transparent hover:bg-bg-primary transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim() || !text.trim()}
                  className="flex-1 py-2.5 rounded-[28px] bg-accent-warm text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-accent-warm-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "保存中..." : "保存する"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
