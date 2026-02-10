export default function UseCasesSection() {
  const useCases = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      ),
      title: "毎日のSNS投稿にメニュー画像作りたい",
      description:
        "Instagram、X（Twitter）、TikTokなど各SNSに最適なサイズで一括生成。毎日の投稿ネタに困りません。",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
      title: "個人経営だけどスタイリッシュにビジネス",
      description:
        "専門デザイナーを雇えない個人店でも、プロ品質のメニュー画像が手に入ります。",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8M16 17H8M10 9H8" />
        </svg>
      ),
      title: "新メニューの告知をすぐに出したい",
      description:
        "新メニューの告知や季節限定メニューのPOPをすぐに作成。印刷してすぐ使えるクオリティ。",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
      ),
      title: "デリバリーアプリの画像を統一したい",
      description:
        "Uber Eats、出前館などのデリバリーアプリ用のメニュー画像を統一されたデザインで作成。",
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-10 bg-bg-secondary border-t border-border-light">
      <div className="text-center mb-14">
        <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-3">
          Use Cases
        </span>
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-3">
          こんな方に最適
        </h2>
        <p className="text-[15px] text-text-secondary max-w-[560px] mx-auto leading-relaxed">
          飲食店のあらゆるシーンで活躍するメニュー画像を、AIが即座に作成します
        </p>
      </div>

      <div className="max-w-[960px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
        {useCases.map((uc, i) => (
          <div
            key={i}
            className="flex gap-4 p-5 sm:p-6 rounded-2xl bg-bg-primary border border-border-light transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(26,23,20,.06)] hover:border-accent-warm/30"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-warm/10 text-accent-warm flex items-center justify-center flex-shrink-0">
              {uc.icon}
            </div>
            <div>
              <h3 className="font-semibold text-[15px] mb-1.5">{uc.title}</h3>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                {uc.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
