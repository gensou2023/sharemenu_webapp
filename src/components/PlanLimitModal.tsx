"use client";

import Link from "next/link";

export default function PlanLimitModal({
  isOpen,
  onClose,
  sessionCount,
  onDeleteOldest,
  deleting,
  oldestSessionName,
}: {
  isOpen: boolean;
  onClose: () => void;
  sessionCount: number;
  onDeleteOldest?: () => void;
  deleting?: boolean;
  oldestSessionName?: string;
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
            <div className="text-5xl mb-3">🔒</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2">
              無料プランの上限に達しました
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              無料プランでは月<strong>3セッション</strong>まで作成できます。
              <br />
              現在 <strong>{sessionCount}セッション</strong> 使用中です。
            </p>
          </div>

          {/* プラン比較 */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-[12px] bg-bg-primary border border-border-light">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Free
                </div>
                <div className="text-2xl font-bold mb-1">¥0</div>
                <ul className="text-[11px] text-text-secondary space-y-1">
                  <li>月3セッション</li>
                  <li>基本テンプレート</li>
                  <li>広告あり</li>
                </ul>
              </div>
              <div className="p-4 rounded-[12px] bg-accent-warm/5 border border-accent-warm/20">
                <div className="text-xs font-semibold text-accent-warm uppercase tracking-wider mb-2">
                  Pro
                </div>
                <div className="text-2xl font-bold text-accent-warm mb-1">¥700</div>
                <ul className="text-[11px] text-text-secondary space-y-1">
                  <li className="font-semibold text-text-primary">無制限セッション</li>
                  <li>全テンプレート</li>
                  <li>広告なし</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 古い順に削除して続行オプション */}
          {onDeleteOldest && (
            <div className="px-6 pb-4">
              <div className="p-3 rounded-[12px] bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 leading-relaxed">
                  または、一番古いセッション
                  {oldestSessionName && (
                    <strong>&ldquo;{oldestSessionName}&rdquo;</strong>
                  )}
                  を削除して新しいセッションを作成できます。
                </p>
                <p className="text-[10px] text-amber-600 mt-1">
                  ⚠ 削除されたデータは復元できません
                </p>
              </div>
            </div>
          )}

          {/* ボタン */}
          <div className="px-6 pb-6 flex flex-col gap-2.5">
            <Link
              href="/#pricing"
              className="w-full py-3.5 rounded-[28px] bg-accent-warm text-white text-sm font-semibold text-center no-underline transition-all duration-300 hover:bg-accent-warm-hover hover:-translate-y-0.5 block"
            >
              Proプランにアップグレード →
            </Link>
            {onDeleteOldest && (
              <button
                onClick={onDeleteOldest}
                disabled={deleting}
                className="w-full py-3 rounded-[28px] text-sm text-red-600 bg-transparent border border-red-300 cursor-pointer transition-all duration-300 hover:bg-red-50 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    削除中...
                  </>
                ) : (
                  "古いセッションを削除して作成 →"
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-[28px] text-sm text-text-secondary bg-transparent border border-border-medium cursor-pointer transition-all duration-300 hover:border-text-primary"
            >
              後で検討する
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
