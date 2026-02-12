"use client";

import { useState } from "react";

const CATEGORIES = [
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
  imageId: string;
  imageUrl?: string;
  sessionCategory?: string;
  shopName?: string;
  onClose: () => void;
  onShared: () => void;
};

export default function ShareModal({
  imageId,
  imageUrl,
  sessionCategory,
  shopName,
  onClose,
  onShared,
}: Props) {
  const [category, setCategory] = useState(sessionCategory || "other");
  const [showShopName, setShowShopName] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");

  const handleShare = async () => {
    setSharing(true);
    setError("");

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_id: imageId,
          category,
          show_shop_name: showShopName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "共有に失敗しました。");
        return;
      }

      onShared();
    } catch {
      setError("サーバーエラーが発生しました。");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-secondary rounded-[20px] border border-border-light max-w-[440px] w-full mx-4 relative overflow-hidden animate-fade-in-up">
        {/* アクセントバー */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-warm via-accent-gold to-transparent" />

        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">ギャラリーに共有</h3>

          {/* 画像プレビュー */}
          {imageUrl && (
            <div className="aspect-video rounded-[12px] overflow-hidden bg-border-light mb-4">
              <img src={imageUrl} alt="共有する画像" className="w-full h-full object-cover" />
            </div>
          )}

          {/* カテゴリ選択 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">カテゴリ</label>
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

          {/* 店名表示チェック */}
          {shopName && (
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={showShopName}
                onChange={(e) => setShowShopName(e.target.checked)}
                className="w-4 h-4 accent-accent-warm"
              />
              <span className="text-sm text-text-secondary">
                店名を表示する（{shopName}）
              </span>
            </label>
          )}

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
              onClick={handleShare}
              disabled={sharing}
              className="flex-1 py-2.5 rounded-[28px] bg-accent-warm text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-accent-warm-hover disabled:opacity-50"
            >
              {sharing ? "共有中..." : "共有する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
