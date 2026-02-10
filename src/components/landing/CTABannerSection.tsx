import Link from "next/link";

export default function CTABannerSection() {
  return (
    <section className="w-full py-6 px-6 md:px-10">
      <div className="max-w-[1080px] mx-auto rounded-3xl bg-gradient-to-r from-accent-warm to-[#F59E3B] px-8 py-14 md:py-16 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/[.07] rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-[36px] font-bold text-white leading-[1.3] mb-4">
            今すぐAIメニュー
            <br />
            デザイナーを試してみませんか？
          </h2>
          <p className="text-white/80 text-[15px] mb-8 max-w-[480px] mx-auto leading-relaxed">
            無料プランで今すぐ体験。クレジットカード不要で、30秒で始められます。
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 py-3.5 px-8 rounded-full bg-white text-accent-warm text-[15px] font-bold no-underline transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,.15)] hover:-translate-y-0.5"
          >
            無料で始める &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
