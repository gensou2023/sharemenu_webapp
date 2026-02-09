"use client";

import { useState, type FormEvent } from "react";

export default function HeroSection() {
  const [email, setEmail] = useState("");

  const handleSignup = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    alert(`サインアップ画面に遷移: ${email}`);
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full flex flex-col items-center text-center pt-20 pb-16 px-6 md:px-10 bg-[radial-gradient(ellipse_at_20%_50%,rgba(196,113,59,.06),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(212,168,83,.06),transparent_50%),radial-gradient(ellipse_at_50%_80%,rgba(123,138,100,.04),transparent_40%)]">
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-warm/10 text-accent-warm text-xs font-semibold mb-6 tracking-wide">
        AI-Powered Menu Design
      </div>

      {/* Headline */}
      <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-[52px] font-bold leading-[1.2] mb-5 max-w-[700px]">
        チャットするだけで
        <br />
        <span className="text-accent-warm">プロ品質</span>のメニューを
      </h1>

      {/* Description */}
      <p className="text-base text-text-secondary max-w-[540px] leading-relaxed mb-9">
        店名と料理の情報を伝えるだけ。AIがSNS最適サイズのメニュー画像を自動生成します。デザインの知識は不要です。
      </p>

      {/* Email Signup Form */}
      <form
        onSubmit={handleSignup}
        className="flex items-center max-w-[480px] w-full mb-3 rounded-[28px] border-[1.5px] border-border-medium bg-bg-secondary overflow-hidden shadow-[0_2px_12px_rgba(26,23,20,.06)] transition-all duration-300 focus-within:border-accent-warm focus-within:shadow-[0_0_0_3px_rgba(196,113,59,.12)]"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレスを入力"
          className="flex-1 py-4 px-5 border-none bg-transparent text-[15px] text-text-primary outline-none placeholder:text-text-muted"
        />
        <button
          type="submit"
          className="py-3 px-7 m-1 rounded-[26px] bg-accent-warm text-white text-sm font-semibold border-none cursor-pointer whitespace-nowrap transition-all duration-300 hover:bg-accent-warm-hover hover:scale-[1.02]"
        >
          無料ではじめる →
        </button>
      </form>

      {/* Note */}
      <p className="text-xs text-text-muted mb-4 flex items-center gap-1.5">
        <span className="text-accent-olive">🔒</span>{" "}
        クレジットカード不要・30秒で登録完了
      </p>

      {/* Secondary CTA */}
      <div className="flex gap-3">
        <button
          onClick={scrollToPricing}
          className="py-4 px-9 rounded-[28px] text-[15px] font-semibold bg-transparent text-text-primary border-[1.5px] border-border-medium cursor-pointer transition-all duration-300 hover:border-text-primary"
        >
          料金プランを見る
        </button>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-[900px] w-full">
        {[
          {
            icon: "💬",
            title: "チャットでヒアリング",
            desc: "AIが必要な情報を自然な会話で聞き取り。難しい操作は一切なし。",
            bg: "bg-accent-warm/10",
          },
          {
            icon: "🖼",
            title: "最大3サイズ同時生成",
            desc: "Instagram投稿・ストーリーズ・X対応。Proプランで全サイズ対応。",
            bg: "bg-accent-olive/15",
          },
          {
            icon: "📥",
            title: "即ダウンロード",
            desc: "生成画像はその場でダウンロード。すぐにSNSへ投稿できます。",
            bg: "bg-accent-gold/15",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="py-7 px-6 bg-bg-secondary rounded-[20px] border border-border-light text-left transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_4px_24px_rgba(26,23,20,.10)]"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-[22px] mb-4 ${card.bg}`}
            >
              {card.icon}
            </div>
            <div className="font-semibold text-[15px] mb-2">{card.title}</div>
            <div className="text-[13px] text-text-secondary leading-relaxed">
              {card.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
