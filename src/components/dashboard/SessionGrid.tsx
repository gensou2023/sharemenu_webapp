import type { SessionData } from "@/hooks/useDashboardData";
import SessionCard from "./SessionCard";

export default function SessionGrid({
  sessions,
  loading,
  downloading,
  onDownload,
  onDelete,
  onShare,
  onCreateNew,
}: {
  sessions: SessionData[];
  loading: boolean;
  downloading: string | null;
  onDownload: (item: SessionData) => void;
  onDelete: (item: SessionData) => void;
  onShare?: (item: SessionData) => void;
  onCreateNew: () => void;
}) {
  return (
    <section>
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold text-accent-warm uppercase tracking-[2px] mb-2">
          History
        </span>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          生成履歴
        </h2>
        {/* Decorative line */}
        <div className="flex items-center gap-2 mt-3">
          <div className="w-8 h-[2px] bg-accent-warm/20 rounded-full" />
          <div className="w-2 h-2 rounded-full bg-accent-warm/30" />
          <div className="w-8 h-[2px] bg-accent-warm/20 rounded-full" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-secondary rounded-[20px] border border-border-light overflow-hidden">
              <div className="h-40 bg-border-light animate-pulse" />
              <div className="p-4">
                <div className="w-24 h-4 bg-border-light rounded animate-pulse mb-2" />
                <div className="w-40 h-3 bg-border-light rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* +新規作成カード */}
          <button
            onClick={onCreateNew}
            className="group flex flex-col items-center justify-center min-h-[200px] rounded-[20px] border-2 border-dashed border-border-light bg-transparent cursor-pointer transition-all duration-300 hover:border-accent-warm hover:text-accent-warm hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(232,113,58,.1)] animate-fade-in-up"
          >
            <div className="w-12 h-12 rounded-full bg-accent-warm/[.06] flex items-center justify-center mb-3 transition-colors duration-300 group-hover:bg-accent-warm/[.12]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-secondary transition-colors duration-300 group-hover:text-accent-warm">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-text-secondary transition-colors duration-300 group-hover:text-accent-warm">
              新しいメニューを作成
            </span>
          </button>

          {sessions.map((item, idx) => (
            <SessionCard
              key={item.id}
              item={item}
              index={idx}
              downloading={downloading}
              onDownload={onDownload}
              onDelete={onDelete}
              onShare={onShare}
            />
          ))}
        </div>
      )}
    </section>
  );
}
