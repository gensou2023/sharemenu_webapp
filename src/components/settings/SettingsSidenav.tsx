"use client";

interface SettingsNavItem {
  id: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: SettingsNavItem[] = [
  { id: "profile", label: "プロフィール", icon: "👤" },
  { id: "plan", label: "プラン", icon: "💎" },
  { id: "generation", label: "画像生成", icon: "🎨" },
  { id: "usage", label: "使用状況", icon: "📊" },
  { id: "security", label: "セキュリティ", icon: "🔒" },
  { id: "danger", label: "退会", icon: "⚠️" },
];

interface SettingsSidenavProps {
  activeSection: string;
  onNavigate: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsSidenav({ activeSection, onNavigate, isOpen, onClose }: SettingsSidenavProps) {
  const handleClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* モバイル/タブレット: バックドロップ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 xl:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドナビ */}
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
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-sm text-left transition-all duration-200 relative cursor-pointer border-none w-full ${
                activeSection === item.id
                  ? "bg-bg-primary text-text-primary font-medium shadow-sm"
                  : "bg-transparent text-text-secondary hover:bg-bg-primary hover:text-text-primary"
              }`}
            >
              {activeSection === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-warm rounded-full" />
              )}
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
