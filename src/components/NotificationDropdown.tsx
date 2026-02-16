"use client";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
};

type NotificationDropdownProps = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onClose: () => void;
  onMarkAsRead: (ids: string[]) => void;
  onMarkAllAsRead: () => void;
};

const TYPE_ICONS: Record<string, string> = {
  achievement_unlock: "\u{1F3C6}",
  gallery_reaction: "\u2764\uFE0F",
  new_feature: "\u2728",
  generation_complete: "\u{1F5BC}",
  system: "\u{1F514}",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return new Date(dateStr).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  loading,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  const handleNotificationClick = (n: Notification) => {
    if (!n.read) {
      onMarkAsRead([n.id]);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] bg-bg-secondary rounded-[20px] border border-border-light shadow-[0_8px_30px_rgba(0,0,0,.10)] z-50 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <div className="px-4 py-3 border-b border-border-light flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold text-text-primary">通知</span>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-accent-warm hover:underline cursor-pointer bg-transparent border-none"
            >
              すべて既読
            </button>
          )}
        </div>

        {/* 通知リスト */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-text-muted">読み込み中...</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-text-muted">通知はありません</div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full px-4 py-3 flex items-start gap-3 text-left cursor-pointer border-none transition-colors duration-150
                  ${n.read ? "bg-transparent hover:bg-bg-tertiary" : "bg-accent-warm/[.03] hover:bg-accent-warm/[.06]"}`}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] || "\u{1F514}"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary leading-snug">{n.title}</div>
                  <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">{n.message}</div>
                  <div className="text-[11px] text-text-muted mt-1">{timeAgo(n.created_at)}</div>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-accent-warm flex-shrink-0 mt-1.5" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
