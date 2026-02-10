"use client";

import { useState } from "react";
import type { GeneratedImage, FlowStep, Proposal } from "@/lib/types";

// 後方互換のためエクスポート
export type { GeneratedImage, FlowStep };

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

// ステップ定義
type StepStatus = "pending" | "active" | "done";
type Step = { label: string; status: StepStatus };

function StepFlow({ steps }: { steps: Step[] }) {
  return (
    <div className="w-full px-1">
      <div className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-3">
        作成フロー
      </div>
      <div className="flex flex-col gap-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            {/* ライン + ドット */}
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-all duration-300 ${
                  step.status === "done"
                    ? "bg-accent-olive text-white"
                    : step.status === "active"
                    ? "bg-accent-warm text-white animate-pulse"
                    : "bg-border-light text-text-muted"
                }`}
              >
                {step.status === "done" ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-px h-4 transition-all duration-300 ${
                    step.status === "done" ? "bg-accent-olive/40" : "bg-border-light"
                  }`}
                />
              )}
            </div>
            {/* ラベル */}
            <div
              className={`text-xs pt-0.5 transition-all duration-300 ${
                step.status === "done"
                  ? "text-text-secondary line-through opacity-60"
                  : step.status === "active"
                  ? "text-text-primary font-semibold"
                  : "text-text-muted"
              }`}
            >
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PreviewPanel({
  isOpen,
  onToggle,
  generatedImage,
  isGenerating,
  onRegenerate,
  proposal,
  currentStep = 1,
}: {
  isOpen: boolean;
  onToggle: () => void;
  generatedImage?: GeneratedImage | null;
  isGenerating?: boolean;
  onRegenerate?: (aspectRatio: string) => void;
  proposal?: Partial<Proposal> | null;
  currentStep?: FlowStep;
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
      <div className="fixed right-0 top-[56px] bottom-0 w-[min(420px,100vw)] z-50 lg:relative lg:top-auto lg:bottom-auto lg:z-auto lg:w-[420px] bg-bg-secondary border-l border-border-light flex flex-col flex-shrink-0">
        {/* ヘッダー */}
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-accent-warm uppercase tracking-[1.5px]">
              Preview
            </span>
            <div className="font-semibold text-sm">プレビュー</div>
          </div>
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-full border border-border-light bg-bg-secondary cursor-pointer flex items-center justify-center transition-all duration-300 text-text-secondary hover:bg-accent-warm/10 hover:text-accent-warm hover:border-accent-warm/30"
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
              className={`px-3.5 py-2 rounded-full text-xs font-medium cursor-pointer border transition-all duration-300 ${
                activeRatio === tab.key
                  ? "bg-accent-warm text-white border-accent-warm shadow-[0_2px_8px_rgba(232,113,58,.2)]"
                  : "bg-transparent text-text-secondary border-border-light hover:border-accent-warm/30 hover:text-accent-warm"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* プレビュー本体 */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center gap-4 animate-fade-in-up">
          {/* 画像エリア */}
          <div
            className={`w-full rounded-[16px] overflow-hidden bg-border-light flex-shrink-0 ${ratioClasses[activeRatio]}`}
          >
            {isGenerating ? (
              /* ローディング表示 */
              <div className="w-full h-full bg-gradient-to-br from-bg-dark-warm to-bg-dark-warm-light flex flex-col items-center justify-center relative overflow-hidden">
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
                className="w-full object-cover block"
                style={{ aspectRatio: activeRatio === "1-1" ? "1/1" : activeRatio === "9-16" ? "9/16" : "16/9" }}
              />
            ) : (
              /* デフォルト表示（コンセプト案） */
              <div className="w-full h-full bg-gradient-to-br from-bg-dark-warm to-bg-dark-warm-light flex flex-col items-center justify-center relative overflow-hidden">
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
            <div className="w-full p-4 bg-bg-primary rounded-[16px] border border-border-light text-[13px] leading-relaxed relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-gold opacity-40" />
              <div className="text-[11px] font-semibold text-accent-warm uppercase tracking-[1px] mb-1.5">
                構成案情報
              </div>
              <div>
                店名: <code className="bg-bg-tag px-1.5 py-0.5 rounded text-xs text-text-secondary">{proposal.shopName}</code>
              </div>
              {proposal.designDirection && (
                <div>
                  方向性: <code className="bg-bg-tag px-1.5 py-0.5 rounded text-xs text-text-secondary">{proposal.designDirection}</code>
                </div>
              )}
              {proposal.catchCopies && proposal.catchCopies.length > 0 && (
                <div>
                  コピー: <code className="bg-bg-tag px-1.5 py-0.5 rounded text-xs text-text-secondary">{proposal.catchCopies[0]}</code>
                </div>
              )}
              {proposal.hashtags && proposal.hashtags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {proposal.hashtags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-bg-tag rounded text-xs text-text-secondary">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ステップフロー（常時表示） */}
          <div className="w-full p-4 bg-bg-primary rounded-[16px] border border-border-light relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-warm opacity-40" />
            <StepFlow
              steps={[
                { label: "お店の名前を入力", status: currentStep > 1 ? "done" : currentStep === 1 ? "active" : "pending" },
                { label: "デザインの方向性を選択", status: currentStep > 2 ? "done" : currentStep === 2 ? "active" : "pending" },
                { label: "メニュー・価格を入力", status: currentStep > 3 ? "done" : currentStep === 3 ? "active" : "pending" },
                { label: "構成案を確認・承認", status: currentStep > 4 ? "done" : currentStep === 4 ? "active" : "pending" },
                { label: "画像を生成・ダウンロード", status: currentStep >= 5 ? (generatedImage ? "done" : "active") : "pending" },
              ]}
            />
          </div>
        </div>

        {/* フッター */}
        <div className="px-5 py-4 border-t border-border-light flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={handleDownload}
            disabled={!generatedImage || isGenerating}
            className="w-full py-3 rounded-full border-none text-[13px] font-semibold bg-accent-warm text-white cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:bg-accent-warm-hover hover:shadow-[0_4px_16px_rgba(232,113,58,.25)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
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
              className="w-full py-3 rounded-full text-[13px] font-semibold bg-transparent text-text-secondary border border-border-light cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:border-accent-warm/40 hover:text-accent-warm disabled:opacity-40 disabled:cursor-not-allowed"
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
