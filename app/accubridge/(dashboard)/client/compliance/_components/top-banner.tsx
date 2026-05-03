"use client";

import React from "react";
import { Download, RefreshCw, Wrench, ShieldCheck, AlertTriangle, Clock } from "lucide-react";
import { getScoreColor, getScoreBandLabel, getScoreBand } from "@/lib/accubridge/compliance/calculate-score";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

const BAND_CONFIG = {
  strong:    { color: BRAND.green,  bg: `${BRAND.green}12`,  border: `${BRAND.green}30`,  icon: <ShieldCheck size={14} /> },
  good:      { color: BRAND.accent, bg: `${BRAND.accent}12`, border: `${BRAND.accent}30`, icon: <ShieldCheck size={14} /> },
  attention: { color: BRAND.gold,   bg: `${BRAND.gold}12`,   border: `${BRAND.gold}30`,   icon: <AlertTriangle size={14} /> },
  high_risk: { color: "#ef4444",    bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.30)", icon: <AlertTriangle size={14} /> },
};

interface TopBannerProps {
  score: number;
  lastUpdated: string;
  manualReviewRequired: boolean;
  onDownload: () => void;
  onRequestReview: () => void;
  onApplyFixes: () => void;
}

export function TopBanner({
  score,
  lastUpdated,
  manualReviewRequired,
  onDownload,
  onRequestReview,
  onApplyFixes,
}: TopBannerProps) {
  const color = getScoreColor(score);
  const bandKey = getScoreBand(score);
  const bandLabel = getScoreBandLabel(score);
  const bandCfg = BAND_CONFIG[bandKey];

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;

  return (
    <div
      className="rounded-2xl border p-6 mb-6"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">

        {/* Radial score */}
        <div className="relative flex-shrink-0 w-[120px] h-[120px]">
          <svg width={120} height={120} viewBox="0 0 120 120" className="rotate-[-90deg]">
            <circle cx={60} cy={60} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
            <circle
              cx={60} cy={60} r={radius} fill="none" stroke={color} strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.25,1.1,0.4,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold" style={{ color }}>{score}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND.muted }}>/ 100</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col gap-3 text-center sm:text-left w-full">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <h2 className="text-xl font-bold text-white">Compliance Score</h2>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
              style={{ backgroundColor: bandCfg.bg, color: bandCfg.color, borderColor: bandCfg.border }}
            >
              {bandCfg.icon}{bandLabel}
            </span>
            {manualReviewRequired && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444", borderColor: "rgba(239,68,68,0.25)" }}
              >
                <AlertTriangle size={12} />Manual Review Required
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-1.5 w-full">
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${score}%`, background: `linear-gradient(to right, #ef4444, ${color})` }}
              />
            </div>
            <div className="flex justify-between text-[10px]" style={{ color: BRAND.muted }}>
              <span>0 — High Risk</span>
              <span>50 — Needs Attention</span>
              <span>70 — Good</span>
              <span>85–100 — Strong</span>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs justify-center sm:justify-start" style={{ color: "rgba(255,255,255,0.45)" }}>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              Last updated: {new Date(lastUpdated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span>·</span>
            <span className={manualReviewRequired ? "text-red-400" : ""} style={{ color: manualReviewRequired ? "#ef4444" : BRAND.green }}>
              {manualReviewRequired ? "Manual review required" : "No manual review required"}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold border transition-all duration-200"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: "#fff" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
            >
              <Download size={13} />Download Compliance Summary
            </button>
            <button
              type="button"
              onClick={onRequestReview}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold border transition-all duration-200"
              style={{ backgroundColor: `${BRAND.accent}12`, borderColor: `${BRAND.accent}30`, color: BRAND.accent }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}20`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}12`; }}
            >
              <RefreshCw size={13} />Request Review
            </button>
            <button
              type="button"
              onClick={onApplyFixes}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#c49b30"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BRAND.gold; }}
            >
              <Wrench size={13} />Apply Fixes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
