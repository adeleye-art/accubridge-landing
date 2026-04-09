"use client";

import React, { useState, useMemo } from "react";
import {
  Search, AlertTriangle, CheckCircle, Clock, FileX, Banknote,
  Database, ChevronRight, Shield, Building2, FileText, Landmark,
  TriangleAlert, UserCheck, X, NotepadText, History, Gavel,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";

const BRAND = {
  gold: "#D4AF37",
  accent: "#3E92CC",
  muted: "#6B7280",
  primary: "#0A2463",
  green: "#06D6A0",
  red: "#ef4444",
  amber: "#f59e0b",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Urgency = "critical" | "high" | "medium" | "low";
type ReviewReason = "high_risk" | "pending_review" | "doc_mismatch" | "overdue_tax" | "funding_review" | "stale_data";
type DecisionStatus = "open" | "approved" | "action_required" | "escalated" | "rejected";
type CheckStatus = "passed" | "failed" | "pending" | "not_synced";

interface AuditEntry {
  id: string;
  reviewer: string;
  action: string;
  old_score?: number;
  new_score?: number;
  reason: string;
  timestamp: string;
}

interface ReviewRecord {
  id: string;
  business: string;
  owner: string;
  country: string;
  score: number;
  identity_score: number;
  registration_score: number;
  tax_score: number;
  financial_score: number;
  risk_score: number;
  document_score: number;
  behaviour_score: number;
  review_reasons: ReviewReason[];
  urgency: Urgency;
  assigned_reviewer: string;
  assigned_accountant: string;
  opened_date: string;
  last_updated: string;
  decision_status: DecisionStatus;
  kyc_status: CheckStatus;
  kyb_status: CheckStatus;
  registry_match: "matched" | "mismatch" | "pending";
  tax_sync: "synced" | "overdue" | "not_synced";
  bank_sync: "connected" | "disconnected" | "pending";
  aml_flags: string[];
  docs_uploaded: number;
  docs_required: number;
  notes: string;
  audit_trail: AuditEntry[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_RECORDS: ReviewRecord[] = [
  {
    id: "1", business: "Apex Solutions Ltd", owner: "Jane Okonkwo", country: "UK",
    score: 22, identity_score: 5, registration_score: 8, tax_score: 3, financial_score: 4, risk_score: 0, document_score: 2, behaviour_score: 0,
    review_reasons: ["high_risk", "doc_mismatch"], urgency: "critical",
    assigned_reviewer: "Mark Chen", assigned_accountant: "Priya Sharma",
    opened_date: "2 Apr 2026", last_updated: "3 Apr 2026", decision_status: "open",
    kyc_status: "failed", kyb_status: "failed", registry_match: "mismatch",
    tax_sync: "overdue", bank_sync: "disconnected",
    aml_flags: ["Sanctions match detected", "Unresolved PEP flag"],
    docs_uploaded: 1, docs_required: 5, notes: "",
    audit_trail: [
      { id: "a1", reviewer: "System", action: "Case opened automatically", reason: "KYC/KYB failed + sanctions match", timestamp: "2 Apr 2026 09:14" },
    ],
  },
  {
    id: "2", business: "TechBridge NG Ltd", owner: "Ade Adeyemi", country: "Nigeria",
    score: 45, identity_score: 15, registration_score: 10, tax_score: 7, financial_score: 8, risk_score: 3, document_score: 2, behaviour_score: 0,
    review_reasons: ["pending_review", "overdue_tax"], urgency: "high",
    assigned_reviewer: "Priya Sharma", assigned_accountant: "Mark Chen",
    opened_date: "28 Mar 2026", last_updated: "1 Apr 2026", decision_status: "action_required",
    kyc_status: "passed", kyb_status: "pending", registry_match: "matched",
    tax_sync: "overdue", bank_sync: "connected",
    aml_flags: ["Repeated monitoring alerts (×3)"],
    docs_uploaded: 3, docs_required: 5, notes: "Client has been notified to submit VAT filing.",
    audit_trail: [
      { id: "b1", reviewer: "System", action: "Case opened automatically", reason: "Tax obligations overdue", timestamp: "28 Mar 2026 11:00" },
      { id: "b2", reviewer: "Priya Sharma", action: "Marked Action Required", old_score: 45, new_score: 45, reason: "Client must resolve overdue VAT obligations", timestamp: "1 Apr 2026 14:30" },
    ],
  },
  {
    id: "3", business: "Greenfield Ventures", owner: "Sarah Williams", country: "UK",
    score: 12, identity_score: 8, registration_score: 4, tax_score: 0, financial_score: 0, risk_score: 0, document_score: 0, behaviour_score: 0,
    review_reasons: ["doc_mismatch", "stale_data"], urgency: "high",
    assigned_reviewer: "Unassigned", assigned_accountant: "Mark Chen",
    opened_date: "5 Apr 2026", last_updated: "5 Apr 2026", decision_status: "open",
    kyc_status: "pending", kyb_status: "pending", registry_match: "mismatch",
    tax_sync: "not_synced", bank_sync: "disconnected",
    aml_flags: [],
    docs_uploaded: 0, docs_required: 5, notes: "",
    audit_trail: [
      { id: "c1", reviewer: "System", action: "Case opened automatically", reason: "Registry name mismatch + stale financial data", timestamp: "5 Apr 2026 08:00" },
    ],
  },
  {
    id: "4", business: "Nova Consulting UK", owner: "Daniel Obi", country: "UK",
    score: 78, identity_score: 20, registration_score: 14, tax_score: 12, financial_score: 16, risk_score: 10, document_score: 4, behaviour_score: 2,
    review_reasons: ["funding_review"], urgency: "medium",
    assigned_reviewer: "Mark Chen", assigned_accountant: "Priya Sharma",
    opened_date: "6 Apr 2026", last_updated: "6 Apr 2026", decision_status: "open",
    kyc_status: "passed", kyb_status: "passed", registry_match: "matched",
    tax_sync: "synced", bank_sync: "connected",
    aml_flags: [],
    docs_uploaded: 4, docs_required: 5, notes: "Funding application submitted. Pending final compliance sign-off.",
    audit_trail: [
      { id: "d1", reviewer: "System", action: "Case opened automatically", reason: "Client applied for funding", timestamp: "6 Apr 2026 10:22" },
    ],
  },
  {
    id: "5", business: "Bright Path Ltd", owner: "Chidi Eze", country: "Nigeria",
    score: 65, identity_score: 15, registration_score: 12, tax_score: 10, financial_score: 14, risk_score: 9, document_score: 4, behaviour_score: 1,
    review_reasons: ["pending_review"], urgency: "medium",
    assigned_reviewer: "Priya Sharma", assigned_accountant: "Priya Sharma",
    opened_date: "3 Apr 2026", last_updated: "4 Apr 2026", decision_status: "open",
    kyc_status: "passed", kyb_status: "passed", registry_match: "matched",
    tax_sync: "synced", bank_sync: "connected",
    aml_flags: [],
    docs_uploaded: 3, docs_required: 5, notes: "",
    audit_trail: [
      { id: "e1", reviewer: "System", action: "Case opened automatically", reason: "Periodic review triggered", timestamp: "3 Apr 2026 09:00" },
    ],
  },
  {
    id: "6", business: "Lagos First Capital", owner: "Emeka Nwosu", country: "Nigeria",
    score: 20, identity_score: 8, registration_score: 5, tax_score: 4, financial_score: 3, risk_score: 0, document_score: 0, behaviour_score: 0,
    review_reasons: ["high_risk", "overdue_tax"], urgency: "critical",
    assigned_reviewer: "Mark Chen", assigned_accountant: "Mark Chen",
    opened_date: "1 Apr 2026", last_updated: "4 Apr 2026", decision_status: "escalated",
    kyc_status: "passed", kyb_status: "failed", registry_match: "pending",
    tax_sync: "overdue", bank_sync: "pending",
    aml_flags: ["Serious adverse media"],
    docs_uploaded: 1, docs_required: 5, notes: "Escalated to admin — adverse media confirmed.",
    audit_trail: [
      { id: "f1", reviewer: "System", action: "Case opened automatically", reason: "High risk + overdue tax obligations", timestamp: "1 Apr 2026 07:30" },
      { id: "f2", reviewer: "Mark Chen", action: "Escalated to Admin", old_score: 20, new_score: 20, reason: "Adverse media confirmed — requires senior review", timestamp: "4 Apr 2026 16:00" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 85) return BRAND.green;
  if (score >= 70) return "#22c55e";
  if (score >= 50) return BRAND.gold;
  return BRAND.red;
}

function scoreBand(score: number) {
  if (score >= 85) return "Strong / Funding Ready";
  if (score >= 70) return "Good / Minor Gaps";
  if (score >= 50) return "Needs Attention";
  return "High Risk / Incomplete";
}

function urgencyStyle(u: Urgency) {
  switch (u) {
    case "critical": return { color: BRAND.red,   bg: "rgba(239,68,68,0.12)",   label: "Critical" };
    case "high":     return { color: BRAND.amber,  bg: "rgba(245,158,11,0.12)",  label: "High" };
    case "medium":   return { color: BRAND.gold,   bg: "rgba(212,175,55,0.12)",  label: "Medium" };
    case "low":      return { color: BRAND.green,  bg: "rgba(6,214,160,0.12)",   label: "Low" };
  }
}

function decisionStyle(d: DecisionStatus) {
  switch (d) {
    case "approved":         return { color: BRAND.green, bg: "rgba(6,214,160,0.1)",   label: "Approved" };
    case "action_required":  return { color: BRAND.amber, bg: "rgba(245,158,11,0.1)",  label: "Action Required" };
    case "escalated":        return { color: BRAND.red,   bg: "rgba(239,68,68,0.1)",   label: "Escalated" };
    case "rejected":         return { color: "#9ca3af",   bg: "rgba(156,163,175,0.1)", label: "Rejected" };
    case "open":             return { color: BRAND.accent, bg: "rgba(62,146,204,0.1)", label: "Open" };
  }
}

function checkStyle(s: CheckStatus | "matched" | "mismatch" | "synced" | "overdue" | "not_synced" | "connected" | "disconnected") {
  switch (s) {
    case "passed":
    case "matched":
    case "synced":
    case "connected":  return { color: BRAND.green, bg: "rgba(6,214,160,0.1)",   label: s.charAt(0).toUpperCase() + s.slice(1) };
    case "failed":
    case "mismatch":
    case "overdue":
    case "disconnected": return { color: BRAND.red, bg: "rgba(239,68,68,0.1)",   label: s.charAt(0).toUpperCase() + s.slice(1) };
    default:           return { color: BRAND.muted, bg: "rgba(107,114,128,0.1)", label: s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ") };
  }
}

const REASON_LABELS: Record<ReviewReason, { label: string; icon: React.ReactNode }> = {
  high_risk:      { label: "High Risk",        icon: <TriangleAlert size={11} /> },
  pending_review: { label: "Pending Review",   icon: <Clock size={11} /> },
  doc_mismatch:   { label: "Doc Mismatch",     icon: <FileX size={11} /> },
  overdue_tax:    { label: "Overdue Tax",      icon: <Gavel size={11} /> },
  funding_review: { label: "Funding Review",   icon: <Banknote size={11} /> },
  stale_data:     { label: "Stale Data",       icon: <Database size={11} /> },
};

const FILTER_TABS: Array<{ key: ReviewReason | "all"; label: string }> = [
  { key: "all",          label: "All" },
  { key: "high_risk",    label: "High Risk" },
  { key: "pending_review", label: "Pending Review" },
  { key: "doc_mismatch", label: "Doc Mismatch" },
  { key: "overdue_tax",  label: "Overdue Tax" },
  { key: "funding_review", label: "Funding Review" },
  { key: "stale_data",   label: "Stale Data" },
];

// ─── Section Score Bar ────────────────────────────────────────────────────────
function SectionScoreRow({ label, earned, max }: { label: string; earned: number; max: number }) {
  const pct = max > 0 ? (earned / max) * 100 : 0;
  const color = pct >= 70 ? BRAND.green : pct >= 40 ? BRAND.gold : BRAND.red;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{earned}/{max}</span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: 5, backgroundColor: "rgba(255,255,255,0.08)" }}>
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: 99, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ─── Check Badge ─────────────────────────────────────────────────────────────
function CheckBadge({ value }: { value: string }) {
  const s = checkStyle(value as CheckStatus);
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>{s.label}</span>
  );
}

// ─── Case Sheet ───────────────────────────────────────────────────────────────
type CaseTab = "summary" | "evidence" | "actions" | "audit";

function CaseSheet({
  open, record, onClose, onDecision,
}: {
  open: boolean;
  record: ReviewRecord | null;
  onClose: () => void;
  onDecision: (id: string, decision: DecisionStatus, note: string, overrideScore?: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<CaseTab>("summary");
  const [note, setNote] = useState("");
  const [overrideScore, setOverrideScore] = useState<number | "">("");
  const [freezeConfirm, setFreezeConfirm] = useState(false);
  const { toast } = useToast();

  if (!record) return null;

  const tabs: Array<{ key: CaseTab; label: string; icon: React.ReactNode }> = [
    { key: "summary",  label: "Business",  icon: <Building2 size={13} /> },
    { key: "evidence", label: "Evidence",  icon: <Shield size={13} /> },
    { key: "actions",  label: "Review",    icon: <Gavel size={13} /> },
    { key: "audit",    label: "Audit",     icon: <History size={13} /> },
  ];

  const band = scoreBand(record.score);
  const sc = scoreColor(record.score);

  function handleDecision(decision: DecisionStatus) {
    if (!note.trim() && decision !== "approved") {
      toast({ title: "Add a note before submitting", variant: "warning" });
      return;
    }
    const score = typeof overrideScore === "number" ? overrideScore : undefined;
    onDecision(record!.id, decision, note, score);
    setNote("");
    setOverrideScore("");
  }

  return (
    <SystemSheet
      open={open}
      title={record.business}
      description={`Case opened ${record.opened_date} · ${record.country}`}
      onClose={onClose}
      width={720}
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: activeTab === t.key ? BRAND.gold : "transparent",
              color: activeTab === t.key ? BRAND.primary : "rgba(255,255,255,0.5)",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Panel 1 — Business Summary */}
      {activeTab === "summary" && (
        <div className="flex flex-col gap-5">
          {/* Score ring-ish card */}
          <div className="rounded-2xl p-5 border flex items-center gap-5" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border shrink-0" style={{ borderColor: `${sc}44`, backgroundColor: `${sc}0d` }}>
              <span className="text-2xl font-black" style={{ color: sc }}>{record.score}</span>
              <span className="text-xs" style={{ color: BRAND.muted }}>/100</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold" style={{ color: sc }}>{band}</span>
              <span className="text-xs" style={{ color: BRAND.muted }}>Last updated {record.last_updated}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full mt-1 w-fit" style={decisionStyle(record.decision_status)}>
                {decisionStyle(record.decision_status).label}
              </span>
            </div>
          </div>

          {/* Business info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Business Name",       value: record.business },
              { label: "Owner",               value: record.owner },
              { label: "Country",             value: record.country },
              { label: "Assigned Accountant", value: record.assigned_accountant },
              { label: "Assigned Reviewer",   value: record.assigned_reviewer },
              { label: "Opened",              value: record.opened_date },
            ].map((f) => (
              <div key={f.label} className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="text-xs mb-0.5" style={{ color: BRAND.muted }}>{f.label}</div>
                <div className="text-sm font-medium text-white">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Reasons */}
          <div>
            <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: BRAND.muted }}>Review Reasons</div>
            <div className="flex flex-wrap gap-2">
              {record.review_reasons.map((r) => {
                const u = urgencyStyle(record.urgency);
                const rinfo = REASON_LABELS[r];
                return (
                  <span key={r} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: u.color, backgroundColor: u.bg }}>
                    {rinfo.icon} {rinfo.label}
                  </span>
                );
              })}
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={urgencyStyle(record.urgency)}>
                <TriangleAlert size={11} /> {urgencyStyle(record.urgency).label} Urgency
              </span>
            </div>
          </div>

          {/* Section scores */}
          <div className="rounded-xl p-4 border flex flex-col gap-3" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: BRAND.muted }}>Score Breakdown</div>
            <SectionScoreRow label="Identity & Verification"    earned={record.identity_score}     max={20} />
            <SectionScoreRow label="Registration & Legal"       earned={record.registration_score} max={15} />
            <SectionScoreRow label="Tax Setup"                  earned={record.tax_score}          max={15} />
            <SectionScoreRow label="Financial Records"          earned={record.financial_score}    max={20} />
            <SectionScoreRow label="AML / Risk"                 earned={record.risk_score}         max={15} />
            <SectionScoreRow label="Document Completeness"      earned={record.document_score}     max={10} />
            <SectionScoreRow label="Operating History"          earned={record.behaviour_score}    max={5} />
          </div>
        </div>
      )}

      {/* Panel 2 — Evidence */}
      {activeTab === "evidence" && (
        <div className="flex flex-col gap-4">
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>Identity & Registry</div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "KYC (Owner Identity)",   value: record.kyc_status,    icon: <UserCheck size={14} /> },
              { label: "KYB (Business Verify)",  value: record.kyb_status,    icon: <Building2 size={14} /> },
              { label: "Registry Name Match",    value: record.registry_match, icon: <FileText size={14} /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl px-4 py-3 border" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ color: BRAND.muted }}>{item.icon}</span>
                  {item.label}
                </div>
                <CheckBadge value={item.value} />
              </div>
            ))}
          </div>

          <div className="text-xs font-semibold uppercase tracking-wide mt-2" style={{ color: BRAND.muted }}>Financial & Tax</div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Tax / VAT Sync",     value: record.tax_sync,  icon: <Gavel size={14} /> },
              { label: "Bank Connection",    value: record.bank_sync, icon: <Landmark size={14} /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl px-4 py-3 border" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ color: BRAND.muted }}>{item.icon}</span>
                  {item.label}
                </div>
                <CheckBadge value={item.value} />
              </div>
            ))}
          </div>

          <div className="text-xs font-semibold uppercase tracking-wide mt-2" style={{ color: BRAND.muted }}>Documents</div>
          <div className="rounded-xl px-4 py-3 border flex items-center justify-between" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              <FileText size={14} style={{ color: BRAND.muted }} /> Documents Uploaded
            </div>
            <span className="text-sm font-semibold" style={{ color: record.docs_uploaded >= record.docs_required ? BRAND.green : BRAND.amber }}>
              {record.docs_uploaded} / {record.docs_required}
            </span>
          </div>

          {record.aml_flags.length > 0 && (
            <>
              <div className="text-xs font-semibold uppercase tracking-wide mt-2" style={{ color: BRAND.muted }}>AML / Risk Flags</div>
              <div className="flex flex-col gap-2">
                {record.aml_flags.map((flag, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl px-4 py-3 border text-sm" style={{ backgroundColor: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.2)", color: BRAND.red }}>
                    <AlertTriangle size={13} /> {flag}
                  </div>
                ))}
              </div>
            </>
          )}

          {record.aml_flags.length === 0 && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 border text-sm" style={{ backgroundColor: "rgba(6,214,160,0.05)", borderColor: "rgba(6,214,160,0.2)", color: BRAND.green }}>
              <CheckCircle size={13} /> No AML / risk flags detected
            </div>
          )}
        </div>
      )}

      {/* Panel 3 — Review Actions */}
      {activeTab === "actions" && (
        <div className="flex flex-col gap-5">
          {/* Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.muted }}>
              <NotepadText size={11} className="inline mr-1" /> Reviewer Note (required for most decisions)
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your review note, reasoning, or instructions for the client…"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", lineHeight: "1.6" }}
            />
          </div>

          {/* Override score — admin only */}
          <PermissionGuard permission="override_compliance_score">
            <div className="rounded-xl p-4 border" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: BRAND.muted }}>Override Score (Admin Only)</div>
              <div className="flex items-center gap-3">
                <input
                  type="number" min={0} max={100}
                  placeholder={`Current: ${record.score}`}
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value === "" ? "" : Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-32 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
                <span className="text-xs" style={{ color: BRAND.muted }}>Enter a new score (0–100) to override</span>
              </div>
            </div>
          </PermissionGuard>

          {/* Decision buttons */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: BRAND.muted }}>Review Decision</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDecision("approved")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.3)", color: BRAND.green }}
              >
                <CheckCircle size={14} /> Approve
              </button>
              <button
                type="button"
                onClick={() => handleDecision("action_required")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: BRAND.amber }}
              >
                <Clock size={14} /> Action Required
              </button>
              <button
                type="button"
                onClick={() => handleDecision("escalated")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: BRAND.red }}
              >
                <TriangleAlert size={14} /> Escalate to Admin
              </button>
              <button
                type="button"
                onClick={() => handleDecision("rejected")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: "rgba(107,114,128,0.1)", border: "1px solid rgba(107,114,128,0.25)", color: "#9ca3af" }}
              >
                <X size={14} /> Reject / Failed
              </button>
            </div>
          </div>

          {/* Admin-only: freeze funding */}
          <PermissionGuard permission="freeze_funding_eligibility">
            <button
              type="button"
              onClick={() => setFreezeConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: BRAND.red }}
            >
              <Banknote size={14} /> Freeze Funding Eligibility
            </button>
          </PermissionGuard>
        </div>
      )}

      {/* Panel 4 — Audit Trail */}
      {activeTab === "audit" && (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>Audit Trail</div>
          {record.audit_trail.length === 0 && (
            <div className="text-sm text-center py-8" style={{ color: BRAND.muted }}>No audit entries yet.</div>
          )}
          {record.audit_trail.map((entry, i) => (
            <div key={entry.id} className="relative pl-6">
              {i < record.audit_trail.length - 1 && (
                <div className="absolute left-2 top-5 bottom-0 w-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
              )}
              <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border flex items-center justify-center" style={{ backgroundColor: "rgba(62,146,204,0.15)", borderColor: `${BRAND.accent}44` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BRAND.accent }} />
              </div>
              <div className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{entry.action}</span>
                  <span className="text-xs" style={{ color: BRAND.muted }}>{entry.timestamp}</span>
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                  By <span className="font-medium">{entry.reviewer}</span>
                </div>
                {entry.reason && (
                  <div className="text-xs mt-1 italic" style={{ color: BRAND.muted }}>{entry.reason}</div>
                )}
                {(entry.old_score !== undefined || entry.new_score !== undefined) && (
                  <div className="flex items-center gap-2 mt-2">
                    {entry.old_score !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: BRAND.muted }}>
                        {entry.old_score} →
                      </span>
                    )}
                    {entry.new_score !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${scoreColor(entry.new_score)}14`, color: scoreColor(entry.new_score) }}>
                        {entry.new_score}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Existing notes */}
          {record.notes && (
            <div className="rounded-xl p-4 border mt-2" style={{ backgroundColor: "rgba(62,146,204,0.06)", borderColor: "rgba(62,146,204,0.2)" }}>
              <div className="text-xs font-semibold mb-1" style={{ color: BRAND.accent }}>Latest Note</div>
              <div className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{record.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* Freeze confirm dialog */}
      <ConfirmDialog
        open={freezeConfirm}
        title="Freeze Funding Eligibility"
        description={`This will block ${record.business} from applying for or receiving funding until an admin lifts the freeze. This action is logged.`}
        confirmLabel="Freeze Funding"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => { setFreezeConfirm(false); toast({ title: "Funding eligibility frozen", variant: "warning" }); }}
        onCancel={() => setFreezeConfirm(false)}
      />
    </SystemSheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminCompliancePage() {
  const [records, setRecords] = useState<ReviewRecord[]>(MOCK_RECORDS);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ReviewReason | "all">("all");
  const [caseSheet, setCaseSheet] = useState<ReviewRecord | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() =>
    records.filter((r) => {
      const matchFilter = activeFilter === "all" || r.review_reasons.includes(activeFilter);
      const q = search.toLowerCase();
      const matchSearch = !q || r.business.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q) || r.assigned_reviewer.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    }),
    [records, search, activeFilter]
  );

  // Stats
  const critical   = records.filter((r) => r.urgency === "critical").length;
  const escalated  = records.filter((r) => r.decision_status === "escalated").length;
  const open       = records.filter((r) => r.decision_status === "open").length;
  const avgScore   = records.length ? Math.round(records.reduce((a, r) => a + r.score, 0) / records.length) : 0;

  function handleDecision(id: string, decision: DecisionStatus, note: string, overrideScore?: number) {
    const now = "9 Apr 2026";
    setRecords((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const newScore = typeof overrideScore === "number" ? overrideScore : r.score;
      const entry: AuditEntry = {
        id: `auto-${Date.now()}`,
        reviewer: "Current Reviewer",
        action: decision === "approved" ? "Approved" :
                decision === "action_required" ? "Marked Action Required" :
                decision === "escalated" ? "Escalated to Admin" : "Rejected / Failed Verification",
        old_score: r.score,
        new_score: newScore,
        reason: note,
        timestamp: now,
      };
      return {
        ...r,
        score: newScore,
        decision_status: decision,
        last_updated: now,
        notes: note,
        audit_trail: [...r.audit_trail, entry],
      };
    }));

    const labels: Record<DecisionStatus, string> = {
      approved: "Case approved", action_required: "Action required set", escalated: "Case escalated", rejected: "Case rejected", open: "Case reopened"
    };
    toast({ title: labels[decision], variant: decision === "approved" ? "success" : decision === "escalated" || decision === "rejected" ? "error" : "warning" });
    setCaseSheet(null);
  }

  const thStyle = "px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap";

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Review Queue</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>
            Manage review cases, inspect evidence, and issue decisions across all registered businesses.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Open Cases",     value: open,      color: BRAND.accent },
            { label: "Critical",       value: critical,  color: BRAND.red },
            { label: "Escalated",      value: escalated, color: BRAND.amber },
            { label: "Avg Score",      value: avgScore,  color: scoreColor(avgScore) },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: BRAND.muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border max-w-xs flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color: BRAND.muted }} />
            <input
              type="text" placeholder="Search business, owner, reviewer…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] w-48"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: activeFilter === tab.key ? BRAND.gold : "rgba(255,255,255,0.06)",
                  color: activeFilter === tab.key ? BRAND.primary : "rgba(255,255,255,0.6)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Business", "Score", "Reason(s)", "Urgency", "Reviewer", "Opened", "Decision", ""].map((h) => (
                    <th key={h} className={thStyle} style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const urg = urgencyStyle(r.urgency);
                  const dec = decisionStyle(r.decision_status);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      onClick={() => setCaseSheet(r)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-white">{r.business}</div>
                        <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>{r.owner} · {r.country}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-lg font-black" style={{ color: scoreColor(r.score) }}>{r.score}</span>
                        <span className="text-xs ml-1" style={{ color: BRAND.muted }}>/100</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {r.review_reasons.slice(0, 2).map((reason) => {
                            const rinfo = REASON_LABELS[reason];
                            return (
                              <span key={reason} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}>
                                {rinfo.icon} {rinfo.label}
                              </span>
                            );
                          })}
                          {r.review_reasons.length > 2 && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)", color: BRAND.muted }}>+{r.review_reasons.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: urg.color, backgroundColor: urg.bg }}>{urg.label}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm" style={{ color: r.assigned_reviewer === "Unassigned" ? BRAND.muted : "rgba(255,255,255,0.7)" }}>
                        {r.assigned_reviewer}
                      </td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: BRAND.muted }}>{r.opened_date}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: dec.color, backgroundColor: dec.bg }}>{dec.label}</span>
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setCaseSheet(r)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
                          style={{ borderColor: "rgba(255,255,255,0.15)", border: "1px solid", color: "rgba(255,255,255,0.6)" }}
                        >
                          Open Case <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: BRAND.muted }}>
                      No review cases match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <CaseSheet
        open={!!caseSheet}
        record={records.find((r) => r.id === caseSheet?.id) ?? null}
        onClose={() => setCaseSheet(null)}
        onDecision={handleDecision}
      />
    </div>
  );
}
