"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { ComplianceProfile } from "@/types/accubridge/compliance";

const BRAND = { accent: "#3E92CC", green: "#06D6A0", muted: "#6B7280" };

export function ComplianceFlagsCard({ profile }: { profile: ComplianceProfile }) {
  const risk = profile.risk_score;

  const flags = [
    {
      label: "AML Status",
      value: risk ? risk.aml_status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Not Checked",
      isClear:   risk?.aml_status === "clear",
      isPending: !risk || risk.aml_status === "not_checked",
      isFlagged: risk?.aml_status === "flagged" || risk?.aml_status === "under_review",
    },
    {
      label: "PEP Flag",
      value: risk ? (risk.pep_flag ? "Flagged" : "Clear") : "Not Checked",
      isClear:   risk !== undefined && !risk.pep_flag,
      isPending: !risk,
      isFlagged: risk?.pep_flag === true,
    },
    {
      label: "Sanctions Flag",
      value: risk ? (risk.sanctions_flag ? "Flagged" : "Clear") : "Not Checked",
      isClear:   risk !== undefined && !risk.sanctions_flag,
      isPending: !risk,
      isFlagged: risk?.sanctions_flag === true,
    },
    {
      label: "Adverse Media",
      value: risk ? (risk.adverse_media_flag ? "Flagged" : "Clear") : "Not Checked",
      isClear:   risk !== undefined && !risk.adverse_media_flag,
      isPending: !risk,
      isFlagged: risk?.adverse_media_flag === true,
    },
  ];

  const allClear = flags.every((f) => f.isClear);

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} style={{ color: BRAND.accent }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.accent }}>
            Compliance Flags
          </span>
        </div>
        {allClear && risk && (
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ backgroundColor: `${BRAND.green}15`, color: BRAND.green, border: `1px solid ${BRAND.green}30` }}
          >
            <CheckCircle2 size={10} /> All Clear
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {flags.map((flag) => (
          <div
            key={flag.label}
            className="flex items-center gap-3 p-3 rounded-xl border"
            style={{
              backgroundColor: flag.isFlagged ? "rgba(239,68,68,0.08)" : flag.isClear ? `${BRAND.green}06` : "rgba(255,255,255,0.03)",
              borderColor: flag.isFlagged ? "rgba(239,68,68,0.2)" : flag.isClear ? `${BRAND.green}15` : "rgba(255,255,255,0.06)",
            }}
          >
            <span style={{ color: flag.isFlagged ? "#ef4444" : flag.isClear ? BRAND.green : BRAND.muted, flexShrink: 0 }}>
              {flag.isClear ? <CheckCircle2 size={15} /> : flag.isFlagged ? <AlertTriangle size={15} /> : <Clock size={15} />}
            </span>
            <div className="min-w-0">
              <div className="text-[11px]" style={{ color: BRAND.muted }}>{flag.label}</div>
              <div
                className="text-sm font-semibold"
                style={{ color: flag.isFlagged ? "#ef4444" : flag.isClear ? BRAND.green : BRAND.muted }}
              >
                {flag.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!risk && (
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
          Complete identity and company verification to run compliance checks
        </p>
      )}
    </div>
  );
}
