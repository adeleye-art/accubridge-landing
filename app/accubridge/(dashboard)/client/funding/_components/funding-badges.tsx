// Shared badge components used by applications-table and view-all-modal

import React from "react";
import type { ApplicationStatus, FundingType } from "@/types/accubridge/funding";

export function AppStatusBadge({ status }: { status: ApplicationStatus }) {
  const cfg: Record<ApplicationStatus, { label: string; bg: string; color: string; border: string }> = {
    entered:      { label: "Entered",      bg: "rgba(255,255,255,0.08)",  color: "rgba(255,255,255,0.6)", border: "rgba(255,255,255,0.15)"  },
    pending:      { label: "Pending",      bg: "rgba(212,175,55,0.15)",   color: "#D4AF37",               border: "rgba(212,175,55,0.30)"   },
    under_review: { label: "In Review",    bg: "rgba(62,146,204,0.15)",   color: "#3E92CC",               border: "rgba(62,146,204,0.30)"   },
    approved:     { label: "Approved",     bg: "rgba(6,214,160,0.15)",    color: "#06D6A0",               border: "rgba(6,214,160,0.30)"    },
    rejected:     { label: "Rejected",     bg: "rgba(239,68,68,0.12)",    color: "#ef4444",               border: "rgba(239,68,68,0.25)"    },
    eligible:     { label: "Eligible",     bg: "rgba(6,214,160,0.15)",    color: "#06D6A0",               border: "rgba(6,214,160,0.30)"    },
    ineligible:   { label: "Not Eligible", bg: "rgba(239,68,68,0.12)",    color: "#ef4444",               border: "rgba(239,68,68,0.25)"    },
  };
  const c = cfg[status] ?? cfg.pending;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border"
      style={{ backgroundColor: c.bg, color: c.color, borderColor: c.border }}
    >
      {c.label}
    </span>
  );
}

export function FundingTypeBadge({ type }: { type: FundingType }) {
  const cfg: Record<FundingType, { label: string; color: string; bg: string }> = {
    raffle:     { label: "Raffle",     color: "#D4AF37", bg: "rgba(212,175,55,0.12)"  },
    compliance: { label: "Compliance", color: "#06D6A0", bg: "rgba(6,214,160,0.10)"   },
    investor:   { label: "Investor",   color: "#3E92CC", bg: "rgba(62,146,204,0.12)"  },
  };
  const c = cfg[type];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}
