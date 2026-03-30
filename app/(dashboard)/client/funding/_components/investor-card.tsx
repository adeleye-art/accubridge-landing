"use client";

import React from "react";
import { TrendingUp, ArrowRight, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import type { InvestorSubmission } from "@/types/funding";

const BRAND = { primary: "#0A2463", accent: "#3E92CC", muted: "#6B7280" };

const STATUS_CONFIG: Record<NonNullable<InvestorSubmission["status"]>, {
  label: string; color: string; bg: string; border: string; icon: React.ReactNode;
}> = {
  draft:        { label: "Draft",       color: BRAND.muted,   bg: "rgba(255,255,255,0.08)",  border: "rgba(255,255,255,0.15)",  icon: <FileText size={10} />    },
  submitted:    { label: "Submitted",   color: BRAND.accent,  bg: `${BRAND.accent}15`,        border: `${BRAND.accent}30`,       icon: <Clock size={10} />       },
  under_review: { label: "In Review",   color: "#D4AF37",     bg: "rgba(212,175,55,0.15)",   border: "rgba(212,175,55,0.30)",   icon: <Clock size={10} />       },
  approved:     { label: "Approved",    color: "#06D6A0",     bg: "rgba(6,214,160,0.15)",    border: "rgba(6,214,160,0.30)",    icon: <CheckCircle2 size={10} /> },
  rejected:     { label: "Not Approved",color: "#ef4444",     bg: "rgba(239,68,68,0.12)",    border: "rgba(239,68,68,0.25)",    icon: <XCircle size={10} />     },
};

interface Props {
  submission: InvestorSubmission | null;
  onOpen: () => void;
}

export function InvestorCard({ submission, onOpen }: Props) {
  const statusCfg = submission ? STATUS_CONFIG[submission.status] : null;

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-5 cursor-pointer transition-all duration-300 group relative overflow-hidden"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.backgroundColor = "rgba(255,255,255,0.07)";
        el.style.borderColor = `${BRAND.accent}35`;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = `0 12px 40px ${BRAND.accent}10`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.backgroundColor = "rgba(255,255,255,0.04)";
        el.style.borderColor = "rgba(255,255,255,0.08)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ backgroundColor: BRAND.accent }} />

      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${BRAND.accent}18`, color: BRAND.accent }}>
          <TrendingUp size={22} />
        </div>
        {statusCfg && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color, borderColor: statusCfg.border }}>
            {statusCfg.icon}{statusCfg.label}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-white font-bold text-lg mb-1">Investor Pitch</h3>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          Upload your pitch deck for review by the AccuBridge team. Approved pitches
          gain access to our investor network for seed and growth funding.
        </p>
      </div>

      {submission ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <FileText size={13} style={{ color: BRAND.muted }} />
            <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.65)" }}>{submission.pitch_deck_name}</span>
          </div>
          <div className="text-xs" style={{ color: BRAND.muted }}>
            Submitted: {new Date(submission.submitted_at).toLocaleDateString("en-GB")}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs" style={{ color: BRAND.muted }}>
          <FileText size={13} />No pitch deck uploaded yet
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <span className="text-sm font-semibold" style={{ color: BRAND.accent }}>
          {submission ? "View submission →" : "Upload pitch deck →"}
        </span>
        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" style={{ color: BRAND.accent }} />
      </div>
    </div>
  );
}
