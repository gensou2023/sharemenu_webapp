import Link from "next/link";

export default function PrivacyPage() {
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
          プライバシーポリシー
        </h1>
        <p className="text-text-muted text-sm mb-8">最終更新日: 2025年2月9日</p>

        <div className="prose text-text-secondary text-sm leading-relaxed flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">1. 収集する情報</h2>
            <p>本サービスでは、以下の情報を収集する場合があります。</p>
            <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
              <li>メールアドレス（アカウント登録時）</li>
              <li>チャットでの入力内容（メニュー生成のため）</li>
              <li>アップロードされた画像（メニューデザイン生成のため）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">2. 情報の利用目的</h2>
            <p>収集した情報は、以下の目的で利用します。</p>
            <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
              <li>本サービスの提供および改善</li>
              <li>ユーザーサポートへの対応</li>
              <li>サービスに関するお知らせの送信</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">3. 第三者への提供</h2>
            <p>ユーザーの同意なく、個人情報を第三者に提供することはありません。ただし、以下の場合を除きます。</p>
            <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
              <li>法令に基づく場合</li>
              <li>生成AI処理のために必要な場合（Google Gemini APIへの送信）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">4. データの保管</h2>
            <p>本サービスはデモ版のため、チャット履歴や生成画像はセッション終了時に削除されます。永続的なデータ保存は行っておりません。</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-2">5. お問い合わせ</h2>
            <p>プライバシーに関するお問い合わせは、以下までご連絡ください。</p>
            <p className="mt-2">
              <code className="bg-bg-tag px-2 py-0.5 rounded text-xs">support@menucraft-ai.jp</code>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
