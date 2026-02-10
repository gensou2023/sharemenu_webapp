export default function CasesSection() {
  const cases = [
    {
      emoji: "&#127836;",
      shopName: "ハンバーガーショップ",
      type: "ファストフード",
      description:
        "看板メニューのSNS投稿用画像を3サイズ生成。Instagramフォロワーが1ヶ月で+320人増加。",
      tags: ["#ハンバーガー", "#新メニュー", "#渋谷ランチ"],
      image: "from-[#8B4513] to-[#A0522D]",
      stat: "+320",
      statLabel: "フォロワー増",
      decoEmoji: "&#127835;",
    },
    {
      emoji: "&#127862;",
      shopName: "カフェ&ティールーム",
      type: "カフェ",
      description:
        "季節限定メニュー全5品のビジュアルを一括作成。春のキャンペーン告知をストーリーズで展開。",
      tags: ["#カフェ", "#季節限定", "#おしゃれカフェ"],
      image: "from-[#4A5940] to-[#6B7A5E]",
      stat: "5品",
      statLabel: "一括作成",
      decoEmoji: "&#9749;",
    },
    {
      emoji: "&#127833;",
      shopName: "イタリアンキッチン",
      type: "イタリアン",
      description:
        "グランドメニューリニューアルに合わせ、全12品のメニュー画像を作成。店頭ポスターとX投稿に活用。",
      tags: ["#イタリアン", "#ピザ", "#恵比寿ディナー"],
      image: "from-[#4A3A30] to-[#6B5545]",
      stat: "12品",
      statLabel: "メニュー作成",
      decoEmoji: "&#127829;",
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-10 bg-bg-dark relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[10%] left-[5%] w-80 h-80 bg-accent-warm/[.03] rounded-full blur-3xl" />
      <div className="absolute bottom-[10%] right-[8%] w-60 h-60 bg-accent-gold/[.04] rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-3">
            Case Studies
          </span>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-3 text-white">
            導入事例
          </h2>
          <p className="text-[15px] text-text-muted max-w-[560px] mx-auto leading-relaxed">
            MenuCraft AI で作成されたメニューデザインの実例をご紹介します
          </p>
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="w-8 h-[2px] bg-white/10 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-accent-warm/40" />
            <div className="w-8 h-[2px] bg-white/10 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-[1080px] mx-auto">
          {cases.map((c, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden bg-white/[.06] border border-white/[.08] transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[.10] hover:shadow-[0_12px_40px_rgba(0,0,0,.3)] group"
            >
              <div
                className={`h-[220px] relative flex items-center justify-center bg-gradient-to-br ${c.image} overflow-hidden`}
              >
                {/* Decorative pattern overlay */}
                <div className="absolute inset-0 opacity-[.08]" style={{
                  backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }} />

                {/* Floating decorative emoji */}
                <span
                  className="absolute top-4 right-4 text-3xl opacity-15 group-hover:opacity-25 transition-all duration-500 group-hover:rotate-12"
                  dangerouslySetInnerHTML={{ __html: c.decoEmoji }}
                />

                {/* Main emoji */}
                <span
                  className="text-8xl drop-shadow-[0_6px_20px_rgba(0,0,0,0.35)] relative z-10 transition-transform duration-500 group-hover:scale-110"
                  dangerouslySetInnerHTML={{ __html: c.emoji }}
                />

                {/* Stat badge */}
                <div className="absolute top-4 left-4 z-20 bg-white/20 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/20">
                  <div className="text-white font-bold text-sm leading-none">{c.stat}</div>
                  <div className="text-white/70 text-[10px] mt-0.5">{c.statLabel}</div>
                </div>

                {/* Size badges */}
                <div className="absolute bottom-3 left-3 flex gap-1.5 z-20">
                  {["1:1", "9:16", "16:9"].map((size) => (
                    <span
                      key={size}
                      className="px-2.5 py-0.5 rounded-xl text-[10px] font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/10"
                    >
                      {size}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-5">
                <div className="font-bold text-[15px] mb-1 flex items-center gap-2 text-white">
                  {c.shopName}
                  <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-medium bg-accent-olive/20 text-accent-olive">
                    {c.type}
                  </span>
                </div>
                <p className="text-[13px] text-text-muted leading-relaxed mt-2">
                  {c.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/[.06] text-text-muted border border-white/[.06]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
