"use client";

type NotificationBellProps = {
  unreadCount: number;
  onClick: () => void;
};

export default function NotificationBell({ unreadCount, onClick }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer
        bg-transparent border-none text-text-secondary hover:bg-bg-tertiary transition-colors mr-3"
      aria-label={`通知${unreadCount > 0 ? `（${unreadCount}件未読）` : ""}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent-warm text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
