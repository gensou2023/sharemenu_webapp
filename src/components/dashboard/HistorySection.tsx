import Link from "next/link";

type HistoryItem = {
  emoji: string;
  shopName: string;
  category: string;
  date: string;
  imageCount: string;
  status: "complete" | "progress";
  gradient: string;
};

const historyItems: HistoryItem[] = [
  {
    emoji: "🍜",
    shopName: "麺屋 一番星",
    category: "ラーメン",
    date: "2026/02/08",
    imageCount: "画像 3枚",
    status: "complete",
    gradient: "linear-gradient(135deg, #3D3530, #5C4F45)",
  },
  {
    emoji: "🍵",
    shopName: "茶寮 さくら",
    category: "和カフェ",
    date: "2026/02/05",
    imageCount: "画像 6枚",
    status: "complete",
    gradient: "linear-gradient(135deg, #4A5940, #6B7A5E)",
  },
  {
    emoji: "🥩",
    shopName: "焼肉 炎",
    category: "焼肉",
    date: "2026/02/09",
    imageCount: "ヒアリング中",
    status: "progress",
    gradient: "linear-gradient(135deg, #5C3A28, #8B5E3C)",
  },
];

function StatusBadge({ status }: { status: "complete" | "progress" }) {
  if (status === "complete") {
    return (
      <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent-olive text-white z-10">
        完了
      </span>
    );
  }
  return (
    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent-warm text-white z-10">
      進行中
    </span>
  );
}

export default function HistorySection() {
  return (
    <section>
      <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
        📁 生成履歴
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {historyItems.map((item) => (
          <Link
            key={item.shopName}
            href="/chat"
            className="group bg-bg-secondary rounded-[20px] border border-border-light overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(26,23,20,.10)] no-underline text-text-primary"
          >
            {/* サムネイル */}
            <div
              className="h-40 relative flex items-end"
              style={{ background: item.gradient }}
            >
              <StatusBadge status={item.status} />
              {/* 下グラデーション */}
              <div className="absolute bottom-0 left-0 right-0 h-[60px]" style={{
                background: "linear-gradient(transparent, rgba(26,23,20,.5))"
              }} />
              <span className="text-5xl absolute bottom-4 left-4 z-10 drop-shadow-[0_4px_16px_rgba(0,0,0,.3)]">
                {item.emoji}
              </span>
            </div>

            {/* 情報 */}
            <div className="p-4">
              <div className="font-semibold text-[15px] mb-1">{item.shopName}</div>
              <div className="text-xs text-text-muted flex gap-3">
                <span>{item.category}</span>
                <span>{item.date}</span>
                <span>{item.imageCount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
