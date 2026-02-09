import Header from "@/components/landing/Header";
import StatsSection from "@/components/dashboard/StatsSection";
import HistorySection from "@/components/dashboard/HistorySection";
import Link from "next/link";

export default function DashboardPage() {
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
          <StatsSection />

          {/* 生成履歴 */}
          <HistorySection />
        </div>
      </main>
    </>
  );
}
