import Link from "next/link";

export default function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4 relative overflow-hidden">
      {/* 背景ブラーサークル */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-accent-warm/[.05] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[60%] right-[8%] w-56 h-56 bg-accent-gold/[.06] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[5%] left-[15%] w-48 h-48 bg-accent-olive/[.04] rounded-full blur-3xl pointer-events-none" />

      {/* ドットパターンオーバーレイ */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #1A1A1A 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in-up">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 no-underline">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#D4A853" strokeWidth="2" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="10" r="1" fill="#D4A853" />
              <circle cx="15" cy="10" r="1" fill="#D4A853" />
            </svg>
            <span className="font-[family-name:var(--font-playfair)] text-accent-gold text-xl font-bold tracking-wide">
              MenuCraft AI
            </span>
          </Link>
        </div>

        {/* カード */}
        <div className="bg-bg-secondary rounded-[20px] border border-border-light p-8 shadow-[0_4px_24px_rgba(26,23,20,.10)] relative overflow-hidden">
          {/* アクセントバー */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-warm via-accent-gold to-accent-olive" />

          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-center mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary text-sm text-center mb-8">
              {subtitle}
            </p>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
