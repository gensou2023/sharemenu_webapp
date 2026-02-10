"use client";

import { useState, useEffect } from "react";
import Header from "@/components/landing/Header";
import Link from "next/link";

type SessionData = {
  id: string;
  title: string;
  status: "active" | "completed";
  shop_name: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  imageCount: number;
  thumbnailUrl: string | null;
};

type StatsData = {
  totalImages: number;
  monthlyImages: number;
  recentSessions: number;
};

// カテゴリから絵文字を推定
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

// グラデーションカラー
const gradients = [
  "linear-gradient(135deg, #3D3530, #5C4F45)",
  "linear-gradient(135deg, #4A5940, #6B7A5E)",
  "linear-gradient(135deg, #5C3A28, #8B5E3C)",
  "linear-gradient(135deg, #2C3E50, #4A6B8A)",
  "linear-gradient(135deg, #4A3040, #7A5068)",
];

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
          setStats(data.stats || null);
        }
      } catch {
        // API失敗時はフォールバック表示
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statsCards = [
    {
      label: "総生成数",
      value: stats ? String(stats.totalImages) : "—",
      sub: stats ? `画像 ${stats.totalImages} 枚` : "",
      subColor: "text-accent-olive",
    },
    {
      label: "今月の生成",
      value: stats ? String(stats.monthlyImages) : "—",
      sub: "残り: 無制限（Pro）",
      subColor: "text-accent-olive",
    },
    {
      label: "保存セッション",
      value: stats ? String(stats.recentSessions) : "—",
      sub: "直近30日間",
      subColor: "text-accent-olive",
    },
  ];

  return (
    <>
      <Header activeTab="dashboard" />
      <main className="mt-[52px] min-h-[calc(100vh-52px)] bg-bg-primary">
        <div className="max-w-[1080px] mx-auto px-6 sm:px-10 py-10">
          {/* ヘッダー部分 */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="font-[family-name:var(--font-playfair)] text-[32px] font-bold">
                ダッシュボード
              </h1>
              <p className="text-text-secondary text-sm mt-1.5">
                生成履歴と統計
              </p>
            </div>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-bg-dark text-text-inverse rounded-[28px] text-sm font-semibold shadow-[0_4px_24px_rgba(26,23,20,.10)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(26,23,20,.14)] transition-all duration-300 no-underline"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              新しいメニューを作成
            </Link>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-9">
            {statsCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-bg-secondary rounded-[20px] p-6 border border-border-light"
              >
                <div className="text-xs text-text-muted uppercase tracking-[1px] mb-2">
                  {stat.label}
                </div>
                <div className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
                  {loading ? (
                    <div className="w-12 h-10 bg-border-light rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className={`text-xs mt-1 ${stat.subColor}`}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

          {/* 生成履歴 */}
          <section>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              生成履歴
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-bg-secondary rounded-[20px] border border-border-light overflow-hidden">
                    <div className="h-40 bg-border-light animate-pulse" />
                    <div className="p-4">
                      <div className="w-24 h-4 bg-border-light rounded animate-pulse mb-2" />
                      <div className="w-40 h-3 bg-border-light rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-16 text-text-muted">
                <div className="text-5xl mb-4">🍽</div>
                <p className="text-sm">まだ生成履歴がありません</p>
                <Link
                  href="/chat"
                  className="inline-block mt-4 px-6 py-2.5 bg-accent-warm text-white rounded-[28px] text-sm font-semibold no-underline hover:bg-accent-warm-hover transition-colors"
                >
                  最初のメニューを作成
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sessions.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/chat?session=${item.id}`}
                    className="group bg-bg-secondary rounded-[20px] border border-border-light overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(26,23,20,.10)] no-underline text-text-primary"
                  >
                    {/* サムネイル */}
                    <div
                      className="h-40 relative flex items-end"
                      style={{
                        background: item.thumbnailUrl
                          ? `url(${item.thumbnailUrl}) center/cover`
                          : gradients[idx % gradients.length],
                      }}
                    >
                      <span
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-semibold text-white z-10 ${
                          item.status === "completed"
                            ? "bg-accent-olive"
                            : "bg-accent-warm"
                        }`}
                      >
                        {item.status === "completed" ? "完了" : "進行中"}
                      </span>
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[60px]"
                        style={{
                          background: "linear-gradient(transparent, rgba(26,23,20,.5))",
                        }}
                      />
                      <span className="text-5xl absolute bottom-4 left-4 z-10 drop-shadow-[0_4px_16px_rgba(0,0,0,.3)]">
                        {getCategoryEmoji(item.category, item.shop_name)}
                      </span>
                    </div>

                    {/* 情報 */}
                    <div className="p-4">
                      <div className="font-semibold text-[15px] mb-1">
                        {item.shop_name || item.title}
                      </div>
                      <div className="text-xs text-text-muted flex gap-3">
                        <span>{item.category || "—"}</span>
                        <span>{new Date(item.created_at).toLocaleDateString("ja-JP")}</span>
                        <span>画像 {item.imageCount}枚</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
