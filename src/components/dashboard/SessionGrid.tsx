import Link from "next/link";
import type { SessionData } from "@/hooks/useDashboardData";
import SessionCard from "./SessionCard";

export default function SessionGrid({
  sessions,
  loading,
  downloading,
  onDownload,
  onDelete,
  onShare,
}: {
  sessions: SessionData[];
  loading: boolean;
  downloading: string | null;
  onDownload: (item: SessionData) => void;
  onDelete: (item: SessionData) => void;
  onShare?: (item: SessionData) => void;
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
      ) : sessions.length === 0 ? (
        /* 空状態 — リッチデザイン */
        <div className="text-center py-20 relative">
          {/* Decorative background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 bg-accent-warm/[.04] rounded-full blur-2xl" />
          </div>

          <div className="relative z-10">
            {/* Emoji with decorative ring */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent-warm/[.06] border border-accent-warm/10 mb-6">
              <span className="text-5xl">🍽</span>
            </div>

            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2 text-text-primary">
              まだ生成履歴がありません
            </h3>
            <p className="text-sm text-text-muted mb-6 max-w-[320px] mx-auto leading-relaxed">
              AIとチャットするだけで、プロ品質のメニュー画像を作成できます
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-warm text-white rounded-full text-[15px] font-semibold no-underline transition-all duration-300 hover:bg-accent-warm-hover hover:shadow-[0_4px_20px_rgba(232,113,58,.3)] hover:-translate-y-0.5"
            >
              最初のメニューを作成
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
