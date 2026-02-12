"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  onComplete: () => void;
};

const STEPS = [
  {
    title: "MenuCraft AI へようこそ！",
    description:
      "AIとの対話を通じて、あなたのお店のメニュー画像を簡単に作成できるサービスです。",
    illustration: "🎨",
  },
  {
    title: "AIとチャットするだけ",
    description:
      "「新しいメニューを作成」ボタンからチャットを始めましょう。AIがあなたのお店について質問します。",
    illustration: "💬",
  },
  {
    title: "3ステップで完成",
    steps: [
      { icon: "🏪", label: "お店の名前を伝える" },
      { icon: "🎯", label: "デザインの方向性を選ぶ" },
      { icon: "📸", label: "メニュー情報を伝えて画像生成" },
    ],
  },
  {
    title: "さっそく始めてみましょう！",
    description:
      "最初のメニュー画像を作ってみませんか？AIがサポートします。",
    illustration: "🚀",
  },
];

export default function OnboardingTour({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleStartChat = () => {
    onComplete();
    router.push("/chat");
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-secondary rounded-[20px] border border-border-light max-w-[480px] w-full mx-4 relative overflow-hidden animate-fade-in-up">
        {/* アクセントバー */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-warm via-accent-gold to-transparent" />

        <div className="p-8">
          {/* イラスト / ステップ図解 */}
          {"illustration" in current && current.illustration && (
            <div className="text-center mb-6">
              <span className="text-6xl">{current.illustration}</span>
            </div>
          )}

          {"steps" in current && current.steps && (
            <div className="flex justify-center gap-4 mb-6">
              {current.steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-14 h-14 rounded-full bg-accent-warm/10 flex items-center justify-center text-2xl">
                    {s.icon}
                  </div>
                  <span className="text-xs text-text-secondary text-center leading-tight">
                    {s.label}
                  </span>
                  {i < current.steps.length - 1 && (
                    <div className="absolute" style={{ display: "none" }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* タイトル */}
          <h2 className="text-xl font-bold text-center mb-3">
            {current.title}
          </h2>

          {/* 説明 */}
          {"description" in current && current.description && (
            <p className="text-sm text-text-secondary text-center leading-relaxed mb-6">
              {current.description}
            </p>
          )}

          {/* ステップ図解の場合は余白追加 */}
          {"steps" in current && <div className="mb-6" />}

          {/* プログレスドット */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? "bg-accent-warm w-6"
                    : i < step
                    ? "bg-accent-warm/40"
                    : "bg-border-light"
                }`}
              />
            ))}
          </div>

          {/* ボタン */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              スキップ
            </button>

            {isLast ? (
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="px-5 py-2.5 rounded-[28px] border border-border-light text-sm text-text-secondary cursor-pointer hover:bg-bg-primary transition-colors"
                >
                  あとで始める
                </button>
                <button
                  onClick={handleStartChat}
                  className="px-5 py-2.5 rounded-[28px] bg-accent-warm text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-accent-warm-hover"
                >
                  チャットを始める
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-[28px] bg-accent-warm text-white text-sm font-semibold cursor-pointer transition-colors hover:bg-accent-warm-hover"
              >
                次へ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
