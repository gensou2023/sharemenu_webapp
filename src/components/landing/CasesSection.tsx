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
    },
    {
      emoji: "&#127862;",
      shopName: "カフェ&ティールーム",
      type: "カフェ",
      description:
        "季節限定メニュー全5品のビジュアルを一括作成。春のキャンペーン告知をストーリーズで展開。",
      tags: ["#カフェ", "#季節限定", "#おしゃれカフェ"],
      image: "from-[#4A5940] to-[#6B7A5E]",
    },
    {
      emoji: "&#127833;",
      shopName: "イタリアンキッチン",
      type: "イタリアン",
      description:
        "グランドメニューリニューアルに合わせ、全12品のメニュー画像を作成。店頭ポスターとX投稿に活用。",
      tags: ["#イタリアン", "#ピザ", "#恵比寿ディナー"],
      image: "from-[#4A3A30] to-[#6B5545]",
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-10 bg-bg-dark">
      <div className="text-center mb-12">
        <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-3">
          Case Studies
        </span>
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-3 text-white">
          導入事例
        </h2>
        <p className="text-[15px] text-text-muted max-w-[560px] mx-auto leading-relaxed">
          MenuCraft AI で作成されたメニューデザインの実例をご紹介します
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1080px] mx-auto">
        {cases.map((c, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden bg-white/[.06] border border-white/[.08] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[.10]"
          >
            <div
              className={`h-[200px] relative flex items-center justify-center bg-gradient-to-br ${c.image}`}
            >
              <span
                className="text-7xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)] relative z-10"
                dangerouslySetInnerHTML={{ __html: c.emoji }}
              />
              <div className="absolute bottom-3 left-3 flex gap-1.5 z-20">
                {["1:1", "9:16", "16:9"].map((size) => (
                  <span
                    key={size}
                    className="px-2.5 py-0.5 rounded-xl text-[10px] font-semibold bg-white/20 text-white backdrop-blur-sm"
                  >
                    {size}
                  </span>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
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
                    className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/[.06] text-text-muted"
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
