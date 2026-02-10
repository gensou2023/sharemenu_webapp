"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type CompletionDonutProps = {
  completed: number;
  active: number;
};

const COLORS = ["#7B8A64", "#E8E2DA"];

export default function CompletionDonut({
  completed,
  active,
}: CompletionDonutProps) {
  const total = completed + active;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const data = [
    { name: "完了", value: completed },
    { name: "進行中", value: active },
  ];

  return (
    <div className="bg-bg-secondary rounded-[12px] p-5 border border-border-light">
      <h3 className="text-sm font-semibold mb-4">セッション完了率</h3>

      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index]}
                  stroke="none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* 中央のパーセンテージ */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-text-primary">
              {rate}
              <span className="text-lg">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full bg-accent-olive inline-block" />
          <span className="text-text-secondary">
            完了 ({completed})
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: "#E8E2DA" }}
          />
          <span className="text-text-secondary">
            進行中 ({active})
          </span>
        </div>
      </div>
    </div>
  );
}
