"use client";

import React from "react";
import {
  User, Building2, BarChart3, FileCheck,
  CheckCircle2, Clock, Lock, AlertCircle, ChevronRight, Loader2,
} from "lucide-react";
import { ComplianceProfile } from "@/types/compliance";

const BRAND = { gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

function StepStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    not_started:     { label: "Not Started",    color: BRAND.muted,  bg: "rgba(255,255,255,0.06)",  border: "rgba(255,255,255,0.12)", icon: <Clock size={11} /> },
    in_progress:     { label: "In Progress",    color: BRAND.gold,   bg: `${BRAND.gold}15`,          border: `${BRAND.gold}30`,        icon: <Loader2 size={11} className="animate-spin" /> },
    pending:         { label: "Pending",        color: BRAND.gold,   bg: `${BRAND.gold}15`,          border: `${BRAND.gold}30`,        icon: <Clock size={11} /> },
    verified:        { label: "Verified",       color: BRAND.green,  bg: `${BRAND.green}15`,         border: `${BRAND.green}30`,       icon: <CheckCircle2 size={11} /> },
    complete:        { label: "Complete",       color: BRAND.green,  bg: `${BRAND.green}15`,         border: `${BRAND.green}30`,       icon: <CheckCircle2 size={11} /> },
    failed:          { label: "Failed",         color: "#ef4444",    bg: "rgba(239,68,68,0.12)",      border: "rgba(239,68,68,0.25)",   icon: <AlertCircle size={11} /> },
    locked:          { label: "Locked",         color: BRAND.muted,  bg: "rgba(255,255,255,0.05)",   border: "rgba(255,255,255,0.1)",  icon: <Lock size={11} /> },
    calculating:     { label: "Calculating",    color: BRAND.accent, bg: `${BRAND.accent}15`,         border: `${BRAND.accent}30`,      icon: <Loader2 size={11} className="animate-spin" /> },
    generated:       { label: "Generated",      color: BRAND.gold,   bg: `${BRAND.gold}15`,           border: `${BRAND.gold}30`,        icon: <FileCheck size={11} /> },
    not_generated:   { label: "Not Generated",  color: BRAND.muted,  bg: "rgba(255,255,255,0.06)",   border: "rgba(255,255,255,0.12)", icon: <Clock size={11} /> },
  };

  const c = cfg[status] || cfg.not_started;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
      style={{ backgroundColor: c.bg, color: c.color, borderColor: c.border }}
    >
      {c.icon}{c.label}
    </span>
  );
}

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: string;
  isLocked: boolean;
  actionLabel: string;
  onAction: () => void;
}

interface ComplianceJourneyProps {
  profile: ComplianceProfile;
  onLaunchKYC: () => void;
  onVerifyCompany: () => void;
  onGeneratePassport: () => void;
  onViewRiskScore: () => void;
}

export function ComplianceJourney({
  profile, onLaunchKYC, onVerifyCompany, onGeneratePassport, onViewRiskScore,
}: ComplianceJourneyProps) {
  const kycDone     = profile.kyc_status === "verified";
  const companyDone = profile.company_status === "verified";
  const riskDone    = profile.risk_calculated;
  const passportUnlocked = kycDone && companyDone && riskDone;

  const steps: JourneyStep[] = [
    {
      id: "identity",
      title: "Identity Verification",
      description: "Complete KYC/AML checks to verify your identity and confirm your compliance status. Requires a valid government-issued ID.",
      icon: <User size={20} />,
      status: profile.kyc_status,
      isLocked: false,
      actionLabel: profile.kyc_status === "verified" ? "Re-verify" : profile.kyc_status === "in_progress" ? "Continue" : "Launch Verification",
      onAction: onLaunchKYC,
    },
    {
      id: "company",
      title: "Company Verification",
      description: profile.operating_country === "nigeria"
        ? "Validate your Nigerian company registration via the CAC portal to link your business entity."
        : "Validate your UK company registration via Companies House to link your business entity.",
      icon: <Building2 size={20} />,
      status: profile.company_status,
      isLocked: false,
      actionLabel: profile.company_status === "verified" ? "View Details" : profile.company_status === "pending" ? "Check Status" : "Verify Company",
      onAction: onVerifyCompany,
    },
    {
      id: "risk",
      title: "Risk Scoring",
      description: "Automated risk score calculated upon completion of identity and company verification. Includes AML, PEP, and sanctions checks.",
      icon: <BarChart3 size={20} />,
      status: profile.risk_calculated ? "complete" : (kycDone && companyDone) ? "not_started" : "locked",
      isLocked: !(kycDone && companyDone),
      actionLabel: profile.risk_calculated ? "View Score" : "Awaiting Verification",
      onAction: profile.risk_calculated ? onViewRiskScore : () => {},
    },
    {
      id: "passport",
      title: "Compliance Passport",
      description: "Generate and download your digital compliance passport once all verification steps are complete. Valid for 4 years.",
      icon: <FileCheck size={20} />,
      status: profile.passport_status === "generated" ? "generated" : passportUnlocked ? "not_generated" : "locked",
      isLocked: !passportUnlocked,
      actionLabel: profile.passport_status === "generated" ? "View Passport" : passportUnlocked ? "Generate Passport" : "Locked",
      onAction: profile.passport_status !== "locked" ? onGeneratePassport : () => {},
    },
  ];

  const completedCount = steps.filter((s) =>
    ["verified", "complete", "generated"].includes(s.status)
  ).length;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-base">Compliance Journey</h3>
          <p className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
            {completedCount}/4 steps complete — {completedCount < 4 ? "Complete all steps to generate your passport" : "All steps complete!"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {steps.map((s) => (
            <div
              key={s.id}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: ["verified","complete","generated"].includes(s.status) ? "24px" : "12px",
                backgroundColor: ["verified","complete","generated"].includes(s.status)
                  ? BRAND.green
                  : s.status === "locked" ? "rgba(255,255,255,0.1)"
                  : BRAND.gold,
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, index) => {
          const isDone   = ["verified", "complete", "generated"].includes(step.status);
          const isActive = !step.isLocked && !isDone;
          const isLocked = step.isLocked;

          return (
            <div
              key={step.id}
              className="rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-300 relative overflow-hidden"
              style={{
                backgroundColor: isDone   ? `${BRAND.green}06`
                  : isActive ? `${BRAND.gold}05`
                  : "rgba(255,255,255,0.02)",
                borderColor: isDone   ? `${BRAND.green}25`
                  : isActive ? `${BRAND.gold}25`
                  : "rgba(255,255,255,0.07)",
                opacity: isLocked ? 0.55 : 1,
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                  style={{ backgroundColor: BRAND.gold }}
                />
              )}
              {isDone && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                  style={{ backgroundColor: BRAND.green }}
                />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: isDone   ? `${BRAND.green}18`
                        : isActive ? `${BRAND.gold}18`
                        : "rgba(255,255,255,0.06)",
                      color: isDone   ? BRAND.green
                        : isActive ? BRAND.gold
                        : BRAND.muted,
                    }}
                  >
                    {isDone ? <CheckCircle2 size={20} /> : isLocked ? <Lock size={18} /> : step.icon}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{step.title}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: BRAND.muted }}>
                      Step {index + 1} of 4
                    </div>
                  </div>
                </div>
                <StepStatusBadge status={step.status} />
              </div>

              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                {step.description}
              </p>

              {!isLocked && (
                <button
                  type="button"
                  onClick={step.onAction}
                  disabled={step.id === "risk" && !profile.risk_calculated && !(kycDone && companyDone)}
                  className="flex items-center justify-between w-full px-4 h-10 rounded-xl text-sm font-semibold border transition-all duration-200 group"
                  style={{
                    backgroundColor: isDone   ? `${BRAND.green}10`
                      : isActive ? `${BRAND.gold}12`
                      : "rgba(255,255,255,0.05)",
                    borderColor: isDone   ? `${BRAND.green}25`
                      : isActive ? `${BRAND.gold}25`
                      : "rgba(255,255,255,0.1)",
                    color: isDone   ? BRAND.green
                      : isActive ? BRAND.gold
                      : BRAND.muted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDone ? `${BRAND.green}18` : isActive ? `${BRAND.gold}20` : "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDone ? `${BRAND.green}10` : isActive ? `${BRAND.gold}12` : "rgba(255,255,255,0.05)";
                  }}
                >
                  <span>{step.actionLabel}</span>
                  <ChevronRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              )}

              {isLocked && (
                <div
                  className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm border"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.06)",
                    color: BRAND.muted,
                  }}
                >
                  <Lock size={13} />
                  <span>Complete previous steps to unlock</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
