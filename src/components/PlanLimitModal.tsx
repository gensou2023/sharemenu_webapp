"use client";

import Link from "next/link";

export default function PlanLimitModal({
  isOpen,
  onClose,
  used,
  limit,
  recentImages,
}: {
  isOpen: boolean;
  onClose: () => void;
  used: number;
  limit: number;
  recentImages?: string[];
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/40 z-[100] animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-bg-secondary rounded-[20px] border border-border-light shadow-[0_20px_60px_rgba(0,0,0,.15)] w-full max-w-[420px] animate-[msgIn_0.3s_ease-out]">
          {/* ヘッダー */}
          <div className="text-center pt-8 pb-4 px-6">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2">
              今月の無料枠を使い切りました！
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              今月 <strong>{used}枚</strong> の画像を生成しました。
            </p>
          </div>

          {/* 今月の成果サムネイル */}
          {recentImages && recentImages.length > 0 && (
            <div className="px-6 pb-4">
              <div className="text-xs text-text-muted mb-2">今月作成した画像:</div>
              <div className="grid grid-cols-4 gap-2">
                {recentImages.slice(0, 4).map((url, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[8px] overflow-hidden bg-border-light"
                  >
                    <img
                      src={url}
                      alt={`生成画像 ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* プラン比較 */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-[12px] bg-bg-primary border border-border-light">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Free
                </div>
                <div className="text-2xl font-bold mb-1">¥0</div>
                <ul className="text-[11px] text-text-secondary space-y-1">
                  <li>月10枚まで</li>
                  <li>全機能利用可</li>
                  <li>画像保存30日</li>
                </ul>
              </div>
              <div className="p-4 rounded-[12px] bg-accent-warm/5 border border-accent-warm/20">
                <div className="text-xs font-semibold text-accent-warm uppercase tracking-wider mb-2">
                  Pro
                </div>
                <div className="text-2xl font-bold text-accent-warm mb-1">¥700</div>
                <ul className="text-[11px] text-text-secondary space-y-1">
                  <li className="font-semibold text-text-primary">月50枚まで</li>
                  <li>全機能利用可</li>
                  <li>画像保存無期限</li>
                </ul>
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-xs text-text-muted">
                Pro なら1枚あたり約¥14で作れます
              </span>
            </div>
          </div>

          {/* ボタン */}
          <div className="px-6 pb-6 flex flex-col gap-2.5">
            <Link
              href="/#pricing"
              className="w-full py-3.5 rounded-[28px] bg-accent-warm text-white text-sm font-semibold text-center no-underline transition-all duration-300 hover:bg-accent-warm-hover hover:-translate-y-0.5 block"
            >
              Pro で続ける →
            </Link>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-[28px] text-sm text-text-secondary bg-transparent border border-border-medium cursor-pointer transition-all duration-300 hover:border-text-primary"
            >
              来月まで待つ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
