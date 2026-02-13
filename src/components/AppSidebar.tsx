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
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSidebar({ items, isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.matchExact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      {/* モバイル/タブレット: バックドロップ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 xl:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`
          w-[220px] min-h-[calc(100vh-56px)] bg-bg-secondary border-r border-border-light
          flex-shrink-0 py-4 relative overflow-hidden
          xl:static xl:translate-x-0 xl:block
          fixed top-[56px] left-0 z-50 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
        `}
      >
        {/* ブラーサークル装飾 */}
        <div className="absolute bottom-[10%] left-[-20%] w-40 h-40 bg-accent-warm/[.03] rounded-full blur-3xl pointer-events-none" />

        {/* ドットパターン */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-[.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #1A1A1A 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <nav className="flex flex-col gap-1 px-3 relative z-10">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-sm no-underline transition-all duration-200 relative ${
                isActive(item)
                  ? "bg-bg-primary text-text-primary font-medium shadow-sm"
                  : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
              }`}
            >
              {isActive(item) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-warm rounded-full" />
              )}
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
