import Link from "next/link";

export default function TermsPage() {
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
          利用規約
        </h1>
        <p className="text-text-muted text-sm mb-8">最終更新日: 2025年2月9日</p>

        <div className="prose text-text-secondary text-sm leading-relaxed flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">第1条（適用）</h2>
            <p>本規約は、MenuCraft AI（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスをご利用ください。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">第2条（サービス内容）</h2>
            <p>本サービスは、AI技術を活用して飲食店向けのメニューデザイン画像を生成するサービスです。生成された画像の品質や正確性について、完全な保証を行うものではありません。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">第3条（禁止事項）</h2>
            <p>ユーザーは以下の行為を行ってはなりません。</p>
            <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
              <li>法令に違反する行為</li>
              <li>他のユーザーまたは第三者の権利を侵害する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>不正アクセスやシステムへの攻撃行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">第4条（免責事項）</h2>
            <p>本サービスはデモ版として提供されており、サービスの中断・停止・変更等について一切の責任を負いません。生成された画像に関する著作権等の問題についても、ユーザーの自己責任でご利用ください。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">第5条（お問い合わせ）</h2>
            <p>本規約に関するお問い合わせは、以下までご連絡ください。</p>
            <p className="mt-2">
              <code className="bg-bg-tag px-2 py-0.5 rounded text-xs">support@menucraft-ai.jp</code>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
