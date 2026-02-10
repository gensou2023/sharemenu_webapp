export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="w-full py-20 px-6 md:px-10 bg-bg-primary"
    >
      <div className="text-center mb-12">
        <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-3">
          Pricing
        </span>
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-3">
          料金プラン
        </h2>
        <p className="text-[15px] text-text-secondary max-w-[560px] mx-auto leading-relaxed">
          まずは無料プランでお試しください。お店の成長に合わせてProへアップグレード。
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-[780px] mx-auto">
        {/* Free Plan */}
        <div className="rounded-2xl border border-border-light bg-bg-secondary p-8 md:p-9 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(26,23,20,.08)]">
          <div className="text-sm font-semibold text-text-muted uppercase tracking-[1.5px] mb-4">
            無料プラン
          </div>
          <div className="font-[family-name:var(--font-playfair)] text-5xl font-bold mb-1 leading-none">
            <span className="text-2xl align-top mr-0.5">&yen;</span>0
            <span className="text-base text-text-muted font-normal ml-1">
              {" "}
              / 月
            </span>
          </div>
          <p className="text-[13px] text-text-muted mb-6 leading-relaxed">
            まずはお試し。Instagramフィード用の画像を無料で作成できます。
          </p>
          <ul className="mb-7 space-y-0">
            <PricingItem available text="Instagram フィード画像 (1:1)" />
            <PricingItem
              available={false}
              text="Instagram ストーリーズ (9:16)"
              limit="Pro限定"
            />
            <PricingItem
              available={false}
              text="X ポスト画像 (16:9)"
              limit="Pro限定"
            />
            <PricingItem available text="画像生成" limit="1日3枚まで" />
            <PricingItem available text="生成履歴の保存" limit="直近3件" />
            <PricingItem available text="チャットヒアリング" />
            <PricingItem available text="キャッチコピー・ハッシュタグ提案" />
          </ul>
          <button className="w-full py-3.5 rounded-full text-sm font-semibold border-[1.5px] border-border-medium bg-transparent text-text-primary transition-all duration-300 hover:border-text-primary hover:bg-bg-tertiary cursor-pointer">
            無料で始める
          </button>
        </div>

        {/* Pro Plan */}
        <div className="rounded-2xl border-2 border-accent-warm bg-bg-secondary p-8 md:p-9 relative shadow-[0_4px_24px_rgba(232,113,58,.12)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(232,113,58,.18)]">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-accent-warm text-white text-xs font-semibold whitespace-nowrap shadow-md">
            おすすめ
          </span>
          <div className="text-sm font-semibold text-text-muted uppercase tracking-[1.5px] mb-4">
            プロプラン
          </div>
          <div className="font-[family-name:var(--font-playfair)] text-5xl font-bold mb-1 leading-none">
            <span className="text-2xl align-top mr-0.5">&yen;</span>700
            <span className="text-base text-text-muted font-normal ml-1">
              {" "}
              / 月
            </span>
          </div>
          <p className="text-[13px] text-text-muted mb-6 leading-relaxed">
            3サイズ対応・無制限生成。本格的なSNS運用をしたいお店に。
          </p>
          <ul className="mb-7 space-y-0">
            <PricingItem available text="Instagram フィード画像 (1:1)" />
            <PricingItem available text="Instagram ストーリーズ (9:16)" />
            <PricingItem available text="X ポスト画像 (16:9)" />
            <PricingItem available text="画像生成" limit="無制限" highlight />
            <PricingItem
              available
              text="生成履歴の保存"
              limit="無制限"
              highlight
            />
            <PricingItem available text="チャットヒアリング" />
            <PricingItem available text="キャッチコピー・ハッシュタグ提案" />
          </ul>
          <button className="w-full py-3.5 rounded-full text-sm font-semibold bg-accent-warm text-white shadow-[0_2px_12px_rgba(232,113,58,.2)] transition-all duration-300 hover:bg-accent-warm-hover hover:-translate-y-0.5 cursor-pointer border-none">
            Proで始める &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}

function PricingItem({
  available,
  text,
  limit,
  highlight,
}: {
  available: boolean;
  text: string;
  limit?: string;
  highlight?: boolean;
}) {
  return (
    <li className="py-2.5 text-sm flex items-start gap-2.5 border-b border-border-light last:border-b-0 leading-relaxed list-none">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 mt-0.5 ${
          available
            ? "bg-accent-olive/15 text-accent-olive"
            : "bg-bg-tertiary text-text-muted"
        }`}
      >
        {available ? "\u2713" : "\u2014"}
      </span>
      <span className={available ? "" : "text-text-muted"}>{text}</span>
      {limit && (
        <span
          className={`text-xs ml-auto whitespace-nowrap ${
            highlight ? "text-accent-olive font-semibold" : "text-text-muted"
          }`}
        >
          {limit}
        </span>
      )}
    </li>
  );
}
