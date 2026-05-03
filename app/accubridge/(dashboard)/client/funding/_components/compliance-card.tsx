"use client";

import React from "react";
import { ShieldCheck, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import type { ComplianceEligibility } from "@/types/accubridge/funding";

const BRAND = { primary: "#0A2463", green: "#06D6A0", muted: "#6B7280" };

interface Props {
  eligibility: ComplianceEligibility;
  onOpen: () => void;
}

export function ComplianceCard({ eligibility, onOpen }: Props) {
  const { is_eligible, compliance_score, months_active } = eligibility;

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-5 cursor-pointer transition-all duration-300 group relative overflow-hidden"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.backgroundColor = "rgba(255,255,255,0.07)";
        el.style.borderColor = `${BRAND.green}35`;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = `0 12px 40px ${BRAND.green}10`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.backgroundColor = "rgba(255,255,255,0.04)";
        el.style.borderColor = "rgba(255,255,255,0.08)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ backgroundColor: BRAND.green }} />

      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${BRAND.green}18`, color: BRAND.green }}>
          <ShieldCheck size={22} />
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1"
          style={{
            backgroundColor: is_eligible ? `${BRAND.green}15` : "rgba(239,68,68,0.12)",
            color: is_eligible ? BRAND.green : "#ef4444",
            borderColor: is_eligible ? `${BRAND.green}30` : "rgba(239,68,68,0.25)",
          }}>
          {is_eligible ? <><CheckCircle2 size={10} />Eligible</> : <><XCircle size={10} />Not Eligible</>}
        </span>
      </div>

      <div>
        <h3 className="text-white font-bold text-lg mb-1">Compliance Grants</h3>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          Qualify by maintaining a strong compliance score over 12+ months.
          Grants are awarded based on consistent platform activity and financial discipline.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {[
          { label: "Compliance Score", value: compliance_score, min: 70,  max: 100, unit: "",    passes: compliance_score >= 70  },
          { label: "Months Active",    value: months_active,    min: 12,  max: 24,  unit: " mo", passes: months_active >= 12     },
        ].map((c) => (
          <div key={c.label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: BRAND.muted }}>{c.label}</span>
              <span className="text-xs font-bold" style={{ color: c.passes ? BRAND.green : "#ef4444" }}>
                {c.value}{c.unit}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min((c.value / c.max) * 100, 100)}%`, backgroundColor: c.passes ? BRAND.green : "#ef4444" }} />
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: BRAND.muted }}>Min required: {c.min}{c.unit}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <span className="text-sm font-semibold" style={{ color: BRAND.green }}>
          {is_eligible ? "Apply now →" : "Check eligibility →"}
        </span>
        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" style={{ color: BRAND.green }} />
      </div>
    </div>
  );
}
