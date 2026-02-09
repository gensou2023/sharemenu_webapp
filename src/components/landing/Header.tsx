"use client";

import Link from "next/link";

type HeaderProps = {
  activeTab?: "home" | "dashboard" | "chat";
};

const navItems = [
  { key: "home", label: "ホーム", href: "/" },
  { key: "dashboard", label: "ダッシュボード", href: "/dashboard" },
  { key: "chat", label: "チャット", href: "/chat" },
] as const;

export default function Header({ activeTab = "home" }: HeaderProps) {
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* User */}
      <div className="flex items-center gap-2.5 text-text-muted text-[13px]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-warm to-accent-gold flex items-center justify-center text-white text-[13px] font-semibold">
          田
        </div>
        <span className="hidden sm:inline">田中オーナー</span>
      </div>
    </header>
  );
}
