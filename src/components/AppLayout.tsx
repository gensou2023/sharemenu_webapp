"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import AppSidebar, { type NavItem } from "@/components/AppSidebar";
import NotificationBell from "@/components/NotificationBell";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";

const SIDEBAR_NAV: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: "📊", matchExact: true },
  { href: "/chat", label: "新規作成", icon: "✨" },
  { href: "/gallery", label: "ギャラリー", icon: "🖼" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

type AppLayoutProps = {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  noScroll?: boolean;
};

export default function AppLayout({ children, defaultCollapsed = false, noScroll = false }: AppLayoutProps) {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { notifications, unreadCount, loading: notifLoading, isOpen: notifOpen, setIsOpen: setNotifOpen, markAsRead, markAllAsRead } = useNotifications();

  const userName = session?.user?.name || "ゲスト";
  const userInitial = userName.charAt(0);

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* サイドバー */}
      <AppSidebar
        items={SIDEBAR_NAV}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* メインエリア */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* スリムヘッダー: ロゴ + プランバッジ + アバター */}
        <header className="h-[56px] flex items-center px-4 sm:px-6 border-b border-border-light flex-shrink-0 bg-white/95 backdrop-blur-md relative z-20">
          {/* モバイル: ハンバーガー */}
          <button
            onClick={() => setMobileOpen(true)}
            className="xl:hidden w-10 h-10 rounded-[10px] flex items-center justify-center cursor-pointer
              mr-2 bg-transparent border-none text-text-secondary hover:bg-bg-tertiary transition-colors"
            aria-label="メニューを開く"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {/* ブランドロゴ */}
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-lg font-bold tracking-wide no-underline flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-accent-warm flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="2" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <circle cx="9" cy="10" r="1" fill="#FFFFFF" />
                <circle cx="15" cy="10" r="1" fill="#FFFFFF" />
              </svg>
            </div>
            <span className="text-text-primary hidden sm:inline">MenuCraft AI</span>
          </Link>

          <div className="flex-1" />

          {/* プランバッジ */}
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/20 mr-3">
            Free
          </span>

          {/* 通知ベル */}
          {session?.user && (
            <div className="relative">
              <NotificationBell
                unreadCount={unreadCount}
                onClick={() => setNotifOpen(!notifOpen)}
              />
              {notifOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  loading={notifLoading}
                  onClose={() => setNotifOpen(false)}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />
              )}
            </div>
          )}

          {/* ユーザーメニュー */}
          {session?.user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center cursor-pointer bg-transparent border-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-warm to-accent-gold flex items-center justify-center text-white text-[13px] font-semibold">
                  {userInitial}
                </div>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-bg-secondary rounded-2xl border border-border-light shadow-[0_8px_30px_rgba(0,0,0,.10)] z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-light">
                      <div className="text-sm font-semibold text-text-primary">{userName}</div>
                      <div className="text-xs text-text-muted mt-0.5">{session.user.email}</div>
                    </div>
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-tertiary no-underline transition-colors duration-200"
                    >
                      &#9881; アカウント設定
                    </Link>
                    {session.user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-tertiary no-underline transition-colors duration-200 border-b border-border-light"
                      >
                        &#128736; 管理画面
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 cursor-pointer bg-transparent border-none transition-colors duration-200"
                    >
                      ログアウト
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        {/* コンテンツエリア */}
        <div className={`flex-1 ${noScroll ? "overflow-hidden" : "overflow-y-auto"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
