type Props = {
  label: string;
  current: number;
  limit: number;
  unit: string;
};

export default function UsageProgressBar({ label, current, limit, unit }: Props) {
  const isUnlimited = limit < 0;
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <span className={`text-xs font-semibold ${isNearLimit ? "text-accent-warm" : "text-text-primary"}`}>
          {current}{unit}
          {isUnlimited ? (
            <span className="text-text-muted ml-1">/ 無制限</span>
          ) : (
            <span className="text-text-muted ml-1">/ {limit}{unit}</span>
          )}
        </span>
      </div>
      <div className="h-2 rounded-full bg-border-light overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isNearLimit ? "bg-accent-warm" : "bg-accent-olive"
          }`}
          style={{ width: isUnlimited ? "0%" : `${percentage}%` }}
        />
      </div>
    </div>
  );
}
