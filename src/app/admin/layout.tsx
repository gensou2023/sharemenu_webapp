import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "ダッシュボード", icon: "📊" },
  { href: "/admin/sessions", label: "セッション一覧", icon: "💬" },
  { href: "/admin/prompts", label: "プロンプト管理", icon: "📝" },
  { href: "/admin/references", label: "参考画像", icon: "🖼" },
  { href: "/admin/api-logs", label: "API利用ログ", icon: "📈" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* 管理画面ヘッダー */}
      <header className="fixed top-0 left-0 right-0 h-[52px] bg-[#1A1714] text-white flex items-center px-6 z-50">
        <Link href="/admin" className="font-semibold text-sm no-underline text-white flex items-center gap-2">
          <span className="text-accent-warm">MenuCraft</span>
          <span className="text-xs px-2 py-0.5 rounded bg-accent-warm text-white font-bold">ADMIN</span>
        </Link>
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
        <aside className="w-[220px] min-h-[calc(100vh-52px)] bg-bg-secondary border-r border-border-light flex-shrink-0 py-4">
          <nav className="flex flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-sm text-text-secondary no-underline transition-all duration-200 hover:bg-bg-primary hover:text-text-primary"
              >
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
