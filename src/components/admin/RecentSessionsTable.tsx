"use client";

type RecentSession = {
  id: string;
  shop_name: string | null;
  title: string;
  status: string;
  user_name: string;
  created_at: string;
  imageCount: number;
};

type Props = {
  sessions: RecentSession[];
};

export default function RecentSessionsTable({ sessions }: Props) {
  return (
    <div className="bg-bg-secondary rounded-[12px] border border-border-light overflow-hidden">
      <div className="px-5 py-3 border-b border-border-light">
        <h3 className="text-sm font-semibold">最近のセッション</h3>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-10 text-text-muted text-sm">
          セッションデータがありません
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left px-4 py-2.5 text-xs text-text-muted uppercase tracking-wider">
                店名
              </th>
              <th className="text-left px-4 py-2.5 text-xs text-text-muted uppercase tracking-wider">
                ユーザー
              </th>
              <th className="text-left px-4 py-2.5 text-xs text-text-muted uppercase tracking-wider">
                ステータス
              </th>
              <th className="text-left px-4 py-2.5 text-xs text-text-muted uppercase tracking-wider">
                日時
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr
                key={s.id}
                className="border-b border-border-light last:border-none hover:bg-bg-primary transition-colors"
              >
                <td className="px-4 py-2.5 font-medium truncate max-w-[160px]">
                  {s.shop_name || s.title}
                </td>
                <td className="px-4 py-2.5 text-text-muted truncate max-w-[120px]">
                  {s.user_name}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      s.status === "completed"
                        ? "bg-accent-olive/20 text-accent-olive"
                        : "bg-accent-warm/20 text-accent-warm"
                    }`}
                  >
                    {s.status === "completed" ? "完了" : "進行中"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-text-muted text-xs">
                  {new Date(s.created_at).toLocaleDateString("ja-JP", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
