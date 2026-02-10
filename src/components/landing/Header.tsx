"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

type HeaderProps = {
  activeTab?: "home" | "dashboard" | "chat" | "settings";
};

const navItems = [
  { key: "home", label: "ホーム", href: "/" },
  { key: "dashboard", label: "ダッシュボード", href: "/dashboard" },
  { key: "chat", label: "チャット", href: "/chat" },
] as const;

export default function Header({ activeTab = "home" }: HeaderProps) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const userName = session?.user?.name || "ゲスト";
  const userInitial = userName.charAt(0);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-dark flex items-center px-6 h-[52px]">
      {/* Brand Logo */}
      <Link
        href="/"
        className="font-[family-name:var(--font-playfair)] text-accent-gold text-lg font-bold tracking-wide mr-9 flex items-center gap-2 no-underline"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#D4A853" strokeWidth="2" />
          <path
            d="M8 14s1.5 2 4 2 4-2 4-2"
            stroke="#D4A853"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="9" cy="10" r="1" fill="#D4A853" />
          <circle cx="15" cy="10" r="1" fill="#D4A853" />
        </svg>
        MenuCraft AI
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`py-3.5 px-5 text-[13px] font-medium border-b-2 transition-all duration-300 no-underline ${
              activeTab === item.key
                ? "text-text-inverse border-accent-gold"
                : "text-text-muted border-transparent hover:text-[#D5CFC7]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* モバイルハンバーガーメニューボタン */}
      <button
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        className="md:hidden w-8 h-8 flex items-center justify-center text-text-muted cursor-pointer bg-transparent border-none"
        aria-label="メニュー"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {mobileNavOpen ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <>
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Menu */}
      {session?.user ? (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 text-text-muted text-[13px] cursor-pointer bg-transparent border-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-warm to-accent-gold flex items-center justify-center text-white text-[13px] font-semibold">
              {userInitial}
            </div>
            <span className="hidden sm:inline">{userName}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="hidden sm:inline">
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
              <div className="absolute right-0 top-full mt-2 w-48 bg-bg-secondary rounded-[12px] border border-border-light shadow-[0_8px_30px_rgba(0,0,0,.12)] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border-light">
                  <div className="text-sm font-semibold text-text-primary">{userName}</div>
                  <div className="text-xs text-text-muted">{session.user.email}</div>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-primary no-underline transition-colors duration-200"
                >
                  ⚙ アカウント設定
                </Link>
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-primary no-underline transition-colors duration-200 border-b border-border-light"
                  >
                    🛠 管理画面
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-bg-primary cursor-pointer bg-transparent border-none transition-colors duration-200"
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
          className="text-text-muted text-[13px] no-underline hover:text-text-inverse transition-colors"
        >
          ログイン
        </Link>
      )}
      {/* モバイルナビゲーション */}
      {mobileNavOpen && (
        <>
          <div className="fixed inset-0 top-[52px] z-40 bg-black/30 md:hidden" onClick={() => setMobileNavOpen(false)} />
          <nav className="absolute left-0 right-0 top-[52px] bg-bg-dark border-t border-border-light z-50 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`block px-6 py-3.5 text-[14px] font-medium border-l-3 transition-all no-underline ${
                  activeTab === item.key
                    ? "text-accent-gold border-l-accent-gold bg-white/5"
                    : "text-text-muted border-l-transparent hover:text-[#D5CFC7]"
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
