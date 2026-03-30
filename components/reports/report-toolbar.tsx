"use client";

import React from "react";
import { Calendar, RefreshCw } from "lucide-react";
import type { ReportPeriod, ReportDateRange } from "@/types/reports";

const BRAND = { gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: "this_month",   label: "This Month"    },
  { value: "last_month",   label: "Last Month"    },
  { value: "this_quarter", label: "This Quarter"  },
  { value: "last_quarter", label: "Last Quarter"  },
  { value: "this_year",    label: "This Year"     },
  { value: "last_year",    label: "Last Year"     },
  { value: "custom",       label: "Custom Range"  },
];

interface Props {
  period: ReportPeriod;
  customRange: ReportDateRange;
  reviewedBy?: string;
  hideGenerateButton?: boolean;
  onPeriodChange: (p: ReportPeriod) => void;
  onCustomRangeChange: (r: ReportDateRange) => void;
  onGenerate: () => void;
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "13px",
  padding: "8px 12px",
  outline: "none",
  colorScheme: "dark",
};

export function ReportToolbar({
  period,
  customRange,
  reviewedBy,
  hideGenerateButton,
  onPeriodChange,
  onCustomRangeChange,
  onGenerate,
}: Props) {
  return (
    <div
      className="rounded-2xl border p-4 mb-5 flex flex-wrap items-center gap-3"
      style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {/* Period select */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Calendar size={14} style={{ color: BRAND.muted }} />
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as ReportPeriod)}
          style={inputStyle}
        >
          {PERIOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} style={{ backgroundColor: "#0A2463" }}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom range inputs */}
      {period === "custom" && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: BRAND.muted }}>From</span>
          <input
            type="date"
            value={customRange.from}
            onChange={(e) => onCustomRangeChange({ ...customRange, from: e.target.value })}
            style={inputStyle}
          />
          <span className="text-xs" style={{ color: BRAND.muted }}>To</span>
          <input
            type="date"
            value={customRange.to}
            onChange={(e) => onCustomRangeChange({ ...customRange, to: e.target.value })}
            style={inputStyle}
          />
        </div>
      )}

      {/* Accountant badge */}
      {reviewedBy && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ml-auto flex-shrink-0"
          style={{
            backgroundColor: `${BRAND.green}10`,
            borderColor: `${BRAND.green}25`,
            color: BRAND.green,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          Reviewed by {reviewedBy}
        </div>
      )}

      {/* Generate button */}
      {!hideGenerateButton && (
        <button
          type="button"
          onClick={onGenerate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-opacity duration-200 hover:opacity-90 flex-shrink-0"
          style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        >
          <RefreshCw size={14} />
          Generate Report
        </button>
      )}
    </div>
  );
}
