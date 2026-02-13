import Link from "next/link";

export default function QuickActions({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex flex-wrap gap-3 mb-9">
      <button
        onClick={onCreateNew}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-warm/10 text-accent-warm text-[13px] font-semibold border border-accent-warm/20 transition-all duration-300 hover:bg-accent-warm hover:text-white hover:shadow-[0_4px_16px_rgba(232,113,58,.2)] cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        新規作成
      </button>
      <Link
        href="/chat"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-gold/10 text-accent-gold text-[13px] font-semibold border border-accent-gold/20 transition-all duration-300 hover:bg-accent-gold hover:text-white hover:shadow-[0_4px_16px_rgba(212,168,83,.2)] no-underline"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        チャットを開く
      </Link>
      <Link
        href="/#pricing"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-olive/10 text-accent-olive text-[13px] font-semibold border border-accent-olive/20 transition-all duration-300 hover:bg-accent-olive hover:text-white hover:shadow-[0_4px_16px_rgba(123,138,100,.2)] no-underline"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        プラン変更
      </Link>
    </div>
  );
}
