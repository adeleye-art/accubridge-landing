"use client";

import React from "react";
import { ShieldCheck, Clock, XCircle } from "lucide-react";
import { getScoreColor, getScoreLabel, getScoreBand } from "@/lib/compliance/calculate-score";

const BRAND = { muted: "#6B7280" };

const STATUS_CONFIG = {
  unverified:  { label: "Unverified",   icon: <XCircle size={14} />,     color: "#ef4444",   bg: "rgba(239,68,68,0.12)",    border: "rgba(239,68,68,0.25)"   },
  in_progress: { label: "In Progress",  icon: <Clock size={14} />,        color: "#D4AF37",   bg: "rgba(212,175,55,0.15)",   border: "rgba(212,175,55,0.30)"  },
  verified:    { label: "Verified",     icon: <ShieldCheck size={14} />,  color: "#06D6A0",   bg: "rgba(6,214,160,0.15)",    border: "rgba(6,214,160,0.30)"   },
};

function RadialProgress({ score, color, size = 140 }: { score: number; color: string; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10}
      />
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke={color} strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={`${strokeDash} ${circumference}`}
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.25,1.1,0.4,1)" }}
      />
    </svg>
  );
}

interface ComplianceScoreCardProps {
  score: number;
  overallStatus: "unverified" | "in_progress" | "verified";
  reviewedBy?: string;
  lastReviewed?: string;
}

export function ComplianceScoreCard({
  score, overallStatus, reviewedBy, lastReviewed,
}: ComplianceScoreCardProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const band  = getScoreBand(score);
  const statusCfg = STATUS_CONFIG[overallStatus];

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col sm:flex-row items-center gap-6 mb-6"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="relative flex-shrink-0">
        <RadialProgress score={score} color={color} size={140} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold" style={{ color }}>{score}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND.muted }}>
            / 100
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
          <h2 className="text-xl font-bold text-white">Compliance Score</h2>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color, borderColor: statusCfg.border }}
          >
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        </div>

        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <span className="text-2xl font-extrabold" style={{ color }}>{label}</span>
          <span className="text-sm" style={{ color: BRAND.muted }}>
            {band === "excellent" ? "— Eligible for Compliance Passport"
             : band === "good"    ? "— Almost there, minor gaps remaining"
             : band === "fair"    ? "— Active compliance work needed"
             :                      "— Significant steps required"}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${score}%`,
                background: `linear-gradient(to right, #ef4444, ${color})`,
                transitionTimingFunction: "cubic-bezier(0.25,1.1,0.4,1)",
              }}
            />
          </div>
          <div className="flex justify-between text-[10px]" style={{ color: BRAND.muted }}>
            <span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span>
          </div>
        </div>

        {reviewedBy && (
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <ShieldCheck size={13} style={{ color: "#06D6A0" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              Reviewed by {reviewedBy}
              {lastReviewed && ` · ${new Date(lastReviewed).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
