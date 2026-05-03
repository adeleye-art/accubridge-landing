"use client";

import React from "react";
import { User, RefreshCw, FileCheck, Landmark } from "lucide-react";
import { ComplianceProfile } from "@/types/accubridge/compliance";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

interface QuickActionsBarProps {
  profile: ComplianceProfile;
  onLaunchKYC: () => void;
  onVerifyCompany: () => void;
  onGeneratePassport: () => void;
  onRequestReview: () => void;
  onApplyFunding: () => void;
}

export function QuickActionsBar({
  profile, onLaunchKYC, onVerifyCompany, onGeneratePassport, onRequestReview, onApplyFunding,
}: QuickActionsBarProps) {
  const passportReady =
    profile.kyc_status === "verified" &&
    profile.company_status === "verified" &&
    profile.risk_calculated;

  const actions = [
    {
      label: profile.kyc_status === "verified" ? "Identity Verified ✓" : "Launch Identity Verification",
      icon: <User size={15} />,
      onClick: onLaunchKYC,
      disabled: profile.kyc_status === "verified",
      bg: profile.kyc_status === "verified" ? `${BRAND.green}10` : BRAND.accent,
      color: profile.kyc_status === "verified" ? BRAND.green : "#fff",
      border: profile.kyc_status === "verified" ? `${BRAND.green}25` : "transparent",
      hoverBg: profile.kyc_status === "verified" ? `${BRAND.green}18` : "#3480b8",
    },
    {
      label: profile.company_status === "verified" ? "Company Verified ✓" : "Verify Company",
      icon: <RefreshCw size={15} />,
      onClick: onVerifyCompany,
      disabled: profile.company_status === "verified",
      bg: profile.company_status === "verified" ? `${BRAND.green}10` : "rgba(255,255,255,0.08)",
      color: profile.company_status === "verified" ? BRAND.green : "rgba(255,255,255,0.8)",
      border: profile.company_status === "verified" ? `${BRAND.green}25` : "rgba(255,255,255,0.12)",
      hoverBg: profile.company_status === "verified" ? `${BRAND.green}18` : "rgba(255,255,255,0.12)",
    },
    {
      label: profile.passport_status === "generated" ? "View Passport" : "Generate Passport",
      icon: <FileCheck size={15} />,
      onClick: onGeneratePassport,
      disabled: !passportReady && profile.passport_status !== "generated",
      bg: passportReady || profile.passport_status === "generated" ? BRAND.gold : "rgba(255,255,255,0.05)",
      color: passportReady || profile.passport_status === "generated" ? BRAND.primary : BRAND.muted,
      border: "transparent",
      hoverBg: passportReady ? "#c49b30" : "rgba(255,255,255,0.05)",
    },
    {
      label: "Request Review",
      icon: <RefreshCw size={15} />,
      onClick: onRequestReview,
      disabled: false,
      bg: `${BRAND.accent}12`,
      color: BRAND.accent,
      border: `${BRAND.accent}25`,
      hoverBg: `${BRAND.accent}20`,
    },
    {
      label: "Apply for Compliance Grant",
      icon: <Landmark size={15} />,
      onClick: onApplyFunding,
      disabled: profile.compliance_score < 70,
      bg: profile.compliance_score >= 70 ? `${BRAND.green}12` : "rgba(255,255,255,0.04)",
      color: profile.compliance_score >= 70 ? BRAND.green : BRAND.muted,
      border: profile.compliance_score >= 70 ? `${BRAND.green}25` : "rgba(255,255,255,0.08)",
      hoverBg: profile.compliance_score >= 70 ? `${BRAND.green}20` : "rgba(255,255,255,0.04)",
    },
  ];

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>
        Quick Actions
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold border transition-all duration-200"
            style={{
              backgroundColor: action.bg,
              color: action.color,
              borderColor: action.border,
              cursor: action.disabled ? "not-allowed" : "pointer",
              opacity: action.disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!action.disabled) e.currentTarget.style.backgroundColor = action.hoverBg; }}
            onMouseLeave={(e) => { if (!action.disabled) e.currentTarget.style.backgroundColor = action.bg; }}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
