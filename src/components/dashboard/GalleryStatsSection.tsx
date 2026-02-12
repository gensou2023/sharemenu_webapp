"use client";

import Link from "next/link";
import type { GalleryStatsData } from "@/hooks/useDashboardData";

export default function GalleryStatsSection({
  data,
  loading,
}: {
  data: GalleryStatsData | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <section className="mb-9">
        <div className="mb-6">
          <div className="w-20 h-3 bg-border-light rounded animate-pulse mb-2" />
          <div className="w-40 h-5 bg-border-light rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-bg-secondary rounded-[16px] border border-border-light animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-bg-secondary rounded-[12px] border border-border-light animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.sharedCount === 0) {
    return (
      <section className="mb-9">
        <div className="mb-6">
          <span className="inline-block text-xs font-semibold text-accent-gold uppercase tracking-[2px] mb-2">
            Gallery
          </span>
          <h2 className="text-lg font-semibold">ギャラリー成績</h2>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-8 h-[2px] bg-accent-gold/20 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-accent-gold/30" />
            <div className="w-8 h-[2px] bg-accent-gold/20 rounded-full" />
          </div>
        </div>
        <div className="bg-bg-secondary rounded-[20px] border border-border-light p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-gold/[.06] border border-accent-gold/10 mb-4">
            <span className="text-3xl">🖼</span>
          </div>
          <p className="text-sm text-text-muted mb-4">
            まだギャラリーに共有していません
          </p>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm text-accent-gold font-medium no-underline hover:underline"
          >
            ギャラリーを見る
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    );
  }

  const summaryCards = [
    {
      label: "共有数",
      value: data.sharedCount,
      icon: "🖼",
      color: "accent-gold",
    },
    {
      label: "総いいね",
      value: data.totalLikes,
      icon: "❤️",
      color: "red-400",
    },
    {
      label: "総保存",
      value: data.totalSaves,
      icon: "🔖",
      color: "accent-warm",
    },
  ];

  return (
    <section className="mb-9">
      {/* ヘッダー */}
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold text-accent-gold uppercase tracking-[2px] mb-2">
          Gallery
        </span>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">ギャラリー成績</h2>
          <Link
            href="/gallery"
            className="text-xs text-accent-gold font-medium no-underline hover:underline flex items-center gap-1"
          >
            ギャラリーを見る
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-8 h-[2px] bg-accent-gold/20 rounded-full" />
          <div className="w-2 h-2 rounded-full bg-accent-gold/30" />
          <div className="w-8 h-[2px] bg-accent-gold/20 rounded-full" />
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-secondary rounded-[16px] border border-border-light p-4 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-${card.color} opacity-40`} />
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs text-text-muted">{card.label}</div>
          </div>
        ))}
      </div>

      {/* 人気画像 */}
      {data.topImages.length > 0 && (
        <div>
          <div className="text-sm font-medium text-text-secondary mb-3">
            あなたの人気メニュー
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {data.topImages.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-[12px] overflow-hidden border border-border-light bg-border-light"
              >
                <img
                  src={img.image_url}
                  alt={img.prompt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* オーバーレイ（ホバー時） */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1 text-white text-xs font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    {img.like_count}
                  </div>
                  <div className="flex items-center gap-1 text-white text-xs font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                    {img.save_count}
                  </div>
                </div>
                {/* 常時表示のカウント */}
                {(img.like_count > 0 || img.save_count > 0) && (
                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                    {img.like_count > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-white font-medium">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                        {img.like_count}
                      </span>
                    )}
                    {img.save_count > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-white font-medium">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                        {img.save_count}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
