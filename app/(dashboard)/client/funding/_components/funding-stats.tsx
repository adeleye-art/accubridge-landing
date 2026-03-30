"use client";

import React from "react";
import { Send, Activity, Trophy, Ticket } from "lucide-react";
import type { FundingSummaryStats } from "@/types/funding";

const BRAND = { gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

export function FundingStats({ stats }: { stats: FundingSummaryStats }) {
  const items = [
    { label: "Total Applied",       value: stats.total_applied,                                      icon: <Send size={18} />,     color: BRAND.accent              },
    { label: "Active Applications", value: stats.active_applications,                                icon: <Activity size={18} />, color: BRAND.gold                },
    { label: "Total Awarded",       value: `£${stats.total_awarded.toLocaleString("en-GB")}`,        icon: <Trophy size={18} />,   color: BRAND.green               },
    { label: "Raffle Entries",      value: stats.raffle_entries,                                     icon: <Ticket size={18} />,   color: "rgba(255,255,255,0.5)"   },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border p-5 flex flex-col gap-3"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${item.color}15`, color: item.color }}
          >
            {item.icon}
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
            <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
