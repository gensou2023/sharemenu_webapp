export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
      title: "チャットでかんたん",
      description: "AIが必要な情報を自然な会話で聞き取り。難しい操作は一切ありません。",
      accent: "accent-warm",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      ),
      title: "瞬時にプロ品質",
      description: "AIが自動でレイアウト・配色・フォントを最適化。プロ品質のデザインを即時生成。",
      accent: "accent-gold",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="2" y="2" width="8" height="8" rx="1" />
          <rect x="14" y="2" width="8" height="8" rx="1" />
          <rect x="2" y="14" width="8" height="8" rx="1" />
          <rect x="14" y="14" width="8" height="8" rx="1" />
        </svg>
      ),
      title: "豊富な出力形式",
      description: "Instagram・X・ストーリーズなど、各SNSに最適なサイズで一括生成できます。",
      accent: "accent-olive",
    },
  ];

  const accentColors: Record<string, { bg: string; bgHover: string; text: string; shadow: string; border: string }> = {
    "accent-warm": {
      bg: "bg-accent-warm/10",
      bgHover: "group-hover:bg-accent-warm",
      text: "text-accent-warm",
      shadow: "group-hover:shadow-[0_4px_20px_rgba(232,113,58,.25)]",
      border: "hover:border-accent-warm/30",
    },
    "accent-gold": {
      bg: "bg-accent-gold/10",
      bgHover: "group-hover:bg-accent-gold",
      text: "text-accent-gold",
      shadow: "group-hover:shadow-[0_4px_20px_rgba(212,168,83,.25)]",
      border: "hover:border-accent-gold/30",
    },
    "accent-olive": {
      bg: "bg-accent-olive/10",
      bgHover: "group-hover:bg-accent-olive",
      text: "text-accent-olive",
      shadow: "group-hover:shadow-[0_4px_20px_rgba(123,138,100,.25)]",
      border: "hover:border-accent-olive/30",
    },
  };

  return (
    <section className="w-full py-20 px-6 md:px-10 bg-bg-secondary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-[10%] w-64 h-64 bg-accent-gold/[.04] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-[5%] w-48 h-48 bg-accent-olive/[.05] rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-3">
            Features
          </span>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-3">
            3つの特徴
          </h2>
          <p className="text-[15px] text-text-secondary max-w-[480px] mx-auto leading-relaxed">
            シンプルで使いやすい機能で、誰でもプロ品質のメニューデザインを
          </p>
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="w-8 h-[2px] bg-accent-warm/30 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-accent-warm/40" />
            <div className="w-8 h-[2px] bg-accent-warm/30 rounded-full" />
          </div>
        </div>

        <div className="max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-7">
          {features.map((feature, i) => {
            const colors = accentColors[feature.accent];
            return (
              <div
                key={i}
                className={`flex flex-col items-center text-center group p-7 rounded-2xl bg-bg-primary border border-border-light transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(26,23,20,.06)] ${colors.border}`}
              >
                <div className={`w-16 h-16 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center mb-5 transition-all duration-300 ${colors.bgHover} group-hover:text-white ${colors.shadow}`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-[13px] text-text-secondary leading-relaxed max-w-[260px]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
