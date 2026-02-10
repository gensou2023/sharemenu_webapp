export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "AIとチャットで伝える",
      description:
        "店舗名、メニュー、デザインの方向性をチャットで伝えるだけ。AIが最適な構成を提案します。",
      color: "bg-accent-warm",
      lightBg: "bg-accent-warm/[.06]",
      emoji: "&#128172;",
    },
    {
      number: "02",
      title: "AIが自動でデザイン",
      description:
        "AIがキャッチコピー、ハッシュタグ、レイアウトを自動生成。修正のやり取りも何度でもOK。",
      color: "bg-accent-gold",
      lightBg: "bg-accent-gold/[.06]",
      emoji: "&#127912;",
    },
    {
      number: "03",
      title: "画像をダウンロード",
      description:
        "1:1（Feed）、9:16（Story）、16:9（X Post）の3サイズでSNS用画像を即時生成・DL。",
      color: "bg-accent-olive",
      lightBg: "bg-accent-olive/[.06]",
      emoji: "&#128229;",
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[20%] left-[3%] w-72 h-72 bg-accent-warm/[.04] rounded-full blur-3xl" />
      <div className="absolute bottom-[10%] right-[5%] w-56 h-56 bg-accent-gold/[.05] rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-3">
            How It Works
          </span>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-3">
            かんたん3ステップ
          </h2>
          <p className="text-[15px] text-text-secondary max-w-[560px] mx-auto leading-relaxed">
            デザインの知識は不要。チャットで話すだけでプロ品質のメニュー画像が完成します
          </p>
        </div>

        <div className="max-w-[1020px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-7">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+48px)] w-[calc(100%-96px)] border-t-2 border-dashed border-border-medium z-20" />
              )}

              <div className={`flex flex-col items-center text-center p-7 pb-8 rounded-2xl ${step.lightBg} border border-transparent transition-all duration-300 hover:border-border-light hover:shadow-[0_8px_30px_rgba(26,23,20,.06)] hover:-translate-y-1 relative group`}>
                {/* Decorative emoji (top-right corner) */}
                <span
                  className="absolute top-4 right-4 text-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                  dangerouslySetInnerHTML={{ __html: step.emoji }}
                />

                {/* Step number circle */}
                <div className={`w-20 h-20 rounded-full ${step.color} flex items-center justify-center text-white text-2xl font-bold font-[family-name:var(--font-playfair)] mb-5 shadow-lg relative z-10 transition-transform duration-300 group-hover:scale-105`}>
                  {step.number}
                </div>
                <h3 className="font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-[13px] text-text-secondary leading-relaxed max-w-[280px]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
