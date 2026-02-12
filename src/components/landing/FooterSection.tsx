"use client";

import Link from "next/link";
import CommonFooter from "@/components/CommonFooter";

export default function FooterSection() {
  return (
    <>
      <div className="w-full bg-bg-dark py-16 px-6 md:px-10">
        <div className="max-w-[1080px] mx-auto">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-12">
            {/* Brand */}
            <div>
              <div className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-accent-warm flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="2" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="9" cy="10" r="1" fill="#FFFFFF" />
                    <circle cx="15" cy="10" r="1" fill="#FFFFFF" />
                  </svg>
                </div>
                MenuCraft AI
              </div>
              <p className="text-sm text-text-muted leading-relaxed mb-5 max-w-[320px]">
                AIがSNS最適サイズのメニュー画像を自動生成。飲食店オーナーのためのデザインツール。
              </p>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 text-[13px] text-text-muted">
                  <span className="text-sm">&#x1F4E7;</span>
                  support@menucraft-ai.jp
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-text-muted">
                  <span className="text-sm">&#x1F552;</span>
                  平日 10:00 - 18:00
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                プロダクト
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "機能紹介", href: "/" },
                  { label: "料金プラン", href: "/#pricing" },
                  { label: "使い方", href: "/" },
                  { label: "導入事例", href: "/" },
                ].map((link) => (
                  <li key={link.label} className="list-none">
                    <Link
                      href={link.href}
                      className="text-[13px] text-text-muted hover:text-white transition-colors no-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                サポート
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "利用規約", href: "/terms" },
                  { label: "プライバシーポリシー", href: "/privacy" },
                  { label: "特定商取引法に基づく表記", href: "/tokushoho" },
                  { label: "お問い合わせ", href: "mailto:support@menucraft-ai.jp" },
                ].map((link) => (
                  <li key={link.label} className="list-none">
                    <Link
                      href={link.href}
                      className="text-[13px] text-text-muted hover:text-white transition-colors no-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <CommonFooter />
    </>
  );
}
