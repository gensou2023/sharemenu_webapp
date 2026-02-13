"use client";

import { useState } from "react";
import Header from "@/components/landing/Header";
import AppSidebar, { type NavItem } from "@/components/AppSidebar";
import AdPlaceholder from "@/components/AdPlaceholder";
import PlanLimitModal from "@/components/PlanLimitModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsSection from "@/components/dashboard/StatsSection";
import QuickActions from "@/components/dashboard/QuickActions";
import SessionGrid from "@/components/dashboard/SessionGrid";
import GalleryStatsSection from "@/components/dashboard/GalleryStatsSection";
import AchievementSection from "@/components/dashboard/AchievementSection";
import AchievementToast from "@/components/AchievementToast";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import ShareModal from "@/components/gallery/ShareModal";
import CommonFooter from "@/components/CommonFooter";
import { useDashboardData, type SessionData } from "@/hooks/useDashboardData";
import { useSessionActions } from "@/hooks/useSessionActions";

const SIDEBAR_NAV: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: "📊", matchExact: true },
  { href: "/chat", label: "新規作成", icon: "✨" },
  { href: "/gallery", label: "ギャラリー", icon: "🖼" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export default function DashboardPage() {
  const { sessions, setSessions, stats, setStats, galleryStats, loading, onboardingCompleted, completeOnboarding, achievements, newBadges, dismissBadge } = useDashboardData();
  const {
    downloading,
    showLimitModal,
    setShowLimitModal,
    deletingOldest,
    deleteTarget,
    setDeleteTarget,
    deletingSession,
    oldestSession,
    handleCreateNew,
    handleDownload,
    handleDeleteConfirm,
    handleDeleteOldestAndCreate,
  } = useSessionActions(sessions, setSessions, stats, setStats);

  const [shareTarget, setShareTarget] = useState<SessionData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="flex mt-[56px]">
        <AppSidebar
          items={SIDEBAR_NAV}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 min-h-[calc(100vh-56px)] bg-bg-primary relative overflow-hidden">
          {/* モバイル用ハンバーガーボタン */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="xl:hidden fixed top-[62px] left-4 z-30 w-9 h-9 rounded-[8px] bg-bg-secondary border border-border-light flex items-center justify-center shadow-sm cursor-pointer hover:bg-bg-primary transition-colors"
            aria-label="メニューを開く"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {/* Background blur decorations */}
          <div className="absolute top-[5%] left-[3%] w-72 h-72 bg-accent-warm/[.04] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-[30%] right-[5%] w-56 h-56 bg-accent-gold/[.05] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[15%] left-[10%] w-48 h-48 bg-accent-olive/[.04] rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[960px] mx-auto px-6 sm:px-10 py-10 relative z-10">
            <DashboardHeader onCreateNew={handleCreateNew} />
            <StatsSection cards={statsCards} loading={loading} />
            <QuickActions onCreateNew={handleCreateNew} />

            {/* ギャラリー成績 */}
            <GalleryStatsSection data={galleryStats} loading={loading} />

            {/* アチーブメント */}
            <AchievementSection
              visible={achievements?.visible || []}
              hidden={achievements?.hidden || []}
              totalHidden={achievements?.totalHidden || 0}
              loading={loading}
            />

            {/* 広告プレースホルダー */}
            <div className="mb-9">
              <AdPlaceholder variant="banner" />
            </div>

            <SessionGrid
              sessions={sessions}
              loading={loading}
              downloading={downloading}
              onDownload={handleDownload}
              onDelete={setDeleteTarget}
              onShare={setShareTarget}
            />
          </div>

          {/* FAQ + フッター */}
          <CommonFooter showFaq />
        </main>
      </div>

      {/* プラン制限モーダル */}
      <PlanLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        sessionCount={sessions.length}
        onDeleteOldest={handleDeleteOldestAndCreate}
        deleting={deletingOldest}
        oldestSessionName={oldestSession?.shop_name || oldestSession?.title}
      />

      {/* ギャラリー共有モーダル */}
      {shareTarget && shareTarget.imageIds?.[0] && (
        <ShareModal
          imageId={shareTarget.imageIds[0]}
          imageUrl={shareTarget.thumbnailUrl || undefined}
          sessionCategory={shareTarget.category || undefined}
          shopName={shareTarget.shop_name || undefined}
          onClose={() => setShareTarget(null)}
          onShared={() => setShareTarget(null)}
        />
      )}

      {/* バッジ獲得トースト */}
      {newBadges.length > 0 && (
        <AchievementToast
          icon={newBadges[0].icon}
          name={newBadges[0].name}
          onClose={dismissBadge}
        />
      )}

      {/* オンボーディングツアー */}
      {onboardingCompleted === false && (
        <OnboardingTour onComplete={completeOnboarding} />
      )}

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
