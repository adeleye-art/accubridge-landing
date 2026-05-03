"use client";

import React from "react";
import { CheckCircle2, Clock, AlertOctagon } from "lucide-react";
import type { ReconciliationStats } from "@/types/accubridge/reconciliation";

const BRAND = { green: "#06D6A0", gold: "#D4AF37", muted: "#6B7280", accent: "#3E92CC" };

// ─── Circular gauge ───────────────────────────────────────────────────────────

export function ReconciliationGauge({ stats, isLoaded }: { stats: ReconciliationStats; isLoaded: boolean }) {
  const pct     = isLoaded && stats.total > 0 ? stats.matched / stats.total : 0;
  const r       = 52;
  const circ    = 2 * Math.PI * r;
  // When 100% matched (matched === total), use nearly full circle to avoid SVG rendering gap
  const filled  = stats.matched === stats.total && isLoaded ? circ * 0.998 : pct * circ;
  const color   = pct >= 0.999 ? BRAND.green : pct >= 0.5 ? BRAND.accent : BRAND.gold;

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col items-center justify-center gap-4"
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.08)",
        minHeight: "160px",
      }}
    >
      <svg width="128" height="128" viewBox="0 0 128 128">
        {/* Track */}
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        {/* Progress — starts at top */}
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={isLoaded ? color : "rgba(255,255,255,0.1)"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          strokeDashoffset={circ / 4}
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.25,1.1,0.4,1)" }}
        />
        {/* Centre label */}
        <text x="64" y="58" textAnchor="middle" fontSize="22" fontWeight="800" fill="white">
          {isLoaded ? `${Math.round(pct * 100)}%` : "—"}
        </text>
        <text x="64" y="76" textAnchor="middle" fontSize="10" fill={BRAND.muted}>
          reconciled
        </text>
        {isLoaded && (
          <text x="64" y="91" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.35)">
            {stats.matched}/{stats.total} lines
          </text>
        )}
      </svg>

      {/* Mini legend */}
      <div className="flex items-center gap-4 text-[11px]">
        <span style={{ color: BRAND.green }}>● {isLoaded ? stats.matched : "—"} Matched</span>
        <span style={{ color: BRAND.gold  }}>● {isLoaded ? stats.unmatched : "—"} Unmatched</span>
        <span style={{ color: "#ef4444"   }}>● {isLoaded ? stats.flagged : "—"} Flagged</span>
      </div>
    </div>
  );
}

// ─── 3 stat cards ─────────────────────────────────────────────────────────────

interface Props {
  stats: ReconciliationStats;
  isLoaded: boolean;
}

export function ReconciliationStatsCards({ stats, isLoaded }: Props) {
  const cards = [
    {
      label: "Matched",
      value: stats.matched,
      sub: isLoaded ? `£${stats.matchedAmount.toFixed(2)} reconciled` : "—",
      icon: <CheckCircle2 size={20} />,
      iconBg: `${BRAND.green}20`,
      iconColor: BRAND.green,
      valueColor: BRAND.green,
    },
    {
      label: "Unmatched",
      value: stats.unmatched,
      sub: isLoaded ? `£${stats.unmatchedAmount.toFixed(2)} to review` : "—",
      icon: <Clock size={20} />,
      iconBg: `${BRAND.gold}20`,
      iconColor: BRAND.gold,
      valueColor: BRAND.gold,
    },
    {
      label: "Flagged",
      value: stats.flagged,
      sub: isLoaded ? "Needs manual review" : "—",
      icon: <AlertOctagon size={20} />,
      iconBg: "rgba(239,68,68,0.18)",
      iconColor: "#ef4444",
      valueColor: "#ef4444",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border p-5 flex flex-col gap-3"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: card.iconBg, color: card.iconColor }}
            >
              {card.icon}
            </div>
            <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
              {card.label}
            </span>
          </div>
          <div>
            <div
              className="text-3xl font-bold"
              style={{ color: isLoaded ? card.valueColor : "rgba(255,255,255,0.2)" }}
            >
              {isLoaded ? card.value : "—"}
            </div>
            <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
              {card.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
