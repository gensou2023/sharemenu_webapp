import { getGreeting, getStatsMessage } from "@/lib/greeting";
import type { StatsData } from "@/hooks/useDashboardData";

type Props = {
  onCreateNew: () => void;
  userName: string | null;
  stats: StatsData | null;
};

export default function DashboardHeader({ onCreateNew, userName, stats }: Props) {
  const greeting = getGreeting();
  const heading = userName ? `${greeting}、${userName}さん` : greeting;
  const subtitle = stats ? getStatsMessage(stats.monthlyImages) : "生成履歴と統計";

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
      <div>
        <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-2">
          Dashboard
        </span>
        <h1 className="font-[family-name:var(--font-playfair)] text-[32px] font-bold">
          {heading}
        </h1>
        <p className="text-text-secondary text-sm mt-1.5">
          {subtitle}
        </p>
        {/* Decorative line */}
        <div className="flex items-center gap-2 mt-3">
          <div className="w-8 h-[2px] bg-accent-warm/30 rounded-full" />
          <div className="w-2 h-2 rounded-full bg-accent-warm/40" />
          <div className="w-8 h-[2px] bg-accent-warm/30 rounded-full" />
        </div>
      </div>
      <button
        onClick={onCreateNew}
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-warm text-white rounded-full text-[15px] font-semibold shadow-[0_4px_20px_rgba(232,113,58,.25)] hover:-translate-y-0.5 hover:bg-accent-warm-hover hover:shadow-[0_8px_30px_rgba(232,113,58,.3)] transition-all duration-300 cursor-pointer border-none"
      >
        新しいメニューを作成
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
