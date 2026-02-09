const stats = [
  {
    label: "総生成数",
    value: "24",
    sub: "↑ 先月比 +8",
    subColor: "text-accent-olive",
  },
  {
    label: "今月の生成",
    value: "6",
    sub: "残り: 無制限（Pro）",
    subColor: "text-accent-olive",
  },
  {
    label: "保存セッション",
    value: "4",
    sub: "直近30日間",
    subColor: "text-accent-olive",
  },
];

export default function StatsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-9">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-bg-secondary rounded-[20px] p-6 border border-border-light"
        >
          <div className="text-xs text-text-muted uppercase tracking-[1px] mb-2">
            {stat.label}
          </div>
          <div className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
            {stat.value}
          </div>
          <div className={`text-xs mt-1 ${stat.subColor}`}>
            {stat.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
