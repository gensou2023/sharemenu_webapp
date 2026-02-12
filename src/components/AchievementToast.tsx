"use client";

import { useEffect, useState } from "react";

type Props = {
  icon: string;
  name: string;
  onClose: () => void;
};

export default function AchievementToast({ icon, name, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // フェードイン
    requestAnimationFrame(() => setVisible(true));

    // 4秒後にフェードアウト
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-4 rounded-[16px] bg-bg-dark border border-accent-gold/30 shadow-[0_8px_30px_rgba(212,168,83,.2)] flex items-center gap-4 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center text-2xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-[11px] font-semibold text-accent-gold uppercase tracking-[1px]">
          Badge Unlocked!
        </div>
        <div className="text-sm font-bold text-white">{name}</div>
        <div className="text-xs text-text-muted">獲得しました！</div>
      </div>
    </div>
  );
}
