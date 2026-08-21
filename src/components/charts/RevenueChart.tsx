"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number; expenses: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6e2db" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="#6b6560"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="#6b6560"
          tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
          width={44}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.03)" }}
          formatter={(value) => formatCurrency(value as number)}
          contentStyle={{
            borderRadius: 8,
            borderColor: "#e6e2db",
            fontSize: 13,
          }}
        />
        <Bar dataKey="revenue" name="Revenue" fill="#c2540d" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#d8d2c6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
