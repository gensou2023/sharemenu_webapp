"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "ダッシュボード", icon: "📊" },
  { href: "/admin/revenue", label: "売上管理", icon: "💰" },
  { href: "/admin/sessions", label: "セッション一覧", icon: "💬" },
  { href: "/admin/users", label: "ユーザー管理", icon: "👥" },
  { href: "/admin/moderation", label: "モデレーション", icon: "🛡" },
  { href: "/admin/prompts", label: "プロンプト管理", icon: "📝" },
  { href: "/admin/references", label: "参考画像", icon: "🖼" },
  { href: "/admin/api-logs", label: "API利用ログ", icon: "📈" },
  { href: "/admin/release-notes", label: "リリースノート", icon: "📢" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* 管理画面ヘッダー */}
      <header className="fixed top-0 left-0 right-0 h-[52px] bg-bg-dark text-white flex items-center px-6 z-50">
        <Link href="/admin" className="font-semibold text-sm no-underline text-white flex items-center gap-2">
          <span className="text-accent-warm">MenuCraft</span>
          <span className="text-xs px-2 py-0.5 rounded bg-accent-warm text-white font-bold">ADMIN</span>
        </Link>
        {/* ヘッダー装飾アクセント */}
        <div className="ml-4 flex items-center gap-1.5 opacity-40">
          <div className="w-1 h-1 rounded-full bg-accent-gold" />
          <div className="w-6 h-[1px] bg-gradient-to-r from-accent-gold to-transparent" />
        </div>
        <div className="flex-1" />
        <Link
          href="/dashboard"
          className="text-xs text-white/60 hover:text-white no-underline transition-colors"
        >
          ユーザー画面に戻る
        </Link>
      </header>

      <div className="flex mt-[52px]">
        {/* サイドバー */}
        <aside className="w-[220px] min-h-[calc(100vh-52px)] bg-bg-secondary border-r border-border-light flex-shrink-0 py-4 relative overflow-hidden">
          {/* サイドバー ブラーサークル（控えめ） */}
          <div className="absolute bottom-[10%] left-[-20%] w-40 h-40 bg-accent-warm/[.03] rounded-full blur-3xl pointer-events-none" />

          {/* サイドバー下部 ドットパターン */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-[.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #1A1A1A 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <nav className="flex flex-col gap-1 px-3 relative z-10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-sm no-underline transition-all duration-200 relative ${
                  isActive(item.href)
                    ? "bg-bg-primary text-text-primary font-medium shadow-sm"
                    : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                }`}
              >
                {/* アクティブ時の左端アクセントバー */}
                {isActive(item.href) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-warm rounded-full" />
                )}
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
