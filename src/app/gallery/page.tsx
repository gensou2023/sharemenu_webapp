"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/landing/Header";
import CommonFooter from "@/components/CommonFooter";
import GalleryCard from "@/components/gallery/GalleryCard";
import type { GalleryItem } from "@/lib/types";

const CATEGORY_TABS = [
  { value: "", label: "すべて" },
  { value: "cafe", label: "カフェ" },
  { value: "izakaya", label: "居酒屋" },
  { value: "italian", label: "イタリアン" },
  { value: "sweets", label: "スイーツ" },
  { value: "ramen", label: "ラーメン" },
  { value: "other", label: "その他" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "新着順" },
  { value: "likes", label: "いいね順" },
  { value: "saves", label: "保存順" },
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), sort });
      if (category) params.set("category", category);

      const res = await fetch(`/api/gallery?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // フォールバック
    } finally {
      setLoading(false);
    }
  }, [page, category, sort]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const handleLike = async (id: string) => {
    setLikingId(id);
    try {
      const res = await fetch(`/api/gallery/${id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, is_liked: data.liked, like_count: data.like_count }
              : item
          )
        );
      }
    } catch {
      // エラー時は何もしない
    } finally {
      setLikingId(null);
    }
  };

  const handleSave = async (id: string) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/gallery/${id}/save`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, is_saved: data.saved, save_count: data.save_count }
              : item
          )
        );
      } else {
        const data = await res.json();
        if (data.error) alert(data.error);
      }
    } catch {
      // エラー時は何もしない
    } finally {
      setSavingId(null);
    }
  };

  const handleReport = async (id: string) => {
    const reason = prompt("報告理由を選択してください:\n1. 不適切な内容\n2. スパム\n3. その他");
    if (!reason) return;

    const reasonMap: Record<string, string> = { "1": "inappropriate", "2": "spam", "3": "other" };
    const mappedReason = reasonMap[reason] || "other";

    try {
      const res = await fetch(`/api/gallery/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: mappedReason }),
      });
      if (res.ok) {
        alert("報告を受け付けました。");
      }
    } catch {
      // エラー時は何もしない
    }
  };

  return (
    <>
      <Header activeTab="gallery" />
      <main className="mt-[56px] min-h-[calc(100vh-56px)] bg-bg-primary relative overflow-hidden">
        {/* Background blur decorations */}
        <div className="absolute top-[5%] right-[5%] w-72 h-72 bg-accent-warm/[.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] left-[3%] w-56 h-56 bg-accent-gold/[.05] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-48 h-48 bg-accent-olive/[.04] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1080px] mx-auto px-6 sm:px-10 py-10 relative z-10">
          {/* ヘッダー */}
          <div className="mb-8">
            <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-2">
              Gallery
            </span>
            <h1 className="text-2xl font-bold">みんなのメニューデザイン</h1>
            <p className="text-sm text-text-secondary mt-2">
              MenuCraft AI で作成されたメニュー画像を閲覧・参考にできます
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-8 h-[2px] bg-accent-warm/20 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-accent-warm/30" />
              <div className="w-8 h-[2px] bg-accent-warm/20 rounded-full" />
            </div>
          </div>

          {/* フィルター */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            {/* カテゴリタブ */}
            <div className="flex flex-wrap gap-1.5 flex-1">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleCategoryChange(tab.value)}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium cursor-pointer border transition-all duration-200 ${
                    category === tab.value
                      ? "bg-accent-warm text-white border-accent-warm"
                      : "bg-transparent text-text-secondary border-border-light hover:border-accent-warm/30 hover:text-accent-warm"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ソート */}
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 rounded-[12px] border border-border-light bg-bg-secondary text-sm focus:outline-none focus:border-accent-warm transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* グリッド */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-bg-secondary rounded-[20px] border border-border-light overflow-hidden">
                  <div className="aspect-square bg-border-light animate-pulse" />
                  <div className="p-4">
                    <div className="w-24 h-4 bg-border-light rounded animate-pulse mb-2" />
                    <div className="w-40 h-3 bg-border-light rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 bg-accent-warm/[.04] rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent-warm/[.06] border border-accent-warm/10 mb-6">
                  <span className="text-5xl">🖼</span>
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2">
                  まだ共有画像がありません
                </h3>
                <p className="text-sm text-text-muted max-w-[320px] mx-auto leading-relaxed">
                  メニュー画像を作成して、ギャラリーに共有してみましょう
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onLike={handleLike}
                  onSave={handleSave}
                  onReport={handleReport}
                  liking={likingId === item.id}
                  saving={savingId === item.id}
                />
              ))}
            </div>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-full border border-border-light text-sm cursor-pointer bg-transparent hover:bg-bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <span className="text-sm text-text-secondary px-3">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-full border border-border-light text-sm cursor-pointer bg-transparent hover:bg-bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          )}
        </div>

        <CommonFooter />
      </main>
    </>
  );
}
