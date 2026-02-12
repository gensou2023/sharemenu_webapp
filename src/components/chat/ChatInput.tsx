"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface ImageAttachment {
  base64: string;
  mimeType: string;
  fileName: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ChatInput({
  onSend,
  disabled = false,
}: {
  onSend: (message: string, image?: ImageAttachment) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const [imagePreview, setImagePreview] = useState<{
    dataUrl: string;
    attachment: ImageAttachment;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("画像サイズは10MB以下にしてください");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/jpeg;base64,xxxx → base64部分を取得
      const base64 = result.split(",")[1];
      setImagePreview({
        dataUrl: result,
        attachment: {
          base64,
          mimeType: file.type,
          fileName: file.name,
        },
      });
    };
    reader.readAsDataURL(file);

    // 同じファイルを再選択可能にするためリセット
    e.target.value = "";
  };

  const clearImage = () => {
    setImagePreview(null);
  };

  const handleSubmit = () => {
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed && !imagePreview) return;

    onSend(trimmed || "(画像を送信しました)", imagePreview?.attachment);
    setValue("");
    setImagePreview(null);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.shiftKey) return;
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 md:px-7 py-3 md:py-4 border-t border-border-light bg-bg-secondary flex-shrink-0">
      {/* 画像プレビュー */}
      {imagePreview && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative inline-block">
            <img
              src={imagePreview.dataUrl}
              alt={imagePreview.attachment.fileName}
              className="h-16 w-16 object-cover rounded-[8px] border border-border-light"
            />
            <button
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-bg-dark text-white text-xs flex items-center justify-center cursor-pointer border-none hover:bg-red-500 transition-colors"
            >
              ×
            </button>
          </div>
          <span className="text-xs text-text-muted truncate max-w-[200px]">
            {imagePreview.attachment.fileName}
          </span>
        </div>
      )}

      <div className="flex items-end gap-2 md:gap-3 bg-bg-primary border border-border-light rounded-full px-3 md:px-4 py-2 transition-all duration-300 focus-within:border-accent-warm focus-within:shadow-[0_0_0_3px_rgba(232,113,58,.1)]">
        {/* 添付ボタン */}
        <div className="relative flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            title="写真を添付"
            className={`w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full border border-dashed bg-transparent cursor-pointer flex items-center justify-center transition-all duration-300 ${
              imagePreview
                ? "border-accent-warm text-accent-warm"
                : "border-border-medium text-text-muted hover:border-accent-warm hover:text-accent-warm"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
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
        </div>

        {/* 入力フィールド（複数行対応） */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "処理中です..." : "メッセージを入力..."}
          rows={1}
          className="flex-1 border-none bg-transparent text-sm py-2 outline-none text-text-primary placeholder:text-text-muted disabled:opacity-50 resize-none leading-relaxed"
        />

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          disabled={disabled || (!value.trim() && !imagePreview)}
          title="Enter で送信"
          className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full border-none bg-accent-warm text-white cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-accent-warm-hover hover:shadow-[0_2px_12px_rgba(232,113,58,.25)] flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
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
        Enter で送信 · Shift+Enter で改行 · 📎 写真アップロード対応
      </div>
    </div>
  );
}
