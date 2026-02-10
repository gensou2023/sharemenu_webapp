import Link from "next/link";

export default function CTABannerSection() {
  return (
    <section className="w-full py-8 px-6 md:px-10">
      <div className="max-w-[1080px] mx-auto rounded-3xl bg-gradient-to-br from-accent-warm via-[#E8854A] to-[#F59E3B] px-8 py-16 md:py-20 text-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/[.08] rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/[.06] rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-[40%] left-[10%] w-20 h-20 bg-white/[.05] rounded-full" />
        <div className="absolute top-[20%] right-[15%] w-16 h-16 bg-white/[.04] rounded-full" />

        {/* Floating food emojis (desktop only) */}
        <div className="hidden md:block absolute top-8 left-[8%] text-4xl opacity-15 animate-bounce" style={{ animationDuration: "4s" }}>&#127835;</div>
        <div className="hidden md:block absolute bottom-8 right-[10%] text-3xl opacity-12 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1s" }}>&#9749;</div>
        <div className="hidden md:block absolute top-[50%] right-[5%] text-3xl opacity-10 animate-bounce" style={{ animationDuration: "5s", animationDelay: "2s" }}>&#127843;</div>

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[.04]" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold mb-6 tracking-wide border border-white/20 backdrop-blur-sm">
            <span>&#10024;</span>
            無料で始められます
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-[38px] font-bold text-white leading-[1.3] mb-4">
            今すぐAIメニュー
            <br />
            デザイナーを試してみませんか？
          </h2>
          <p className="text-white/80 text-[15px] mb-9 max-w-[480px] mx-auto leading-relaxed">
            無料プランで今すぐ体験。クレジットカード不要で、30秒で始められます。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 py-3.5 px-9 rounded-full bg-white text-accent-warm text-[15px] font-bold no-underline transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,.2)] hover:-translate-y-0.5"
            >
              無料で始める
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <span className="text-white/60 text-xs flex items-center gap-1.5">
              <span>&#128274;</span>
              クレジットカード不要
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
