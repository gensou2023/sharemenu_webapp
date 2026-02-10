"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DataPoint = {
  date: string;
  users: number;
  sessions: number;
  images: number;
};

type TrendChartProps = {
  data: DataPoint[];
};

const LINES = [
  { key: "users" as const, label: "ユーザー", color: "#C4713B" },
  { key: "sessions" as const, label: "セッション", color: "#7B8A64" },
  { key: "images" as const, label: "画像", color: "#D4A853" },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="bg-bg-dark text-text-inverse rounded-[8px] px-3 py-2 shadow-lg text-xs">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.name}:</span>
          <span className="font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function TrendChart({ data }: TrendChartProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="bg-bg-secondary rounded-[12px] p-5 border border-border-light">
      <h3 className="text-sm font-semibold mb-4">日次トレンド（30日間）</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E8E2DA"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: "#9B9590" }}
              axisLine={{ stroke: "#E8E2DA" }}
              tickLine={false}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9B9590" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            {LINES.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
