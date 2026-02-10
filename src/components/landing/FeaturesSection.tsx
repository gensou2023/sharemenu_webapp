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
    },
  ];

  return (
    <section className="w-full py-16 px-6 md:px-10 bg-bg-secondary">
      <div className="text-center mb-12">
        <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-3">
          Features
        </span>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold">
          3つの特徴
        </h2>
      </div>

      <div className="max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent-warm/10 text-accent-warm flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-accent-warm group-hover:text-white group-hover:shadow-[0_4px_20px_rgba(232,113,58,.25)]">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed max-w-[260px]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
