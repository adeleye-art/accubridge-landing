import React from "react";

const BRAND = { muted: "#6B7280" };

interface StatItem {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}

export function SummaryStatCards({ stats }: { stats: StatItem[] }) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border p-4 flex flex-col gap-2"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: s.color }}>{s.icon}</span>
            <span className="text-xs" style={{ color: BRAND.muted }}>{s.label}</span>
          </div>
          <span className="text-xl font-bold truncate" style={{ color: s.color }}>
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}
