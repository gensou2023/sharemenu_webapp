"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function FooterSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <footer className="w-full bg-bg-dark py-20 px-6 md:px-10 text-text-inverse">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16">
        {/* Left */}
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-[28px] font-bold mb-4 text-accent-gold">
            店舗専用プランの
            <br />
            ご相談はこちら
          </h2>
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            複数店舗での一括導入、オリジナルテンプレートの作成、ブランドガイドラインの反映など、お店に合わせたカスタマイズも承ります。
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: "📧", text: "support@menucraft-ai.jp" },
              { icon: "🕐", text: "営業時間: 平日 10:00 - 18:00" },
              { icon: "💬", text: "通常1営業日以内にご返信いたします" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-[13px] text-text-muted"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[.06] flex items-center justify-center text-sm shrink-0">
                  {item.icon}
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/[.04] border border-white/[.08] rounded-[20px] p-6 md:p-8"
        >
          <h3 className="text-base font-semibold mb-1.5">
            お問い合わせフォーム
          </h3>
          <p className="text-[13px] text-text-muted mb-6 leading-relaxed">
            店舗専用のMenuCraft
            AIをご検討中の方はこちらからお問い合わせください。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 tracking-wide">
                お名前
                <span className="text-accent-warm ml-1">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="田中 太郎"
                className="w-full py-2.5 px-3.5 rounded-lg border border-white/[.12] bg-white/[.06] text-text-inverse text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:bg-white/[.08] placeholder:text-white/25"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 tracking-wide">
                店舗名
                <span className="text-accent-warm ml-1">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="さくらカフェ"
                className="w-full py-2.5 px-3.5 rounded-lg border border-white/[.12] bg-white/[.06] text-text-inverse text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:bg-white/[.08] placeholder:text-white/25"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-text-muted mb-1.5 tracking-wide">
              メールアドレス
              <span className="text-accent-warm ml-1">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="example@email.com"
              className="w-full py-2.5 px-3.5 rounded-lg border border-white/[.12] bg-white/[.06] text-text-inverse text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:bg-white/[.08] placeholder:text-white/25"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 tracking-wide">
                業態
              </label>
              <select className="w-full py-2.5 px-3.5 rounded-lg border border-white/[.12] bg-white/[.06] text-text-inverse text-sm outline-none appearance-none cursor-pointer transition-all duration-300 focus:border-accent-warm focus:bg-white/[.08]">
                <option value="" className="bg-bg-dark">
                  選択してください
                </option>
                {[
                  "カフェ",
                  "居酒屋",
                  "ラーメン・中華",
                  "和食",
                  "イタリアン",
                  "フレンチ",
                  "焼肉・BBQ",
                  "その他",
                ].map((t) => (
                  <option key={t} value={t} className="bg-bg-dark">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 tracking-wide">
                店舗数
              </label>
              <select className="w-full py-2.5 px-3.5 rounded-lg border border-white/[.12] bg-white/[.06] text-text-inverse text-sm outline-none appearance-none cursor-pointer transition-all duration-300 focus:border-accent-warm focus:bg-white/[.08]">
                <option value="" className="bg-bg-dark">
                  選択してください
                </option>
                {["1店舗", "2〜5店舗", "6〜10店舗", "11店舗以上"].map((t) => (
                  <option key={t} value={t} className="bg-bg-dark">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-text-muted mb-1.5 tracking-wide">
              お問い合わせ内容
              <span className="text-accent-warm ml-1">*</span>
            </label>
            <textarea
              required
              placeholder="ご要望や気になる点をお聞かせください。"
              className="w-full py-2.5 px-3.5 rounded-lg border border-white/[.12] bg-white/[.06] text-text-inverse text-sm outline-none resize-y min-h-[100px] transition-all duration-300 focus:border-accent-warm focus:bg-white/[.08] placeholder:text-white/25"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 rounded-[28px] border-none bg-accent-warm text-white text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-accent-warm-hover hover:-translate-y-0.5 mt-2"
          >
            {submitted ? "✓ 送信しました" : "送信する →"}
          </button>
          <p className="text-[11px] text-white/30 mt-3 text-center leading-relaxed">
            送信いただいた情報は、お問い合わせ対応の目的のみに使用します。
            <br />
            プライバシーポリシーに同意の上、送信してください。
          </p>
        </form>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-[1080px] mx-auto mt-12 pt-6 border-t border-white/[.08] flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-text-secondary">
          © 2025 MenuCraft AI. All rights reserved.
        </p>
        <div className="flex gap-5">
          {[
            { label: "利用規約", href: "/terms" },
            { label: "プライバシーポリシー", href: "/privacy" },
            { label: "特定商取引法に基づく表記", href: "/tokushoho" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-text-secondary hover:text-text-muted transition-colors duration-300 no-underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
