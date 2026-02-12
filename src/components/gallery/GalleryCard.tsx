"use client";

import type { GalleryItem } from "@/lib/types";

type Props = {
  item: GalleryItem;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onReport: (id: string) => void;
  liking?: boolean;
  saving?: boolean;
};

export default function GalleryCard({ item, onLike, onSave, onReport, liking, saving }: Props) {
  return (
    <div className="group bg-bg-secondary rounded-[20px] border border-border-light overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(26,23,20,.12)] hover:border-accent-warm/20">
      {/* 画像 */}
      <div className="aspect-square relative overflow-hidden bg-border-light">
        <img
          src={item.image_url}
          alt={item.prompt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* カテゴリバッジ */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[11px] font-medium text-white">
          {item.category}
        </span>
        {/* 報告ボタン */}
        <button
          onClick={() => onReport(item.id)}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/50 flex items-center justify-center cursor-pointer border-none opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="報告"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        </button>
      </div>

      {/* 情報 */}
      <div className="p-4">
        {/* 店名 or ユーザー名 */}
        <div className="text-sm font-semibold truncate mb-1">
          {item.show_shop_name && item.shop_name ? item.shop_name : item.user_name}
        </div>

        {/* プロンプト抜粋 */}
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-3 h-8">
          {item.prompt}
        </p>

        {/* アクション */}
        <div className="flex items-center gap-3">
          {/* いいね */}
          <button
            onClick={() => onLike(item.id)}
            disabled={liking}
            className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer bg-transparent border-none transition-colors duration-200 disabled:opacity-50 ${
              item.is_liked ? "text-red-500" : "text-text-muted hover:text-red-500"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={item.is_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {item.like_count}
          </button>

          {/* 保存 */}
          <button
            onClick={() => onSave(item.id)}
            disabled={saving}
            className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer bg-transparent border-none transition-colors duration-200 disabled:opacity-50 ${
              item.is_saved ? "text-accent-gold" : "text-text-muted hover:text-accent-gold"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={item.is_saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            {item.save_count}
          </button>
        </div>
      </div>
    </div>
  );
}
