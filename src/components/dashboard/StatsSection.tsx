import type { ReactNode } from "react";

type StatCard = {
  label: string;
  value: string;
  sub: string;
  accent: "warm" | "gold" | "olive";
  icon: ReactNode;
};

const accentMap = {
  warm: {
    iconBg: "bg-accent-warm/10",
    iconText: "text-accent-warm",
    topBar: "bg-accent-warm",
    subText: "text-accent-warm",
    hoverBorder: "hover:border-accent-warm/30",
    hoverShadow: "hover:shadow-[0_8px_30px_rgba(232,113,58,.08)]",
  },
  gold: {
    iconBg: "bg-accent-gold/10",
    iconText: "text-accent-gold",
    topBar: "bg-accent-gold",
    subText: "text-accent-gold",
    hoverBorder: "hover:border-accent-gold/30",
    hoverShadow: "hover:shadow-[0_8px_30px_rgba(212,168,83,.08)]",
  },
  olive: {
    iconBg: "bg-accent-olive/10",
    iconText: "text-accent-olive",
    topBar: "bg-accent-olive",
    subText: "text-accent-olive",
    hoverBorder: "hover:border-accent-olive/30",
    hoverShadow: "hover:shadow-[0_8px_30px_rgba(123,138,100,.08)]",
  },
} as const;

export default function StatsSection({
  cards,
  loading,
}: {
  cards: StatCard[];
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-9">
      {cards.map((stat) => {
        const colors = accentMap[stat.accent];
        return (
          <div
            key={stat.label}
            className={`bg-bg-secondary rounded-[20px] p-6 border border-border-light relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${colors.hoverBorder} ${colors.hoverShadow}`}
          >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${colors.topBar} opacity-60`} />

            {/* Icon + label row */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 rounded-xl ${colors.iconBg} ${colors.iconText} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div className="text-xs text-text-muted uppercase tracking-[1px]">
                {stat.label}
              </div>
            </div>

            <div className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
              {loading ? (
                <div className="w-12 h-10 bg-border-light rounded animate-pulse" />
              ) : (
                stat.value
              )}
            </div>
            <div className={`text-xs mt-1.5 ${colors.subText}`}>
              {stat.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}
