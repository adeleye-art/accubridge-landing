"use client";

import React from "react";
import { Building2 } from "lucide-react";
import { ComplianceProfile } from "@/types/compliance";
import { getRiskColor } from "@/lib/compliance/calculate-score";

const BRAND = { accent: "#3E92CC", muted: "#6B7280" };

export function CompanyDetailsCard({ profile }: { profile: ComplianceProfile }) {
  const riskColor = profile.risk_score ? getRiskColor(profile.risk_score.level) : BRAND.muted;

  const countryLabel =
    profile.operating_country === "uk"      ? "🇬🇧 United Kingdom"
    : profile.operating_country === "nigeria" ? "🇳🇬 Nigeria"
    : "🌍 UK & Nigeria";

  const rows = [
    { label: "Company Name",      value: profile.company_name  },
    { label: "Business Type",     value: profile.business_type },
    { label: "Industry",          value: profile.industry      },
    { label: "Operating Country", value: countryLabel          },
    ...(profile.company_verification?.registration_number
      ? [{ label: profile.operating_country === "nigeria" ? "CAC Number" : "Companies House No.", value: profile.company_verification.registration_number }]
      : []),
    ...(profile.risk_score
      ? [
          { label: "Risk Score", value: String(profile.risk_score.score) },
          { label: "Risk Level", value: profile.risk_score.level.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
        ]
      : []),
  ];

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-2">
        <Building2 size={15} style={{ color: BRAND.accent }} />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.accent }}>
          Company Details
        </span>
      </div>
      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <span className="text-[11px] uppercase tracking-wide" style={{ color: BRAND.muted }}>{row.label}</span>
            <span
              className="text-sm font-semibold"
              style={{
                color: row.label === "Risk Score" || row.label === "Risk Level" ? riskColor : "rgba(255,255,255,0.85)",
              }}
            >
              {row.value || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
