"use client";

import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "画像の生成にはどのくらい時間がかかりますか？",
    a: "通常20〜30秒程度で完了します。混雑時はもう少しかかる場合があります。",
  },
  {
    q: "生成した画像は商用利用できますか？",
    a: "はい、生成された画像はSNS投稿やメニュー表示など商用利用が可能です。",
  },
  {
    q: "無料プランでは何枚まで画像を作れますか？",
    a: "無料プランでは月10枚まで画像を生成できます。全機能をご利用いただけます。",
  },
];

export default function CommonFooter({ showFaq = false }: { showFaq?: boolean }) {
  return (
    <footer className="w-full bg-bg-dark">
      {/* FAQ セクション（オプション） */}
      {showFaq && (
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 pt-14 pb-10">
          <div className="mb-8">
            <span className="inline-block text-xs font-semibold text-accent-gold uppercase tracking-[2px] mb-2">
              FAQ
            </span>
            <h3 className="text-lg font-semibold text-white">よくある質問</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                className="p-5 rounded-[16px] border border-white/[.08] bg-white/[.03]"
              >
                <div className="text-sm font-medium text-white mb-2">{item.q}</div>
                <div className="text-[13px] text-text-muted leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 p-5 rounded-[16px] border border-white/[.08] bg-white/[.03]">
            <div className="w-10 h-10 rounded-full bg-accent-warm/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8713A" strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">問題が解消しない場合</div>
              <div className="text-[13px] text-text-muted">お気軽にお問い合わせください</div>
            </div>
            <Link
              href="mailto:support@menucraft-ai.jp"
              className="px-5 py-2 rounded-full border border-accent-warm/30 text-accent-warm text-[13px] font-medium no-underline hover:bg-accent-warm/10 transition-colors"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      )}

      {/* 共通フッターリンク */}
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 py-6 border-t border-white/[.08]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* ロゴ + コピーライト */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-accent-warm flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="2" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <circle cx="9" cy="10" r="1" fill="#FFFFFF" />
                <circle cx="15" cy="10" r="1" fill="#FFFFFF" />
              </svg>
            </div>
            <span className="text-xs text-text-muted">
              &copy; 2025 MenuCraft AI. All rights reserved.
            </span>
          </div>

          {/* リンク */}
          <div className="flex items-center gap-5">
            {[
              { label: "利用規約", href: "/terms" },
              { label: "プライバシーポリシー", href: "/privacy" },
              { label: "特定商取引法", href: "/tokushoho" },
              { label: "リリースノート", href: "/release-notes" },
              { label: "お問い合わせ", href: "mailto:support@menucraft-ai.jp" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[11px] text-text-muted hover:text-white transition-colors no-underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
