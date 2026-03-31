"use client";

import React from "react";
import { ShieldCheck, User, BarChart3, FileCheck } from "lucide-react";
import { ComplianceProfile } from "@/types/compliance";
import { getRiskColor } from "@/lib/compliance/calculate-score";

const BRAND = { gold: "#D4AF37", green: "#06D6A0", muted: "#6B7280" };

export function ComplianceOverviewGrid({ profile }: { profile: ComplianceProfile }) {
  const cards = [
    {
      title: "Verification",
      icon: <ShieldCheck size={18} />,
      value: profile.overall_status === "verified" ? "Verified" : profile.overall_status === "in_progress" ? "In Progress" : "Unverified",
      sub: `KYC: ${profile.kyc_status.replace("_", " ")}`,
      color: profile.overall_status === "verified" ? BRAND.green : profile.overall_status === "in_progress" ? BRAND.gold : "#ef4444",
    },
    {
      title: "KYC Status",
      icon: <User size={18} />,
      value: profile.kyc_status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      sub: profile.kyc_data?.id_type ? `ID: ${profile.kyc_data.id_type.replace("_", " ")}` : "No ID submitted",
      color: profile.kyc_status === "verified" ? BRAND.green : profile.kyc_status === "failed" ? "#ef4444" : BRAND.gold,
    },
    {
      title: "Risk Score",
      icon: <BarChart3 size={18} />,
      value: profile.risk_score ? String(profile.risk_score.score) : "—",
      sub: profile.risk_score ? `Risk Level: ${profile.risk_score.level.replace("_", " ")}` : "Awaiting Verification",
      color: profile.risk_score ? getRiskColor(profile.risk_score.level) : BRAND.muted,
    },
    {
      title: "Passport",
      icon: <FileCheck size={18} />,
      value: profile.passport?.passport_id || (profile.passport_status === "locked" ? "Locked" : "Not Generated"),
      sub: profile.passport
        ? `Expires: ${new Date(profile.passport.expires_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
        : profile.passport_status === "locked"
        ? "Complete all steps first"
        : "Ready to generate",
      color: profile.passport ? BRAND.gold : BRAND.muted,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border p-4 flex flex-col gap-3"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${card.color}15`, color: card.color }}
            >
              {card.icon}
            </div>
            <span className="text-xs" style={{ color: BRAND.muted }}>{card.title}</span>
          </div>
          <div>
            <div className="text-base font-bold truncate" style={{ color: card.color }}>{card.value}</div>
            <div className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{card.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
