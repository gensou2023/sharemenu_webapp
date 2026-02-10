"use client";

type ApiHealthProps = {
  totalCalls: number;
  successRate: number;
  avgResponseMs: number;
  errorCount: number;
};

export default function ApiHealthIndicator({
  totalCalls,
  successRate,
  avgResponseMs,
  errorCount,
}: ApiHealthProps) {
  const healthColor =
    successRate >= 95
      ? "bg-accent-olive"
      : successRate >= 90
        ? "bg-yellow-500"
        : "bg-red-500";

  const responseColor =
    avgResponseMs < 2000
      ? "text-accent-olive"
      : avgResponseMs < 5000
        ? "text-yellow-600"
        : "text-red-500";

  return (
    <div className="bg-bg-secondary rounded-[12px] border border-border-light overflow-hidden">
      <div className="px-5 py-3 border-b border-border-light">
        <h3 className="text-sm font-semibold">APIヘルス（30日間）</h3>
      </div>

      {/* ヘルスバー */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-muted">成功率</span>
          <span className="text-xs font-semibold text-text-primary">
            {successRate}%
          </span>
        </div>
        <div className="h-2 bg-border-light rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${healthColor}`}
            style={{ width: `${Math.min(successRate, 100)}%` }}
          />
        </div>
      </div>

      {/* メトリクスグリッド */}
      <div className="grid grid-cols-2 gap-px bg-border-light mx-5 my-4 rounded-[8px] overflow-hidden">
        <div className="bg-bg-secondary p-3">
          <div className="text-xs text-text-muted mb-1">総呼び出し</div>
          <div className="text-lg font-bold text-text-primary">
            {totalCalls.toLocaleString()}
          </div>
        </div>
        <div className="bg-bg-secondary p-3">
          <div className="text-xs text-text-muted mb-1">平均応答</div>
          <div className={`text-lg font-bold ${responseColor}`}>
            {avgResponseMs > 0 ? `${(avgResponseMs / 1000).toFixed(1)}s` : "—"}
          </div>
        </div>
        <div className="bg-bg-secondary p-3">
          <div className="text-xs text-text-muted mb-1">成功</div>
          <div className="text-lg font-bold text-accent-olive">
            {(totalCalls - errorCount).toLocaleString()}
          </div>
        </div>
        <div className="bg-bg-secondary p-3">
          <div className="text-xs text-text-muted mb-1">エラー</div>
          <div
            className={`text-lg font-bold ${
              errorCount > 0 ? "text-red-500" : "text-text-primary"
            }`}
          >
            {errorCount}
          </div>
        </div>
      </div>
    </div>
  );
}
