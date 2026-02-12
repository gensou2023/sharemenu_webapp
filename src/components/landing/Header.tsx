"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

type HeaderProps = {
  activeTab?: "home" | "dashboard" | "chat" | "gallery" | "settings" | "pricing";
};

const guestNavItems = [
  { key: "home", label: "ホーム", href: "/" },
  { key: "gallery", label: "ギャラリー", href: "/gallery" },
  { key: "pricing", label: "料金プラン", href: "/#pricing" },
] as const;

const authNavItems = [
  { key: "dashboard", label: "ダッシュボード", href: "/dashboard" },
  { key: "chat", label: "チャット", href: "/chat" },
  { key: "gallery", label: "ギャラリー", href: "/gallery" },
] as const;

export default function Header({ activeTab = "home" }: HeaderProps) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isLoggedIn = !!session?.user;
  const navItems = isLoggedIn ? authNavItems : guestNavItems;
  const userName = session?.user?.name || "ゲスト";
  const userInitial = userName.charAt(0);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border-light flex items-center px-6 h-[56px]">
      {/* Brand Logo */}
      <Link
        href="/"
        className="font-[family-name:var(--font-playfair)] text-lg font-bold tracking-wide mr-9 flex items-center gap-2.5 no-underline"
      >
        <div className="w-8 h-8 rounded-full bg-accent-warm flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="2" />
            <path
              d="M8 14s1.5 2 4 2 4-2 4-2"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="9" cy="10" r="1" fill="#FFFFFF" />
            <circle cx="15" cy="10" r="1" fill="#FFFFFF" />
          </svg>
        </div>
        <span className="text-text-primary">MenuCraft AI</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`py-2 px-4 text-[13px] font-medium rounded-full transition-all duration-200 no-underline ${
              activeTab === item.key
                ? "bg-accent-warm text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        className="md:hidden w-9 h-9 flex items-center justify-center text-text-secondary cursor-pointer bg-transparent border-none rounded-lg hover:bg-bg-tertiary transition-colors"
        aria-label="メニュー"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {mobileNavOpen ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* User Menu */}
        {session?.user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 text-text-secondary text-[13px] cursor-pointer bg-transparent border-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-warm to-accent-gold flex items-center justify-center text-white text-[13px] font-semibold">
                {userInitial}
              </div>
              <span className="hidden sm:inline text-text-primary font-medium">{userName}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="hidden sm:inline text-text-muted">
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
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
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 cursor-pointer bg-transparent border-none transition-colors duration-200"
                  >
                    ログアウト
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="py-2 px-5 rounded-full bg-accent-warm text-white text-[13px] font-semibold no-underline hover:bg-accent-warm-hover transition-colors"
          >
            ログイン
          </Link>
        )}
      </div>

      {/* Mobile Navigation */}
      {mobileNavOpen && (
        <>
          <div className="fixed inset-0 top-[56px] z-40 bg-black/20 md:hidden" onClick={() => setMobileNavOpen(false)} />
          <nav className="absolute left-0 right-0 top-[56px] bg-bg-secondary border-b border-border-light shadow-lg z-50 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`block px-6 py-3.5 text-[14px] font-medium border-l-3 transition-all no-underline ${
                  activeTab === item.key
                    ? "text-accent-warm border-l-accent-warm bg-accent-warm-light"
                    : "text-text-secondary border-l-transparent hover:bg-bg-tertiary hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
