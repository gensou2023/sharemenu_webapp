import Link from "next/link";
import type { SessionData } from "@/hooks/useDashboardData";

const gradients = [
  "linear-gradient(135deg, #3D3530, #5C4F45)",
  "linear-gradient(135deg, #4A5940, #6B7A5E)",
  "linear-gradient(135deg, #5C3A28, #8B5E3C)",
  "linear-gradient(135deg, #2C3E50, #4A6B8A)",
  "linear-gradient(135deg, #4A3040, #7A5068)",
];

function getCategoryEmoji(category: string | null, shopName: string | null): string {
  const text = `${category || ""} ${shopName || ""}`;
  if (/ラーメン|麺|つけ麺/.test(text)) return "🍜";
  if (/カフェ|茶|コーヒー/.test(text)) return "🍵";
  if (/焼肉|肉|ステーキ/.test(text)) return "🥩";
  if (/寿司|鮨|刺身/.test(text)) return "🍣";
  if (/イタリアン|パスタ|ピザ/.test(text)) return "🍝";
  if (/中華|餃子/.test(text)) return "🥟";
  if (/居酒屋|酒/.test(text)) return "🍶";
  if (/パン|ベーカリー/.test(text)) return "🍞";
  return "🍽";
}

export default function SessionCard({
  item,
  index,
  downloading,
  onDownload,
  onDelete,
}: {
  item: SessionData;
  index: number;
  downloading: string | null;
  onDownload: (item: SessionData) => void;
  onDelete: (item: SessionData) => void;
}) {
  return (
    <Link
      href={`/chat?session=${item.id}`}
      className="group bg-bg-secondary rounded-[20px] border border-border-light overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(26,23,20,.12)] hover:border-accent-warm/20 no-underline text-text-primary"
    >
      {/* サムネイル */}
      <div
        className="h-40 relative flex items-end overflow-hidden"
        style={{
          background: item.thumbnailUrl
            ? `url(${item.thumbnailUrl}) center/cover`
            : gradients[index % gradients.length],
        }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[.06] z-[1]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-semibold text-white z-10 ${
            item.status === "completed" ? "bg-accent-olive" : "bg-accent-warm"
          }`}
        >
          {item.status === "completed" ? "完了" : "進行中"}
        </span>
        <div
          className="absolute bottom-0 left-0 right-0 h-[60px] z-[2]"
          style={{
            background: "linear-gradient(transparent, rgba(26,23,20,.5))",
          }}
        />
        <span className="text-5xl absolute bottom-4 left-4 z-10 drop-shadow-[0_4px_16px_rgba(0,0,0,.3)] transition-transform duration-300 group-hover:scale-110">
          {getCategoryEmoji(item.category, item.shop_name)}
        </span>
      </div>

      {/* 情報 */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="font-semibold text-[15px] truncate mr-2">
            {item.shop_name || item.title}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* ダウンロードボタン */}
            {item.imageCount > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDownload(item);
                }}
                disabled={downloading === item.id}
                title="画像を一括ダウンロード"
                className="w-8 h-8 rounded-[8px] border border-border-light bg-bg-primary cursor-pointer flex items-center justify-center transition-all duration-300 text-text-secondary hover:bg-accent-warm hover:text-white hover:border-accent-warm flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {downloading === item.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2M8 2v9m0 0L5 8m3 3l3-3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            )}
            {/* 削除ボタン */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(item);
              }}
              title="セッションを削除"
              className="w-8 h-8 rounded-[8px] border border-border-light bg-bg-primary cursor-pointer flex items-center justify-center transition-all duration-300 text-text-secondary hover:bg-red-500 hover:text-white hover:border-red-500 flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="text-xs text-text-muted flex gap-3">
          <span>{item.category || "—"}</span>
          <span>{new Date(item.created_at).toLocaleDateString("ja-JP")}</span>
          <span>画像 {item.imageCount}枚</span>
        </div>
      </div>
    </Link>
  );
}
