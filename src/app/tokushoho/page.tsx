import Link from "next/link";

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-[720px] mx-auto px-6 py-16">
        {/* 戻るリンク */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-accent-warm hover:text-accent-warm-hover transition-colors no-underline mb-8"
        >
          ← トップに戻る
        </Link>

        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-2">
          特定商取引法に基づく表記
        </h1>
        <p className="text-text-muted text-sm mb-8">最終更新日: 2025年2月9日</p>

        <div className="prose text-text-secondary text-sm leading-relaxed flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">販売事業者</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {[
                  ["事業者名", "MenuCraft AI 運営事務局"],
                  ["所在地", "お問い合わせいただいた方にお知らせいたします"],
                  ["電話番号", "お問い合わせいただいた方にお知らせいたします"],
                  ["メールアドレス", "support@menucraft-ai.jp"],
                  ["運営責任者", "お問い合わせいただいた方にお知らせいたします"],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-border-light">
                    <td className="py-3 pr-4 font-medium text-text-primary whitespace-nowrap w-[140px]">{label}</td>
                    <td className="py-3">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">販売価格</h2>
            <p>現在、本サービスは無料のデモ版として提供しております。有料プランの詳細は、サービスページまたはお問い合わせにてご確認ください。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">支払方法</h2>
            <p>有料プランの場合、クレジットカード決済を予定しております。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">サービスの提供時期</h2>
            <p>お申し込み後、即時ご利用いただけます。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">返品・キャンセルについて</h2>
            <p>デジタルサービスの性質上、サービス提供後の返品・返金はお受けできません。ただし、サービスに不具合がある場合は個別にご対応いたします。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">お問い合わせ</h2>
            <p>ご不明な点がございましたら、以下までご連絡ください。</p>
            <p className="mt-2">
              <code className="bg-bg-tag px-2 py-0.5 rounded text-xs">support@menucraft-ai.jp</code>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
