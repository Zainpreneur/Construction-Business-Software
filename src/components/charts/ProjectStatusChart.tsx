"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  Lead: "#a8a29a",
  Estimating: "#1d4ed8",
  Planning: "#60a5fa",
  Active: "#1a7f4e",
  "On Hold": "#b45309",
  Completed: "#c2540d",
  Cancelled: "#b3261e",
};

export function ProjectStatusChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const nonZero = data.filter((d) => d.value > 0);

  if (nonZero.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted">
        No projects yet
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="55%" height={220}>
        <PieChart>
          <Pie
            data={nonZero}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={0}
          >
            {nonZero.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#a8a29a"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "#e6e2db",
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex-1 space-y-1.5 text-sm">
        {nonZero.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-foreground">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: COLORS[entry.name] ?? "#a8a29a" }}
              />
              {entry.name}
            </span>
            <span className="font-medium text-muted">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
