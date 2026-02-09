"use client";

import { useState } from "react";

const ratioTabs = [
  { key: "1-1", label: "1:1 Feed", apiRatio: "1:1" },
  { key: "9-16", label: "9:16 Story", apiRatio: "9:16" },
  { key: "16-9", label: "16:9 X Post", apiRatio: "16:9" },
] as const;

type RatioKey = (typeof ratioTabs)[number]["key"];

const ratioClasses: Record<RatioKey, string> = {
  "1-1": "aspect-square",
  "9-16": "aspect-[9/16] max-h-[500px]",
  "16-9": "aspect-video",
};

export type GeneratedImage = {
  data: string; // Base64
  mimeType: string;
};

export default function PreviewPanel({
  isOpen,
  onToggle,
  generatedImage,
  isGenerating,
  onRegenerate,
  proposal,
}: {
  isOpen: boolean;
  onToggle: () => void;
  generatedImage?: GeneratedImage | null;
  isGenerating?: boolean;
  onRegenerate?: (aspectRatio: string) => void;
  proposal?: {
    shopName?: string;
    catchCopies?: string[];
    designDirection?: string;
    hashtags?: string[];
  } | null;
}) {
  const [activeRatio, setActiveRatio] = useState<RatioKey>("1-1");

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!generatedImage) return;
    const ext = generatedImage.mimeType.includes("jpeg") ? "jpg" : "png";
    const link = document.createElement("a");
    link.href = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
    link.download = `menucraft-${activeRatio}-${Date.now()}.${ext}`;
    link.click();
  };

  return (
    <>
      {/* モバイル用オーバーレイ背景 */}
      <div
        className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        onClick={onToggle}
      />
      <div className="fixed right-0 top-[52px] bottom-0 w-[min(420px,100vw)] z-50 lg:relative lg:top-auto lg:bottom-auto lg:z-auto lg:w-[420px] bg-bg-secondary border-l border-border-light flex flex-col flex-shrink-0">
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
          {/* 画像エリア */}
          <div
            className={`w-full rounded-[12px] overflow-hidden bg-[#E8E2DA] ${ratioClasses[activeRatio]}`}
          >
            {isGenerating ? (
              /* ローディング表示 */
              <div className="w-full h-full bg-gradient-to-br from-[#2C2520] to-[#3D3530] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0" style={{
                  background: "radial-gradient(circle at 60% 40%, rgba(196,113,59,.15), transparent 50%), radial-gradient(circle at 30% 70%, rgba(212,168,83,.1), transparent 40%)",
                }} />
                <div className="relative flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-3 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin" />
                  <div className="text-sm text-white/70 font-medium">画像を生成中...</div>
                  <div className="text-xs text-white/40">20〜30秒ほどかかります</div>
                </div>
              </div>
            ) : generatedImage ? (
              /* 生成画像の表示 */
              <img
                src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`}
                alt="生成されたメニュー画像"
                className="w-full h-full object-cover"
              />
            ) : (
              /* デフォルト表示（コンセプト案） */
              <div className="w-full h-full bg-gradient-to-br from-[#2C2520] to-[#3D3530] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0" style={{
                  background: "radial-gradient(circle at 60% 40%, rgba(196,113,59,.15), transparent 50%), radial-gradient(circle at 30% 70%, rgba(212,168,83,.1), transparent 40%)",
                }} />
                <div className="text-7xl mb-4 relative drop-shadow-[0_4px_12px_rgba(0,0,0,.3)]">
                  🍨
                </div>
                <div className="font-[family-name:var(--font-playfair)] text-[22px] text-accent-gold relative tracking-[2px]">
                  {proposal?.shopName || "SAKURA CAFÉ"}
                </div>
                <div className="text-[13px] text-white/60 relative mt-2 tracking-[1px]">
                  — {proposal?.catchCopies?.[0] || "Matcha Parfait ¥1,280"} —
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-white/15 text-white/70 text-[10px] backdrop-blur-sm">
                  {generatedImage === null ? "⚠ 生成に失敗しました" : "⚠ コンセプト案"}
                </div>
              </div>
            )}
          </div>

          {/* 構成案情報 */}
          {proposal && (
            <div className="w-full p-4 bg-bg-primary rounded-[12px] border border-border-light text-[13px] leading-relaxed">
              <div className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-1.5">
                構成案情報
              </div>
              <div>
                店名: <code className="bg-[#EDE8E0] px-1.5 py-0.5 rounded text-xs text-text-secondary">{proposal.shopName}</code>
              </div>
              {proposal.designDirection && (
                <div>
                  方向性: <code className="bg-[#EDE8E0] px-1.5 py-0.5 rounded text-xs text-text-secondary">{proposal.designDirection}</code>
                </div>
              )}
              {proposal.catchCopies && proposal.catchCopies.length > 0 && (
                <div>
                  コピー: <code className="bg-[#EDE8E0] px-1.5 py-0.5 rounded text-xs text-text-secondary">{proposal.catchCopies[0]}</code>
                </div>
              )}
              {proposal.hashtags && proposal.hashtags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {proposal.hashtags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-[#EDE8E0] rounded text-xs text-text-secondary">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {!proposal && (
            <div className="w-full p-4 bg-bg-primary rounded-[12px] border border-border-light text-[13px] leading-relaxed text-center">
              <div className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-2">
                ご利用ガイド
              </div>
              <div className="text-text-muted text-xs leading-relaxed">
                チャットでお店の情報をお伝えいただくと、<br />
                AIが構成案を作成します。<br />
                構成案が完成すると、ここに情報が表示されます。
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-5 py-4 border-t border-border-light flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={handleDownload}
            disabled={!generatedImage || isGenerating}
            className="w-full py-3 rounded-[12px] border-none text-[13px] font-semibold bg-bg-dark text-white cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:bg-accent-warm disabled:opacity-40 disabled:cursor-not-allowed"
          >
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
          {onRegenerate && (
            <button
              onClick={() => {
                const tab = ratioTabs.find((t) => t.key === activeRatio);
                onRegenerate(tab?.apiRatio || "1:1");
              }}
              disabled={isGenerating}
              className="w-full py-3 rounded-[12px] text-[13px] font-semibold bg-transparent text-text-secondary border border-border-light cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:border-border-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 8a6 6 0 0110.89-3.48M14 8a6 6 0 01-10.89 3.48M2 4.5V2m0 2.5H4.5M14 11.5V14m0-2.5H11.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isGenerating ? "生成中..." : "別のデザインで再生成"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
