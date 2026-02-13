"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import SettingsCard from "@/components/settings/shared/SettingsCard";

type Props = {
  onError: (msg: string) => void;
};

export default function DangerSection({ onError }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/login" });
      } else {
        const data = await res.json();
        onError(data.error || "退会処理に失敗しました。");
        setShowModal(false);
      }
    } catch {
      onError("通信エラーが発生しました。");
      setShowModal(false);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <>
      <SettingsCard id="danger" title="退会" accentColor="red" animationDelay="0.4s">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-[15px] mb-1">
              アカウントを削除
            </div>
            <div className="text-xs text-text-secondary">
              退会すると、ログインできなくなります
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-[28px] bg-red-500 text-white text-[13px] font-semibold transition-all duration-300 hover:bg-red-600 cursor-pointer"
          >
            退会する
          </button>
        </div>
      </SettingsCard>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-bg-secondary rounded-[16px] border border-border-light p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-2">退会の確認</h3>
            <p className="text-sm text-text-secondary mb-1">
              本当に退会しますか？
            </p>
            <p className="text-sm text-red-500 mb-4">
              退会するとログインできなくなります。この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={withdrawing}
                className="px-4 py-2 rounded-[8px] border border-border-light text-sm cursor-pointer hover:bg-bg-primary transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="px-4 py-2 rounded-[8px] bg-red-500 text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawing ? "処理中..." : "退会する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
