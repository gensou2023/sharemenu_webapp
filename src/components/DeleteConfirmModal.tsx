"use client";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  shopName,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  shopName: string;
  loading: boolean;
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
        <div className="bg-bg-secondary rounded-[20px] border border-border-light shadow-[0_20px_60px_rgba(0,0,0,.15)] w-full max-w-[400px] animate-[msgIn_0.3s_ease-out]">
          {/* ヘッダー */}
          <div className="text-center pt-8 pb-4 px-6">
            <div className="text-5xl mb-3">🗑️</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2">
              セッションを削除しますか？
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              <strong>&ldquo;{shopName}&rdquo;</strong> のセッションと
              関連する全ての画像・チャット履歴が削除されます。
            </p>
            <div className="mt-3 p-3 rounded-[12px] bg-red-50 border border-red-200">
              <p className="text-xs text-red-600 font-semibold">
                ⚠ この操作は取り消せません。削除されたデータは復元できません。
              </p>
            </div>
          </div>

          {/* ボタン */}
          <div className="px-6 pb-6 flex flex-col gap-2.5">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full py-3.5 rounded-[28px] bg-red-500 text-white text-sm font-semibold text-center transition-all duration-300 hover:bg-red-600 hover:-translate-y-0.5 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  削除中...
                </>
              ) : (
                "削除する"
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-3 rounded-[28px] text-sm text-text-secondary bg-transparent border border-border-medium cursor-pointer transition-all duration-300 hover:border-text-primary disabled:opacity-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
