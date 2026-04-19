"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2, XCircle, Clock, ChevronRight, Upload, Link2,
  Search, Wrench, X, User, Building2, Calculator, Landmark,
  ShieldAlert, FileText, Activity, Loader2,
} from "lucide-react";
import { SectionScore, EvidenceCheck } from "@/types/compliance";
import { getSectionHex } from "@/lib/compliance/calculate-score";
import { SystemSheet } from "@/components/shared/system-sheet";
import {
  ComplianceSectionBreakdown, useGetKycStatusQuery, useGetKybStatusQuery,
  FinancialRecordStatus, OperatingHistoryResponse,
} from "@/lib/api/complianceCentreApi";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

const ACTION_ICONS: Record<string, React.ReactNode> = {
  upload:  <Upload size={12} />,
  connect: <Link2 size={12} />,
  review:  <Search size={12} />,
  fix:     <Wrench size={12} />,
};

const SECTION_ICONS: Record<string, React.ReactNode> = {
  identity:     <User size={18} />,
  registration: <Building2 size={18} />,
  tax:          <Calculator size={18} />,
  financial:    <Landmark size={18} />,
  risk:         <ShieldAlert size={18} />,
  documents:    <FileText size={18} />,
  behaviour:    <Activity size={18} />,
};

const SECTION_TITLES: Record<string, string> = {
  identity:     "Identity & Verification",
  registration: "Registration & Legal Status",
  tax:          "Tax Setup",
  financial:    "Financial Records",
  risk:         "AML / Risk",
  documents:    "Documents",
  behaviour:    "Operating History",
};

// Maps API icon → action type for the CTA button icon
const ICON_TO_ACTION_TYPE: Record<string, string> = {
  kyc:     "review",
  kyb:     "fix",
  tax:     "connect",
  bank:    "connect",
  aml:     "review",
  docs:    "upload",
  history: "fix",
};

function statusBadge(status: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    "Verified":    { label: "Verified",     color: "#06D6A0", bg: "rgba(6,214,160,0.12)"   },
    "Active":      { label: "Active",       color: "#06D6A0", bg: "rgba(6,214,160,0.12)"   },
    "UnderReview": { label: "Under Review", color: "#D4AF37", bg: "rgba(212,175,55,0.12)"  },
    "InProgress":  { label: "In Progress",  color: "#3E92CC", bg: "rgba(62,146,204,0.12)"  },
    "Not Started": { label: "Not Started",  color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
  };
  const s = map[status] ?? map["Not Started"];
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  );
}

const SOURCE_TYPE_LABEL: Record<string, string> = {
  api:            "External API",
  user_input:     "User submitted",
  internal_logic: "Platform logic",
};

const SOURCE_TYPE_COLOR: Record<string, string> = {
  api:            BRAND.accent,
  user_input:     BRAND.gold,
  internal_logic: BRAND.muted,
};

function CheckRow({ check, sectionKey, onAction }: { check: EvidenceCheck; sectionKey?: string; onAction?: (fixType: string) => void }) {
  const statusIcon =
    check.status === "pass"    ? <CheckCircle2 size={14} style={{ color: BRAND.green }} /> :
    check.status === "fail"    ? <XCircle size={14} style={{ color: "#ef4444" }} /> :
    check.status === "review"  ? <Clock size={14} style={{ color: BRAND.gold }} /> :
                                  <Clock size={14} style={{ color: BRAND.muted }} />;

  // Map check labels to specific actions for each section
  const getActionForCheck = () => {
    if (!onAction) return null;

    // Identity & Verification
    if (sectionKey === "identity") {
      if (check.label.includes("Owner KYC")) return { label: "Start KYC", type: "kyc" };
      if (check.label.includes("Business KYB")) return { label: "Start KYB", type: "kyb" };
      if (check.label.includes("Beneficial owner")) return { label: "Add Director", type: "director" };
    }

    // Registration & Legal Status
    if (sectionKey === "registration") {
      if (check.label.includes("Registration number")) return { label: "Add Number", type: "registration_number" };
      if (check.label.includes("Legal name")) return { label: "Fix Name", type: "name_match" };
      if (check.label.includes("Entity status")) return { label: "Verify Status", type: "entity_status" };
      if (check.label.includes("Core profile")) return { label: "Complete Profile", type: "onboarding" };
    }

    // Tax Setup
    if (sectionKey === "tax") {
      if (check.label.includes("Tax ID")) return { label: "Add Tax ID", type: "tax_id" };
      if (check.label.includes("VAT")) return { label: "Declare VAT", type: "vat_setup" };
      if (check.label.includes("Filing calendar")) return { label: "Connect HMRC / FIRS", type: "hmrc_connect" };
      if (check.label.includes("Obligations")) return { label: "Sync HMRC / FIRS", type: "hmrc_sync" };
    }

    // Financial Records
    if (sectionKey === "financial") {
      if (check.label.includes("Bank connected")) return { label: "Connect Bank", type: "bank_connect" };
      if (check.label.includes("Transactions")) return { label: "Import Data", type: "import_transactions" };
      if (check.label.includes("Categorisation")) return { label: "Categorise", type: "categorise" };
      if (check.label.includes("Reconciliation")) return { label: "Reconcile", type: "reconcile" };
      if (check.label.includes("Receipt")) return { label: "Upload Receipts", type: "receipts" };
    }

    // AML / Risk
    if (sectionKey === "risk") {
      if (check.label.includes("Sanctions")) return { label: "View Report", type: "alerts_review" };
    }

    // Documents
    if (sectionKey === "documents") {
      if (check.label.includes("Required documents")) return { label: "Upload Docs", type: "documents_upload" };
      if (check.label.includes("No expired")) return { label: "Verify Expiry", type: "documents_check" };
    }

    // Operating History
    if (sectionKey === "behaviour") {
      if (check.label.includes("Active monthly")) return { label: "View Activity", type: "activity_check" };
      if (check.label.includes("Timely record")) return { label: "Update Records", type: "record_updates" };
      if (check.label.includes("No long-unresolved")) return { label: "Resolve Alerts", type: "alerts" };
    }

    return null;
  };

  const action = getActionForCheck();

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 border-b last:border-0"
      style={{ borderColor: "rgba(255,255,255,0.05)" }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{check.label}</div>
        {check.detail && (
          <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            {check.detail}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
            style={{
              color: SOURCE_TYPE_COLOR[check.source_type],
              backgroundColor: `${SOURCE_TYPE_COLOR[check.source_type]}12`,
              borderColor: `${SOURCE_TYPE_COLOR[check.source_type]}25`,
            }}
          >
            {SOURCE_TYPE_LABEL[check.source_type]}
          </span>
          <span className="text-[10px]" style={{ color: BRAND.muted }}>{check.source}</span>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            {new Date(check.checked_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-2">
        {check.status === "pass" ? (
          <span
            className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border"
            style={{ color: BRAND.green, backgroundColor: `${BRAND.green}12`, borderColor: `${BRAND.green}30` }}
          >
            Passed
          </span>
        ) : (
          action && onAction && (
            <button
              type="button"
              onClick={() => onAction(action.type)}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all duration-200"
              style={{
                backgroundColor: `${BRAND.accent}12`,
                borderColor: `${BRAND.accent}30`,
                color: BRAND.accent,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}25`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}12`; }}
            >
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

interface SectionCardProps {
  sectionKey: string;
  section: SectionScore;
  onAction: (fixType?: string) => void;
  apiSection?: ComplianceSectionBreakdown;
  externalOpen?: boolean;
  onExternalClose?: () => void;
  financialStatus?: FinancialRecordStatus;
  historyData?: OperatingHistoryResponse;
}

export function SectionCard({ sectionKey, section, onAction, apiSection, externalOpen, onExternalClose, financialStatus, historyData }: SectionCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showIdentityDetails, setShowIdentityDetails] = useState(false);
  
  // Fetch identity data when drawer opens for identity section
  const { data: kycData, isLoading: kycLoading } = useGetKycStatusQuery(undefined, {
    skip: sectionKey !== "identity" || !(drawerOpen || externalOpen),
  });
  const { data: kybData, isLoading: kybLoading } = useGetKybStatusQuery(undefined, {
    skip: sectionKey !== "identity" || !(drawerOpen || externalOpen),
  });

  // Update drawerOpen when externalOpen changes
  useEffect(() => {
    if (externalOpen) {
      setDrawerOpen(true);
    }
  }, [externalOpen]);

  useEffect(() => {
    if (sectionKey === "identity" && (drawerOpen || externalOpen) && (kycData || kybData)) {
      setShowIdentityDetails(true);
    }
  }, [sectionKey, drawerOpen, externalOpen, kycData, kybData]);

  // Prefer live API values; fall back to static structure for checks/labels
  const earned      = apiSection !== undefined ? (apiSection.score ?? 0) : section.earned;
  const max         = apiSection !== undefined ? apiSection.maxScore      : section.max;
  const actionLabel = apiSection?.actionLabel ?? section.action_label;
  const actionType  = apiSection ? (ICON_TO_ACTION_TYPE[apiSection.icon] ?? section.action_type) : section.action_type;

  const accentColor = getSectionHex(earned, max);
  const pct = max > 0 ? Math.round((earned / max) * 100) : 0;
  const icon = SECTION_ICONS[sectionKey];
  const title = SECTION_TITLES[sectionKey];

  return (
    <>
      <div
        className="rounded-2xl border flex flex-col overflow-hidden transition-all duration-200 cursor-pointer group"
        style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        onClick={() => setDrawerOpen(true)}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accentColor}35`; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">{title}</div>
            {apiSection && (
              <div className="mt-0.5">{statusBadge(apiSection.status)}</div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-base font-extrabold" style={{ color: accentColor }}>{earned}</span>
            <span className="text-xs" style={{ color: BRAND.muted }}>/ {max}</span>
            <ChevronRight size={14} style={{ color: BRAND.muted }} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-3">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: accentColor }}
            />
          </div>
        </div>

        {/* Passed */}
        {section.passed.length > 0 && (
          <div className="px-5 pb-2 flex flex-col gap-1">
            {section.passed.slice(0, 2).map((item) => (
              <div key={item} className="flex items-start gap-1.5">
                <CheckCircle2 size={11} className="flex-shrink-0 mt-0.5" style={{ color: BRAND.green }} />
                <span className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Missing */}
        {section.missing.length > 0 && sectionKey !== "registration" && sectionKey !== "tax" && sectionKey !== "documents" && (
          <div className="px-5 pb-3 flex flex-col gap-1">
            {section.missing.slice(0, 2).map((item) => (
              <div key={item} className="flex items-start gap-1.5">
                <XCircle size={11} className="flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                <span className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {(section.missing.length > 0 || apiSection) && (
          <div className="mx-5 mb-5 mt-auto">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setDrawerOpen(true); }}
              className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${accentColor}25`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${accentColor}15`; }}
            >
              {ACTION_ICONS[actionType]}
              {actionLabel}
            </button>
            {section.evalMessage && (
              <p className="text-[11px] mt-1.5 text-center leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                {section.evalMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Evidence / Source drawer */}
      <SystemSheet
        open={drawerOpen || !!externalOpen}
        onClose={() => { setDrawerOpen(false); onExternalClose?.(); }}
        title={title}
        description={`${earned} / ${max} points · ${pct}% complete`}
        width={520}
      >
        <div className="flex flex-col gap-5">

          {/* Identity Details for Identity & Verification section */}
          {sectionKey === "identity" && showIdentityDetails && (kycData || kybData) ? (
            <div className="flex flex-col gap-3">
              {/* KYC Status Card */}
              {kycData && (
                <div
                  className="rounded-xl border p-4 flex flex-col gap-3"
                  style={{ backgroundColor: "rgba(62,146,204,0.06)", borderColor: "rgba(62,146,204,0.15)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.accent }}>
                      Identity (KYC)
                    </div>
                    {kycData.status && statusBadge(kycData.status)}
                  </div>



                  {/* Government ID Section */}
                  {(kycData.idType || kycData.idNumber || kycData.idExpiryDate || kycData.residentialAddress) && (
                    <div className="flex flex-col gap-2 pt-3 border-t" style={{ borderColor: "rgba(62,146,204,0.2)" }}>
                      <span className="text-xs font-semibold" style={{ color: BRAND.accent }}>Government ID</span>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {kycData.idType && (
                          <div className="flex justify-between">
                            <span style={{ color: "rgba(255,255,255,0.5)" }}>ID Type:</span>
                            <span className="text-white font-medium">{kycData.idType}</span>
                          </div>
                        )}
                        {kycData.idNumber && (
                          <div className="flex justify-between">
                            <span style={{ color: "rgba(255,255,255,0.5)" }}>ID Number:</span>
                            <span className="text-white font-medium">{kycData.idNumber}</span>
                          </div>
                        )}
                        {kycData.idExpiryDate && (
                          <div className="flex justify-between">
                            <span style={{ color: "rgba(255,255,255,0.5)" }}>ID Expiry:</span>
                            <span className="text-white font-medium">{kycData.idExpiryDate}</span>
                          </div>
                        )}
                        {kycData.residentialAddress && (
                          <div className="flex justify-between">
                            <span style={{ color: "rgba(255,255,255,0.5)" }}>Address:</span>
                            <span className="text-white font-medium">{kycData.residentialAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* KYB Status Card */}
              {kybData && (
                <div
                  className="rounded-xl border p-4 flex flex-col gap-3"
                  style={{ backgroundColor: "rgba(6,214,160,0.06)", borderColor: "rgba(6,214,160,0.15)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.green }}>
                      Business (KYB)
                    </div>
                    {kybData.status && statusBadge(kybData.status)}
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {kybData.jurisdiction && (
                      <div className="flex justify-between">
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>Jurisdiction:</span>
                        <span className="text-white font-medium">{kybData.jurisdiction}</span>
                      </div>
                    )}
                    {kybData.companiesHouseNumber && (
                      <div className="flex justify-between">
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>Registration Number:</span>
                        <span className="text-white font-medium">{kybData.companiesHouseNumber}</span>
                      </div>
                    )}
                    {kybData.submittedLegalName && (
                      <div className="flex justify-between">
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>Legal Name:</span>
                        <span className="text-white font-medium">{kybData.submittedLegalName}</span>
                      </div>
                    )}
                    {kybData.officialLegalName && (
                      <div className="flex justify-between">
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>Official Name:</span>
                        <span className="text-white font-medium">{kybData.officialLegalName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(kycLoading || kybLoading) && (
                <div className="flex items-center justify-center gap-2 py-4" style={{ color: BRAND.accent }}>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Fetching verification details…</span>
                </div>
              )}
            </div>
          ) : (
            <>
          {/* Passed / Missing summary */}
          {(section.passed.length > 0 || section.missing.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {section.passed.length > 0 && (
                <div
                  className="rounded-xl border p-3 flex flex-col gap-2"
                  style={{ backgroundColor: `${BRAND.green}06`, borderColor: `${BRAND.green}20` }}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: BRAND.green }}>Passed</div>
                  {section.passed.map((p) => (
                    <div key={p} className="flex items-start gap-1.5">
                      <CheckCircle2 size={11} className="flex-shrink-0 mt-0.5" style={{ color: BRAND.green }} />
                      <span className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{p}</span>
                    </div>
                  ))}
                </div>
              )}
              {section.missing.length > 0 && sectionKey !== "registration" && sectionKey !== "tax" && sectionKey !== "documents" && (
                <div
                  className="rounded-xl border p-3 flex flex-col gap-2"
                  style={{ backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.20)" }}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#ef4444" }}>Missing</div>
                  {section.missing.map((m) => (
                    <div key={m} className="flex items-start gap-1.5">
                      <XCircle size={11} className="flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                      <span className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{m}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Financial: live connection status panel */}
          {sectionKey === "financial" && financialStatus && (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>Connection Status</div>
              {[
                {
                  label: financialStatus.bankProvider ?? "Bank Account",
                  connected: financialStatus.isBankConnected,
                  connectedAt: financialStatus.bankConnectedAt,
                  syncActive: financialStatus.bankSyncActive,
                },
                {
                  label: financialStatus.taxProvider ?? "Tax / VAT",
                  connected: financialStatus.isTaxConnected,
                  connectedAt: financialStatus.taxConnectedAt,
                  syncActive: financialStatus.taxSyncActive,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border p-3 flex items-center justify-between gap-3"
                  style={{
                    backgroundColor: item.connected ? `${BRAND.green}06` : "rgba(255,255,255,0.03)",
                    borderColor: item.connected ? `${BRAND.green}20` : "rgba(255,255,255,0.08)",
                  }}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{item.label}</div>
                    {item.connected && item.connectedAt && (
                      <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Connected {new Date(item.connectedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        {item.syncActive ? " · Sync active" : " · Sync inactive"}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: item.connected ? `${BRAND.green}15` : "rgba(107,114,128,0.15)",
                      color: item.connected ? BRAND.green : BRAND.muted,
                    }}
                  >
                    {item.connected ? "Connected" : "Not Connected"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Behaviour: operating history timeline */}
          {sectionKey === "behaviour" && (historyData?.history?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>Operating History</div>
              <div className="flex flex-col gap-2">
                {(historyData?.history ?? []).slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border p-3 flex items-start gap-3"
                    style={{
                      backgroundColor: item.isPenalty ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.03)",
                      borderColor: item.isPenalty ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.07)",
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: item.isPenalty ? "rgba(239,68,68,0.15)" : `${BRAND.green}15` }}
                    >
                      {item.isPenalty
                        ? <XCircle size={12} style={{ color: "#ef4444" }} />
                        : <CheckCircle2 size={12} style={{ color: BRAND.green }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      {item.description && (
                        <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{item.description}</div>
                      )}
                      <div className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {new Date(item.occurredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}

          {/* Evidence checks - always show for all sections */}
          {section.checks && section.checks.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>
                Evidence &amp; Source
              </div>
              <div
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                {section.checks
                  .filter((check) => {
                    // Hide specific checks for registration section
                    if (sectionKey === "registration") {
                      if (check.label.includes("Registration number provided")) return false;
                      if (check.label.includes("Entity status active")) return false;
                    }
                    // Hide specific checks for tax section
                    if (sectionKey === "tax") {
                      if (check.label.includes("Tax ID provided")) return false;
                      if (check.label.includes("VAT / payroll setup declared")) return false;
                      if (check.label.includes("Filing calendar not configured")) return false;
                      if (check.label.includes("HMRC obligations not synced")) return false;
                    }
                    // Hide specific checks for documents section
                    if (sectionKey === "documents") {
                      if (check.label.includes("No expired core document")) return false;
                    }
                    return true;
                  })
                  .map((check) => (
                    <CheckRow
                      key={check.label}
                      check={check}
                      sectionKey={sectionKey}
                      onAction={(fixType) => { onAction(fixType); }}
                    />
                  ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer CTA */}
        {(section.missing.length > 0 || apiSection) && (
          <div className="mt-6 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <button
              type="button"
              onClick={() => { onAction(); }}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ backgroundColor: accentColor, color: BRAND.primary }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {ACTION_ICONS[actionType]}
              {actionLabel}
            </button>
          </div>
        )}
      </SystemSheet>
    </>
  );
}
