"use client";

import { useState } from "react";

const ratioTabs = [
  { key: "1-1", label: "1:1 Feed" },
  { key: "9-16", label: "9:16 Story" },
  { key: "16-9", label: "16:9 X Post" },
] as const;

type RatioKey = (typeof ratioTabs)[number]["key"];

const ratioClasses: Record<RatioKey, string> = {
  "1-1": "aspect-square",
  "9-16": "aspect-[9/16] max-h-[500px]",
  "16-9": "aspect-video",
};

export default function PreviewPanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [activeRatio, setActiveRatio] = useState<RatioKey>("1-1");

  if (!isOpen) return null;

  return (
    <div className="w-[420px] bg-bg-secondary border-l border-border-light flex flex-col flex-shrink-0">
      {/* ヘッダー */}
      <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
        <div className="font-semibold text-sm">プレビュー</div>
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-[8px] border border-border-light bg-bg-secondary cursor-pointer flex items-center justify-center transition-all duration-300 text-text-secondary hover:bg-bg-primary hover:border-border-medium"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* サイズ切替タブ */}
      <div className="flex gap-1 px-5 py-3 border-b border-border-light">
        {ratioTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveRatio(tab.key)}
            className={`px-3.5 py-2 rounded-[28px] text-xs font-medium cursor-pointer border transition-all duration-300 ${
              activeRatio === tab.key
                ? "bg-bg-dark text-text-inverse border-bg-dark"
                : "bg-transparent text-text-secondary border-border-light hover:border-border-medium"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* プレビュー本体 */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center gap-4">
        {/* 生成画像モック */}
        <div
          className={`w-full rounded-[12px] overflow-hidden bg-[#E8E2DA] ${ratioClasses[activeRatio]}`}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#2C2520] to-[#3D3530] flex flex-col items-center justify-center relative overflow-hidden">
            {/* 背景エフェクト */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 60% 40%, rgba(196,113,59,.15), transparent 50%), radial-gradient(circle at 30% 70%, rgba(212,168,83,.1), transparent 40%)",
              }}
            />
            <div className="text-7xl mb-4 relative drop-shadow-[0_4px_12px_rgba(0,0,0,.3)]">
              🍨
            </div>
            <div className="font-[family-name:var(--font-playfair)] text-[22px] text-accent-gold relative tracking-[2px]">
              SAKURA CAFÉ
            </div>
            <div className="text-[13px] text-white/60 relative mt-2 tracking-[1px]">
              — Matcha Parfait ¥1,280 —
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-white/15 text-white/70 text-[10px] backdrop-blur-sm">
              ⚠ コンセプト案
            </div>
          </div>
        </div>

        {/* テキスト情報 */}
        <div className="w-full p-4 bg-bg-primary rounded-[12px] border border-border-light text-[13px] leading-relaxed">
          <div className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-1.5">
            配置テキスト情報
          </div>
          <div>
            店名: <code className="bg-[#EDE8E0] px-1.5 py-0.5 rounded text-xs text-text-secondary">さくらカフェ</code>
          </div>
          <div>
            メニュー: <code className="bg-[#EDE8E0] px-1.5 py-0.5 rounded text-xs text-text-secondary">抹茶パフェ ¥1,280</code>
          </div>
          <div>
            コピー: <code className="bg-[#EDE8E0] px-1.5 py-0.5 rounded text-xs text-text-secondary">渋谷で見つけた、和のごほうび</code>
          </div>
        </div>

        {/* フォント情報 */}
        <div className="w-full p-4 bg-bg-primary rounded-[12px] border border-border-light text-[13px] leading-relaxed">
          <div className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-1.5">
            推奨フォント
          </div>
          <div>
            タイトル: <code className="bg-[#EDE8E0] px-1.5 py-0.5 rounded text-xs text-text-secondary">Noto Serif JP Bold</code>
          </div>
          <div>
            本文: <code className="bg-[#EDE8E0] px-1.5 py-0.5 rounded text-xs text-text-secondary">Noto Sans JP Regular</code>
          </div>
        </div>
      </div>

      {/* フッター */}
      <div className="px-5 py-4 border-t border-border-light flex flex-col gap-2 flex-shrink-0">
        <button className="w-full py-3 rounded-[12px] border-none text-[13px] font-semibold bg-bg-dark text-white cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:bg-accent-warm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2M8 2v9m0 0L5 8m3 3l3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          この画像をダウンロード
        </button>
        <button className="w-full py-3 rounded-[12px] text-[13px] font-semibold bg-transparent text-text-secondary border border-border-light cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:border-border-medium">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2M8 2v9m0 0L5 8m3 3l3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          3サイズ一括ダウンロード (ZIP)
        </button>
        <div className="text-center text-xs text-text-muted py-1">
          リトライ残り
          <span className="inline-flex gap-1 ml-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-olive inline-block" />
            <span className="w-2 h-2 rounded-full bg-accent-olive inline-block" />
            <span className="w-2 h-2 rounded-full bg-accent-olive inline-block" />
          </span>{" "}
          3/3 回
        </div>
      </div>
    </div>
  );
}
