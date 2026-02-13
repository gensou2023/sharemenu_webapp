"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  matchExact?: boolean;
}

interface AppSidebarProps {
  items: NavItem[];
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AppSidebar({
  items,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.matchExact ? pathname === item.href : pathname.startsWith(item.href);

  const handleToggleClick = () => {
    onToggle();
    if (mobileOpen) onMobileClose();
  };

  return (
    <>
      {/* モバイル: バックドロップ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 xl:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* サイドバー — 画面上端から全高 */}
      <aside
        className={`
          flex flex-col bg-bg-secondary border-r border-border-light flex-shrink-0
          h-screen transition-all duration-300 overflow-hidden
          w-[260px]
          fixed top-0 left-0 z-50
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          xl:static xl:translate-x-0 xl:z-auto
          ${collapsed ? "xl:w-[68px]" : ""}
        `}
      >
        {/* 上部: ハンバーガートグル */}
        <div className="h-[56px] flex items-center px-3 flex-shrink-0">
          <button
            onClick={handleToggleClick}
            className="w-10 h-10 rounded-[10px] flex items-center justify-center cursor-pointer
              bg-transparent border-none text-text-secondary hover:bg-bg-primary transition-colors"
            aria-label="サイドバーを切り替え"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex flex-col gap-1 px-2 flex-1 relative z-10">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`
                flex items-center gap-2.5 rounded-[10px] text-sm no-underline
                transition-all duration-200 relative
                ${collapsed ? "xl:justify-center xl:px-0 xl:py-3" : ""} px-3 py-2.5
                ${isActive(item)
                  ? "bg-bg-primary text-text-primary font-medium shadow-sm"
                  : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              {isActive(item) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-warm rounded-full" />
              )}
              <span className={`text-base ${collapsed ? "xl:text-lg" : ""}`}>
                {item.icon}
              </span>
              <span className={`whitespace-nowrap ${collapsed ? "xl:hidden" : ""}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* 装飾 */}
        <div className="absolute bottom-[10%] left-[-20%] w-40 h-40 bg-accent-warm/[.03] rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-[.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #1A1A1A 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      </aside>
    </>
  );
}
