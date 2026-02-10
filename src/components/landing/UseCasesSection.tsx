export default function UseCasesSection() {
  const useCases = [
    {
      icon: "📱",
      title: "SNS投稿・広告",
      description:
        "Instagram、X（Twitter）、TikTokなど各SNSに最適なサイズで一括生成。毎日の投稿ネタに困りません。",
      tags: ["Instagram", "X Post", "Story"],
    },
    {
      icon: "📋",
      title: "店頭メニュー・POP",
      description:
        "新メニューの告知や季節限定メニューのPOPをすぐに作成。印刷してすぐ使えるクオリティ。",
      tags: ["新メニュー", "限定メニュー", "店頭POP"],
    },
    {
      icon: "🛵",
      title: "デリバリーアプリ",
      description:
        "Uber Eats、出前館などのデリバリーアプリ用のメニュー画像を統一されたデザインで作成。",
      tags: ["Uber Eats", "出前館", "Wolt"],
    },
    {
      icon: "🌸",
      title: "季節キャンペーン",
      description:
        "春の桜メニュー、夏のかき氷、秋の味覚フェアなど、季節に合わせたビジュアルを短時間で準備。",
      tags: ["季節限定", "フェア", "キャンペーン"],
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-10 bg-bg-secondary border-t border-border-light">
      <div className="text-center mb-14">
        <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-3">
          Use Cases
        </span>
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-3">
          こんな時に便利
        </h2>
        <p className="text-[15px] text-text-secondary max-w-[560px] mx-auto leading-relaxed">
          飲食店のあらゆるシーンで活躍するメニュー画像を、AIが即座に作成します
        </p>
      </div>

      <div className="max-w-[1080px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {useCases.map((uc, i) => (
          <div
            key={i}
            className="flex gap-4 p-6 rounded-[20px] bg-bg-primary border border-border-light transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(26,23,20,.06)]"
          >
            <div className="w-12 h-12 rounded-[12px] bg-accent-warm/10 flex items-center justify-center text-2xl flex-shrink-0">
              {uc.icon}
            </div>
            <div>
              <h3 className="font-semibold text-[15px] mb-1.5">{uc.title}</h3>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-3">
                {uc.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {uc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-[11px] bg-bg-tag text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
