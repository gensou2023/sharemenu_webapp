"use client";

import { useState } from "react";

export default function ChatInput({
  onSend,
}: {
  onSend: (message: string) => void;
}) {
  const [value, setValue] = useState("");
  const [showAttachNotice, setShowAttachNotice] = useState(false);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 md:px-7 py-3 md:py-4 border-t border-border-light bg-bg-secondary flex-shrink-0">
      <div className="flex items-end gap-2 md:gap-3 bg-bg-primary border border-border-light rounded-[20px] px-3 md:px-4 py-2 transition-all duration-300 focus-within:border-accent-warm focus-within:shadow-[0_0_0_3px_rgba(196,113,59,.1)]">
        {/* 添付ボタン */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => {
              setShowAttachNotice(true);
              setTimeout(() => setShowAttachNotice(false), 3000);
            }}
            title="写真を添付"
            className="w-[38px] h-[38px] rounded-[8px] border border-dashed border-border-medium bg-transparent cursor-pointer flex items-center justify-center transition-all duration-300 text-text-muted hover:border-accent-warm hover:text-accent-warm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M15.75 9.375L9.6 15.525a3.75 3.75 0 01-5.3-5.3l6.15-6.15a2.5 2.5 0 013.535 3.535l-6.14 6.14a1.25 1.25 0 01-1.768-1.768l5.68-5.67"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {showAttachNotice && (
            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-bg-dark text-white text-xs rounded-lg whitespace-nowrap shadow-lg animate-[msgIn_0.3s_ease-out]">
              📷 画像アップロード機能は準備中です
              <div className="absolute top-full left-4 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-bg-dark" />
            </div>
          )}
        </div>

        {/* 入力フィールド */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力..."
          className="flex-1 border-none bg-transparent text-sm py-2 outline-none text-text-primary placeholder:text-text-muted"
        />

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          className="w-[38px] h-[38px] rounded-[8px] border-none bg-bg-dark text-white cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-accent-warm flex-shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M15.75 2.25L8.25 9.75M15.75 2.25l-5.25 13.5L8.25 9.75m7.5-7.5L2.25 8.25l6 1.5"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="text-[11px] text-text-muted mt-2 text-center">
        📎 写真アップロード対応（10MB以内 / JPEG, PNG, WebP）
      </div>
    </div>
  );
}
