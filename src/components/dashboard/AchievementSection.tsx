"use client";

import type { Achievement } from "@/lib/types";

type Props = {
  visible: Achievement[];
  hidden: Achievement[];
  totalHidden: number;
  loading: boolean;
};

export default function AchievementSection({ visible, hidden, totalHidden, loading }: Props) {
  if (loading) {
    return (
      <section className="mb-9">
        <div className="mb-6">
          <div className="w-24 h-3 bg-border-light rounded animate-pulse mb-2" />
          <div className="w-40 h-5 bg-border-light rounded animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="w-20 h-24 bg-bg-secondary rounded-[16px] border border-border-light animate-pulse flex-shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-9">
      {/* ヘッダー */}
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold text-accent-gold uppercase tracking-[2px] mb-2">
          Achievements
        </span>
        <h2 className="text-lg font-semibold">バッジコレクション</h2>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-8 h-[2px] bg-accent-gold/20 rounded-full" />
          <div className="w-2 h-2 rounded-full bg-accent-gold/30" />
          <div className="w-8 h-[2px] bg-accent-gold/20 rounded-full" />
        </div>
      </div>

      {/* 表示バッジ */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {visible.map((badge) => {
          const unlocked = !!badge.unlocked_at;
          return (
            <div
              key={badge.id}
              className={`group relative flex-shrink-0 w-20 flex flex-col items-center gap-1.5 p-3 rounded-[16px] border transition-all duration-300 ${
                unlocked
                  ? "bg-bg-secondary border-accent-gold/30 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(212,168,83,.15)]"
                  : "bg-bg-secondary/50 border-border-light opacity-50"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all ${
                  unlocked ? "bg-accent-gold/15" : "bg-border-light grayscale"
                }`}
              >
                {unlocked ? badge.icon : "🔒"}
              </div>
              <span className="text-[10px] text-center leading-tight text-text-secondary font-medium">
                {badge.name}
              </span>

              {/* ツールチップ */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-[10px] bg-bg-dark text-white text-[11px] leading-relaxed whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-lg">
                <div className="font-semibold mb-0.5">{badge.name}</div>
                <div className="text-text-muted">{badge.description}</div>
                {unlocked && (
                  <div className="text-accent-gold mt-1">
                    {new Date(badge.unlocked_at!).toLocaleDateString("ja-JP")} 獲得
                  </div>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-bg-dark rotate-45 -mt-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 非表示バッジ */}
      {totalHidden > 0 && (
        <div className="bg-bg-secondary rounded-[16px] border border-border-light p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">🎁</span>
            <span className="text-xs font-medium text-text-secondary">
              シークレットバッジ {hidden.length}/{totalHidden} 獲得
            </span>
          </div>
          {hidden.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {hidden.map((badge) => (
                <div
                  key={badge.id}
                  className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/20"
                >
                  <span className="text-base">{badge.icon}</span>
                  <span className="text-xs font-medium text-text-primary">{badge.name}</span>

                  {/* ツールチップ */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-[10px] bg-bg-dark text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-lg">
                    <div className="font-semibold mb-0.5">{badge.name}</div>
                    <div className="text-text-muted">{badge.description}</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-bg-dark rotate-45 -mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">
              特定の条件を満たすとサプライズバッジが出現します...
            </p>
          )}
        </div>
      )}
    </section>
  );
}
