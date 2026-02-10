"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/landing/Header";
import AdPlaceholder from "@/components/AdPlaceholder";
import PlanLimitModal from "@/components/PlanLimitModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import Link from "next/link";

const FREE_SESSION_LIMIT = 3;

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
  imageUrls: string[];
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

// 画像を一括ダウンロード
async function downloadImages(urls: string[], shopName: string | null) {
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i]);
      const blob = await res.blob();
      const ext = blob.type.includes("png") ? "png" : "jpg";
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${shopName || "menucraft"}-${i + 1}.${ext}`;
      link.click();
      URL.revokeObjectURL(link.href);
      // 連続ダウンロードの間隔を少し空ける
      if (i < urls.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch {
      // 個別のダウンロード失敗は無視
    }
  }
}

// Stats accent color map
const statsAccentMap = {
  warm: {
    iconBg: "bg-accent-warm/10",
    iconText: "text-accent-warm",
    topBar: "bg-accent-warm",
    subText: "text-accent-warm",
    hoverBorder: "hover:border-accent-warm/30",
    hoverShadow: "hover:shadow-[0_8px_30px_rgba(232,113,58,.08)]",
  },
  gold: {
    iconBg: "bg-accent-gold/10",
    iconText: "text-accent-gold",
    topBar: "bg-accent-gold",
    subText: "text-accent-gold",
    hoverBorder: "hover:border-accent-gold/30",
    hoverShadow: "hover:shadow-[0_8px_30px_rgba(212,168,83,.08)]",
  },
  olive: {
    iconBg: "bg-accent-olive/10",
    iconText: "text-accent-olive",
    topBar: "bg-accent-olive",
    subText: "text-accent-olive",
    hoverBorder: "hover:border-accent-olive/30",
    hoverShadow: "hover:shadow-[0_8px_30px_rgba(123,138,100,.08)]",
  },
} as const;

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [deletingOldest, setDeletingOldest] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SessionData | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

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

  // セッション削除
  async function deleteSession(sessionId: string) {
    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("削除に失敗しました");
    }
  }

  // 個別セッション削除の確定
  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeletingSession(true);
    try {
      await deleteSession(deleteTarget.id);
      setSessions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      // stats を更新
      if (stats) {
        setStats({
          ...stats,
          totalImages: stats.totalImages - deleteTarget.imageCount,
          recentSessions: Math.max(0, stats.recentSessions - 1),
        });
      }
      setDeleteTarget(null);
    } catch {
      alert("削除に失敗しました。もう一度お試しください。");
    } finally {
      setDeletingSession(false);
    }
  }

  // 古いセッションを削除して新規作成
  async function handleDeleteOldestAndCreate() {
    const oldest = [...sessions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0];
    if (!oldest) return;

    setDeletingOldest(true);
    try {
      await deleteSession(oldest.id);
      setSessions((prev) => prev.filter((s) => s.id !== oldest.id));
      setShowLimitModal(false);
      // 削除成功後、チャットページへ遷移
      router.push("/chat");
    } catch {
      alert("削除に失敗しました。もう一度お試しください。");
    } finally {
      setDeletingOldest(false);
    }
  }

  // 一番古いセッション名を取得
  const oldestSession = [...sessions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )[0];

  // 新規作成ハンドラー
  const handleCreateNew = () => {
    if (sessions.length >= FREE_SESSION_LIMIT) {
      setShowLimitModal(true);
    } else {
      router.push("/chat");
    }
  };

  const statsCards = [
    {
      label: "総生成数",
      value: stats ? String(stats.totalImages) : "—",
      sub: stats ? `画像 ${stats.totalImages} 枚` : "",
      accent: "warm" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      ),
    },
    {
      label: "今月の生成",
      value: stats ? String(stats.monthlyImages) : "—",
      sub: "残り: 無制限（Pro）",
      accent: "gold" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      label: "保存セッション",
      value: stats ? String(stats.recentSessions) : "—",
      sub: "直近30日間",
      accent: "olive" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Header activeTab="dashboard" />
      <main className="mt-[56px] min-h-[calc(100vh-56px)] bg-bg-primary relative overflow-hidden">
        {/* Background blur decorations */}
        <div className="absolute top-[5%] left-[3%] w-72 h-72 bg-accent-warm/[.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[30%] right-[5%] w-56 h-56 bg-accent-gold/[.05] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[15%] left-[10%] w-48 h-48 bg-accent-olive/[.04] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1080px] mx-auto px-6 sm:px-10 py-10 relative z-10">
          {/* ヘッダー部分 */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-2">
                Dashboard
              </span>
              <h1 className="font-[family-name:var(--font-playfair)] text-[32px] font-bold">
                ダッシュボード
              </h1>
              <p className="text-text-secondary text-sm mt-1.5">
                生成履歴と統計
              </p>
              {/* Decorative line */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-[2px] bg-accent-warm/30 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-accent-warm/40" />
                <div className="w-8 h-[2px] bg-accent-warm/30 rounded-full" />
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-warm text-white rounded-full text-[15px] font-semibold shadow-[0_4px_20px_rgba(232,113,58,.25)] hover:-translate-y-0.5 hover:bg-accent-warm-hover hover:shadow-[0_8px_30px_rgba(232,113,58,.3)] transition-all duration-300 cursor-pointer border-none"
            >
              新しいメニューを作成
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-9">
            {statsCards.map((stat) => {
              const colors = statsAccentMap[stat.accent];
              return (
                <div
                  key={stat.label}
                  className={`bg-bg-secondary rounded-[20px] p-6 border border-border-light relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${colors.hoverBorder} ${colors.hoverShadow}`}
                >
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] ${colors.topBar} opacity-60`} />

                  {/* Icon + label row */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`w-9 h-9 rounded-xl ${colors.iconBg} ${colors.iconText} flex items-center justify-center`}>
                      {stat.icon}
                    </div>
                    <div className="text-xs text-text-muted uppercase tracking-[1px]">
                      {stat.label}
                    </div>
                  </div>

                  <div className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
                    {loading ? (
                      <div className="w-12 h-10 bg-border-light rounded animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className={`text-xs mt-1.5 ${colors.subText}`}>
                    {stat.sub}
                  </div>
                </div>
              );
            })}
          </div>

          {/* クイックアクション */}
          <div className="flex flex-wrap gap-3 mb-9">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-warm/10 text-accent-warm text-[13px] font-semibold border border-accent-warm/20 transition-all duration-300 hover:bg-accent-warm hover:text-white hover:shadow-[0_4px_16px_rgba(232,113,58,.2)] cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              新規作成
            </button>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-gold/10 text-accent-gold text-[13px] font-semibold border border-accent-gold/20 transition-all duration-300 hover:bg-accent-gold hover:text-white hover:shadow-[0_4px_16px_rgba(212,168,83,.2)] no-underline"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              チャットを開く
            </Link>
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-olive/10 text-accent-olive text-[13px] font-semibold border border-accent-olive/20 transition-all duration-300 hover:bg-accent-olive hover:text-white hover:shadow-[0_4px_16px_rgba(123,138,100,.2)] no-underline"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              プラン変更
            </Link>
          </div>

          {/* 広告プレースホルダー */}
          <div className="mb-9">
            <AdPlaceholder variant="banner" />
          </div>

          {/* 生成履歴 */}
          <section>
            <div className="mb-6">
              <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-2">
                History
              </span>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                生成履歴
              </h2>
              {/* Decorative line */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-[2px] bg-accent-warm/20 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-accent-warm/30" />
                <div className="w-8 h-[2px] bg-accent-warm/20 rounded-full" />
              </div>
            </div>

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
              /* 空状態 — リッチデザイン */
              <div className="text-center py-20 relative">
                {/* Decorative background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 bg-accent-warm/[.04] rounded-full blur-2xl" />
                </div>

                <div className="relative z-10">
                  {/* Emoji with decorative ring */}
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent-warm/[.06] border border-accent-warm/10 mb-6">
                    <span className="text-5xl">🍽</span>
                  </div>

                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2 text-text-primary">
                    まだ生成履歴がありません
                  </h3>
                  <p className="text-sm text-text-muted mb-6 max-w-[320px] mx-auto leading-relaxed">
                    AIとチャットするだけで、プロ品質のメニュー画像を作成できます
                  </p>
                  <Link
                    href="/chat"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-warm text-white rounded-full text-[15px] font-semibold no-underline transition-all duration-300 hover:bg-accent-warm-hover hover:shadow-[0_4px_20px_rgba(232,113,58,.3)] hover:-translate-y-0.5"
                  >
                    最初のメニューを作成
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sessions.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/chat?session=${item.id}`}
                    className="group bg-bg-secondary rounded-[20px] border border-border-light overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(26,23,20,.12)] hover:border-accent-warm/20 no-underline text-text-primary"
                  >
                    {/* サムネイル */}
                    <div
                      className="h-40 relative flex items-end overflow-hidden"
                      style={{
                        background: item.thumbnailUrl
                          ? `url(${item.thumbnailUrl}) center/cover`
                          : gradients[idx % gradients.length],
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
                          item.status === "completed"
                            ? "bg-accent-olive"
                            : "bg-accent-warm"
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
                                setDownloading(item.id);
                                downloadImages(item.imageUrls, item.shop_name).finally(() =>
                                  setDownloading(null)
                                );
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
                              setDeleteTarget(item);
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
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* プラン制限モーダル */}
      <PlanLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        sessionCount={sessions.length}
        onDeleteOldest={handleDeleteOldestAndCreate}
        deleting={deletingOldest}
        oldestSessionName={oldestSession?.shop_name || oldestSession?.title}
      />

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        shopName={deleteTarget?.shop_name || deleteTarget?.title || ""}
        loading={deletingSession}
      />
    </>
  );
}
