export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: "💬",
      title: "お店の情報を入力",
      description:
        "店舗名、デザインの方向性をチャットで伝えるだけ。AIが最適なデザインを提案します。",
    },
    {
      number: "02",
      icon: "🎨",
      title: "構成案を確認・調整",
      description:
        "AIが作成したキャッチコピーやハッシュタグの構成案を確認。修正も何度でもOK。",
    },
    {
      number: "03",
      icon: "📸",
      title: "画像を生成・ダウンロード",
      description:
        "1:1（Feed）、9:16（Story）、16:9（X Post）の3サイズでSNS用画像を即時生成。",
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-10">
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

      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="relative text-center">
            {/* ステップ番号 */}
            <div className="text-[64px] font-[family-name:var(--font-playfair)] font-bold text-border-light absolute -top-2 left-1/2 -translate-x-1/2 select-none">
              {step.number}
            </div>
            {/* アイコン */}
            <div className="relative z-10 w-16 h-16 mx-auto mb-5 rounded-full bg-bg-secondary border border-border-light flex items-center justify-center text-3xl shadow-[0_4px_16px_rgba(26,23,20,.06)]">
              {step.icon}
            </div>
            {/* コネクトライン（1,2番目のみ） */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-border-light" />
            )}
            <h3 className="font-semibold text-base mb-2">{step.title}</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed max-w-[280px] mx-auto">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
