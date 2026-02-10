"use client";

import Link from "next/link";

export default function HeroSection() {
  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full flex flex-col items-center text-center pt-20 pb-20 px-6 md:px-10 bg-gradient-to-b from-bg-primary to-bg-secondary">
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-warm/10 text-accent-warm text-xs font-semibold mb-7 tracking-wide">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        AI-Powered Menu Design
      </div>

      {/* Headline */}
      <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-[52px] font-bold leading-[1.15] mb-5 max-w-[700px]">
        チャットするだけで
        <br />
        <span className="text-accent-warm">プロ品質</span>のメニューを
      </h1>

      {/* Description */}
      <p className="text-base text-text-secondary max-w-[540px] leading-relaxed mb-9">
        店名と料理の情報を伝えるだけ。AIがSNS最適サイズの
        <br className="hidden sm:block" />
        メニュー画像を自動生成します。デザインの知識は不要です。
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Link
          href="/signup"
          className="py-3.5 px-8 rounded-full bg-accent-warm text-white text-[15px] font-semibold no-underline transition-all duration-300 hover:bg-accent-warm-hover hover:shadow-[0_4px_20px_rgba(232,113,58,.3)] hover:-translate-y-0.5"
        >
          無料で始める &rarr;
        </Link>
        <button
          onClick={scrollToPricing}
          className="py-3.5 px-8 rounded-full text-[15px] font-semibold bg-transparent text-text-primary border-[1.5px] border-border-medium cursor-pointer transition-all duration-300 hover:border-text-primary hover:bg-bg-tertiary"
        >
          料金プランを見る
        </button>
      </div>

      {/* Note */}
      <p className="text-xs text-text-muted mb-0 flex items-center gap-1.5">
        <span className="text-accent-olive">&#128274;</span>{" "}
        クレジットカード不要・30秒で登録完了
      </p>
    </section>
  );
}
