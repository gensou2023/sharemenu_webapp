"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

type KpiCardProps = {
  label: string;
  value: number;
  changePercent: number;
  sparklineData: number[];
  accentColor: string;
  chartColor: string;
  suffix?: string;
};

export default function KpiCard({
  label,
  value,
  changePercent,
  sparklineData,
  accentColor,
  chartColor,
  suffix = "",
}: KpiCardProps) {
  const isPositive = changePercent >= 0;
  const chartData = sparklineData.map((v) => ({ v }));

  return (
    <div className="bg-bg-secondary rounded-[12px] p-5 border border-border-light relative overflow-hidden">
      {/* ラベル */}
      <div className="text-xs text-text-muted uppercase tracking-[1px] mb-2">
        {label}
      </div>

      {/* 値 + 前期比 */}
      <div className="flex items-end justify-between">
        <div>
          <div
            className={`font-[family-name:var(--font-playfair)] text-3xl font-bold ${accentColor}`}
          >
            {value.toLocaleString()}
            {suffix && (
              <span className="text-lg ml-0.5">{suffix}</span>
            )}
          </div>
          {changePercent !== 0 && (
            <div
              className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
                isPositive ? "text-accent-olive" : "text-red-500"
              }`}
            >
              <span>{isPositive ? "▲" : "▼"}</span>
              <span>
                {isPositive ? "+" : ""}
                {changePercent}% vs 前期
              </span>
            </div>
          )}
        </div>

        {/* ミニスパークライン */}
        {chartData.length > 1 && (
          <div className="w-[80px] h-[36px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id={`sparkFill-${label}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={chartColor}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#sparkFill-${label})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
