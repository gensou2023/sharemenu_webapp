"use client";

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import AdPlaceholder from "@/components/AdPlaceholder";
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

export default function DashboardPage() {
  const { sessions, setSessions, stats, setStats, galleryStats, loading, achievementsLoading, userName, userRole, onboardingCompleted, completeOnboarding, achievements, newBadges, dismissBadge } = useDashboardData();
  const {
    downloading,
    deleteTarget,
    setDeleteTarget,
    deletingSession,
    handleCreateNew,
    handleDownload,
    handleDeleteConfirm,
  } = useSessionActions(sessions, setSessions, stats, setStats);

  const [shareTarget, setShareTarget] = useState<SessionData | null>(null);

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
      label: "公開数",
      value: galleryStats ? String(galleryStats.sharedCount) : "—",
      sub: "ギャラリーに共有した数",
      accent: "gold" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
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
    <AppLayout>
      <main className="min-h-full relative overflow-hidden">
        {/* Background blur decorations */}
        <div className="absolute top-[5%] left-[3%] w-72 h-72 bg-accent-warm/[.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[30%] right-[5%] w-56 h-56 bg-accent-gold/[.05] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[15%] left-[10%] w-48 h-48 bg-accent-olive/[.04] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[960px] mx-auto px-6 sm:px-10 py-10 relative z-10">
          <DashboardHeader onCreateNew={handleCreateNew} userName={userName} stats={stats} userRole={userRole} sessionCount={sessions.length} />
          <QuickActions onCreateNew={handleCreateNew} />
          <StatsSection cards={statsCards} loading={loading} />

          <SessionGrid
            sessions={sessions}
            loading={loading}
            downloading={downloading}
            onDownload={handleDownload}
            onDelete={setDeleteTarget}
            onShare={setShareTarget}
            onCreateNew={handleCreateNew}
          />

          <GalleryStatsSection data={galleryStats} loading={loading} />

          <AchievementSection
            visible={achievements?.visible || []}
            hidden={achievements?.hidden || []}
            totalHidden={achievements?.totalHidden || 0}
            loading={achievementsLoading}
          />

          <div className="mt-9">
            <AdPlaceholder variant="banner" />
          </div>
        </div>

        <CommonFooter showFaq />
      </main>

      {/* モーダル群 */}
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

      {newBadges.length > 0 && (
        <AchievementToast
          icon={newBadges[0].icon}
          name={newBadges[0].name}
          onClose={dismissBadge}
        />
      )}

      {onboardingCompleted === false && (
        <OnboardingTour onComplete={completeOnboarding} />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        shopName={deleteTarget?.shop_name || deleteTarget?.title || ""}
        loading={deletingSession}
      />
    </AppLayout>
  );
}
