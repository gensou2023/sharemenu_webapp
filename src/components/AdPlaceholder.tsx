"use client";

/**
 * 広告プレースホルダーコンポーネント
 * 将来的にGoogle AdSense等に差し替え予定。
 * variant: "banner" (横長), "square" (正方形), "inline" (インライン)
 */
export default function AdPlaceholder({
  variant = "banner",
  className = "",
}: {
  variant?: "banner" | "square" | "inline";
  className?: string;
}) {
  const sizeClasses = {
    banner: "w-full h-[90px] md:h-[100px]",
    square: "w-full max-w-[300px] h-[250px]",
    inline: "w-full h-[60px]",
  };

  return (
    <div
      className={`${sizeClasses[variant]} rounded-[12px] border border-dashed border-border-medium bg-bg-primary flex items-center justify-center gap-2 ${className}`}
    >
      <span className="text-[11px] text-text-muted tracking-wide">
        AD
      </span>
      <span className="text-[11px] text-text-muted">
        — 広告枠（準備中）
      </span>
    </div>
  );
}
