"use client";

import React, { useState } from "react";
import {
  ArrowLeft, AlertTriangle, FileText, Building2, User, MapPin,
  Calendar, ShieldCheck, CheckCircle2, XCircle, Clock, AlertCircle,
  FileSearch, ChevronRight, FileUp, Flag, Send,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type ReviewReason = "High risk" | "Pending review" | "Document mismatch" | "Overdue tax issues" | "Funding-related review" | "Stale financial data";
type Urgency = "High" | "Medium" | "Low";

interface CaseNote { author: string; date: string; text: string; }
interface ScoreEntry { date: string; score: number; note: string; }
interface CommEntry { date: string; type: string; summary: string; }

interface ComplianceCase {
  id: string;
  business: string;
  country: string;
  assignedAccountant: string;
  assignedReviewer: string;
  score: number;
  status: string;
  reason: ReviewReason;
  urgency: Urgency;
  openedDate: string;
  lastUpdated: string;
  // Evidence
  kycResult: string;
  registryResult: string;
  taxSyncResult: string;
  bankSyncStatus: string;
  uploadedDocs: string[];
  amlFlags: string[];
  // Audit trail
  notes: CaseNote[];
  scoreHistory: ScoreEntry[];
  clientComms: CommEntry[];
}

const INITIAL_CASES: ComplianceCase[] = [
  {
    id: "1",
    business: "Lagos First Capital",
    country: "Nigeria",
    assignedAccountant: "You",
    assignedReviewer: "You",
    score: 20,
    status: "Unverified",
    reason: "High risk",
    urgency: "High",
    openedDate: "1 Apr 2026",
    lastUpdated: "7 Apr 2026",
    kycResult: "Failed — ID document mismatch",
    registryResult: "Not found in CAC registry",
    taxSyncResult: "No tax records linked",
    bankSyncStatus: "Not connected",
    uploadedDocs: [],
    amlFlags: ["Politically Exposed Person (PEP) flag", "Unusual high-cash transaction patterns"],
    notes: [
      { author: "Staff Accountant", date: "2 Apr 2026", text: "Client has not responded to document requests. Escalation may be required." },
    ],
    scoreHistory: [{ date: "1 Apr 2026", score: 20, note: "Initial assessment — multiple verification failures" }],
    clientComms: [{ date: "1 Apr 2026", type: "Email", summary: "Onboarding welcome email sent" }],
  },
  {
    id: "2",
    business: "TechBridge NG Ltd",
    country: "Nigeria",
    assignedAccountant: "You",
    assignedReviewer: "You",
    score: 45,
    status: "In Progress",
    reason: "Overdue tax issues",
    urgency: "High",
    openedDate: "28 Mar 2026",
    lastUpdated: "5 Apr 2026",
    kycResult: "Passed",
    registryResult: "Verified via CAC",
    taxSyncResult: "Last return overdue — 2024/25 not filed",
    bankSyncStatus: "Connected — 2 accounts",
    uploadedDocs: ["Certificate of Incorporation", "ID Document"],
    amlFlags: [],
    notes: [],
    scoreHistory: [
      { date: "28 Mar 2026", score: 55, note: "Initial score" },
      { date: "5 Apr 2026",  score: 45, note: "Score reduced — overdue tax return detected" },
    ],
    clientComms: [
      { date: "29 Mar 2026", type: "Email",   summary: "Tax filing reminder sent" },
      { date: "3 Apr 2026",  type: "In-app",  summary: "Notification pushed: action required" },
    ],
  },
  {
    id: "3",
    business: "Bright Path Ltd",
    country: "United Kingdom",
    assignedAccountant: "You",
    assignedReviewer: "You",
    score: 65,
    status: "In Progress",
    reason: "Document mismatch",
    urgency: "Medium",
    openedDate: "25 Mar 2026",
    lastUpdated: "4 Apr 2026",
    kycResult: "Passed",
    registryResult: "Verified via Companies House",
    taxSyncResult: "Synced — up to date",
    bankSyncStatus: "Connected — 1 account",
    uploadedDocs: ["Certificate of Incorporation", "Bank Statement (3 months)"],
    amlFlags: [],
    notes: [
      { author: "Staff Accountant", date: "30 Mar 2026", text: "Company documents uploaded but incorporation date does not match registry record. Requested correction." },
    ],
    scoreHistory: [
      { date: "25 Mar 2026", score: 72, note: "Initial score" },
      { date: "4 Apr 2026",  score: 65, note: "Score reduced — document mismatch flagged" },
    ],
    clientComms: [
      { date: "26 Mar 2026", type: "Email",   summary: "Document upload request sent" },
      { date: "4 Apr 2026",  type: "In-app",  summary: "Mismatch flagged, client notified" },
    ],
  },
  {
    id: "4",
    business: "Nova Consulting UK",
    country: "United Kingdom",
    assignedAccountant: "You",
    assignedReviewer: "You",
    score: 78,
    status: "In Progress",
    reason: "Pending review",
    urgency: "Medium",
    openedDate: "2 Apr 2026",
    lastUpdated: "6 Apr 2026",
    kycResult: "Passed",
    registryResult: "Verified via Companies House",
    taxSyncResult: "Synced — up to date",
    bankSyncStatus: "Connected — 3 accounts",
    uploadedDocs: ["Certificate of Incorporation", "VAT Certificate", "Proof of Address"],
    amlFlags: [],
    notes: [],
    scoreHistory: [{ date: "2 Apr 2026", score: 78, note: "Initial assessment — awaiting final review" }],
    clientComms: [{ date: "3 Apr 2026", type: "Email", summary: "Verification confirmation email sent" }],
  },
  {
    id: "5",
    business: "Apex Solutions Ltd",
    country: "United Kingdom",
    assignedAccountant: "You",
    assignedReviewer: "You",
    score: 92,
    status: "Verified",
    reason: "Stale financial data",
    urgency: "Low",
    openedDate: "6 Apr 2026",
    lastUpdated: "7 Apr 2026",
    kycResult: "Passed",
    registryResult: "Verified via Companies House",
    taxSyncResult: "Last sync: 45 days ago — refresh required",
    bankSyncStatus: "Connected — last sync 45 days ago",
    uploadedDocs: ["Certificate of Incorporation", "Bank Statement (3 months)", "VAT Certificate", "Proof of Address", "ID Document"],
    amlFlags: [],
    notes: [],
    scoreHistory: [
      { date: "10 Jan 2026", score: 88, note: "Initial score" },
      { date: "1 Apr 2026",  score: 92, note: "Score improved after full document submission" },
    ],
    clientComms: [
      { date: "10 Jan 2026", type: "Email",   summary: "Onboarding welcome sent" },
      { date: "1 Apr 2026",  type: "In-app",  summary: "Verification complete notification sent" },
    ],
  },
];

const FILTERS: Array<{ key: string; label: string }> = [
  { key: "All",                    label: "All"                    },
  { key: "High risk",              label: "High Risk"              },
  { key: "Pending review",         label: "Pending Review"         },
  { key: "Document mismatch",      label: "Document Mismatch"      },
  { key: "Overdue tax issues",     label: "Overdue Tax Issues"     },
  { key: "Funding-related review", label: "Funding-Related Review" },
  { key: "Stale financial data",   label: "Stale Financial Data"   },
];

const DOC_OPTIONS = ["Certificate of Incorporation", "Bank Statement (3 months)", "VAT Certificate", "Proof of Address", "ID Document", "Other"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 70) return "#06D6A0";
  if (s >= 40) return "#D4AF37";
  return "#ef4444";
}

function urgencyStyle(u: Urgency) {
  if (u === "High")   return { color: "#ef4444", bg: "rgba(239,68,68,0.1)"   };
  if (u === "Medium") return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)"  };
  return                     { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"   };
}

function statusStyle(st: string) {
  if (st === "Verified")    return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"  };
  if (st === "In Progress") return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)" };
  return                           { color: "#ef4444", bg: "rgba(239,68,68,0.1)"  };
}

function evidenceStatus(value: string) {
  const lower = value.toLowerCase();
  if (lower.startsWith("passed") || lower.startsWith("verified") || lower.startsWith("synced") || lower.startsWith("connected"))
    return { icon: <CheckCircle2 size={14} />, color: "#06D6A0" };
  if (lower.startsWith("failed") || lower.startsWith("not found"))
    return { icon: <XCircle size={14} />,      color: "#ef4444" };
  return { icon: <Clock size={14} />, color: "#D4AF37" };
}

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = size / 2 - 7;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={scoreColor(score)} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`} strokeDashoffset={circ / 4} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="white">{score}</text>
    </svg>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2 mb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "12px" }}>
        <div style={{ color: BRAND.accent }}>{icon}</div>
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Sheets / Dialogs ─────────────────────────────────────────────────────────

function AddNoteSheet({ open, business, onClose, onAdd }: { open: boolean; business: string; onClose: () => void; onAdd: (note: CaseNote) => void }) {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd({ author: "You (Staff Accountant)", date: "7 Apr 2026", text: text.trim() });
    toast({ title: `Note added for ${business}`, variant: "success" });
    setText("");
    onClose();
  };

  return (
    <SystemSheet open={open} title="Add Reviewer Note" description={`Internal note for ${business}`} onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSubmit} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Add Note</button>
        </div>
      }
    >
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Note</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter your reviewer note..." rows={5}
          className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none placeholder-[#6B7280]"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }} />
      </div>
    </SystemSheet>
  );
}

function RequestDocSheet({ open, business, onClose }: { open: boolean; business: string; onClose: () => void }) {
  const [docType, setDocType] = useState(DOC_OPTIONS[0]);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({ title: `Document request sent to ${business}`, variant: "success" });
    setDocType(DOC_OPTIONS[0]);
    setMessage("");
    onClose();
  };

  return (
    <SystemSheet open={open} title="Request More Documents" description={`Send a document request to ${business}`} onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSubmit} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Send Request</button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Document Type</label>
          <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }}>
            {DOC_OPTIONS.map((d) => <option key={d} value={d} style={{ background: "#0A2463" }}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Message to client (optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Explain what is needed and why..." rows={4}
            className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none placeholder-[#6B7280]"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
    </SystemSheet>
  );
}

// ─── Queue View ───────────────────────────────────────────────────────────────

function QueueView({ cases, onOpenCase }: { cases: ComplianceCase[]; onOpenCase: (c: ComplianceCase) => void }) {
  const [filter, setFilter] = useState("All");

  const filtered = cases.filter((c) => filter === "All" || c.reason === filter);

  return (
    <div className="flex flex-col gap-6">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count  = f.key === "All" ? cases.length : cases.filter((c) => c.reason === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
              style={{
                borderColor:       active ? `${BRAND.accent}60`         : "rgba(255,255,255,0.1)",
                backgroundColor:   active ? `${BRAND.accent}15`         : "rgba(255,255,255,0.03)",
                color:             active ? BRAND.accent                 : "rgba(255,255,255,0.55)",
              }}
            >
              {f.label}
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold" style={{ backgroundColor: active ? `${BRAND.accent}25` : "rgba(255,255,255,0.08)", color: active ? BRAND.accent : BRAND.muted }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Queue table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Business", "Score", "Reason for Review", "Urgency", "Assigned Reviewer", "Opened", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const us = urgencyStyle(c.urgency);
                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-5 py-3.5 font-medium">{c.business}</td>
                    <td className="px-5 py-3.5 font-bold" style={{ color: scoreColor(c.score) }}>{c.score}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{c.reason}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: us.color, backgroundColor: us.bg }}>{c.urgency}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{c.assignedReviewer}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{c.openedDate}</td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => onOpenCase(c)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-white/10"
                        style={{ borderColor: `${BRAND.accent}40`, color: BRAND.accent }}
                      >
                        Open Case <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: BRAND.muted }}>
                    No cases match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Case View ────────────────────────────────────────────────────────────────

function CaseView({
  c,
  onBack,
  onUpdateCase,
}: {
  c: ComplianceCase;
  onBack: () => void;
  onUpdateCase: (updated: ComplianceCase) => void;
}) {
  const [noteSheet,           setNoteSheet]           = useState(false);
  const [docSheet,            setDocSheet]            = useState(false);
  const [escalateOpen,        setEscalateOpen]        = useState(false);
  const [actionRequiredOpen,  setActionRequiredOpen]  = useState(false);
  const [activeTab,           setActiveTab]           = useState<"notes" | "comms" | "history" | "overrides">("notes");
  const { toast } = useToast();

  const ss = statusStyle(c.status);

  const handleAddNote = (note: CaseNote) => {
    onUpdateCase({ ...c, notes: [note, ...c.notes] });
  };

  const handleEscalate = () => {
    setEscalateOpen(false);
    toast({ title: `Case escalated to admin — ${c.business}`, variant: "success" });
  };

  const handleActionRequired = () => {
    setActionRequiredOpen(false);
    toast({ title: `Marked as Action Required — ${c.business}`, variant: "success" });
  };

  const us = urgencyStyle(c.urgency);

  return (
    <div className="flex flex-col gap-5">
      {/* Back + case header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm mb-4 hover:opacity-80 transition-opacity"
          style={{ color: BRAND.accent }}
        >
          <ArrowLeft size={15} /> Back to Review Queue
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-white">{c.business}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: us.color, backgroundColor: us.bg }}>{c.urgency} Urgency</span>
              <span className="text-xs" style={{ color: BRAND.muted }}>Reason: {c.reason}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel 1: Business Summary ── */}
      <Panel title="Business Summary" icon={<Building2 size={16} />}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Business Name",       value: c.business,          icon: <Building2 size={13} />   },
            { label: "Country",             value: c.country,           icon: <MapPin size={13} />      },
            { label: "Assigned Accountant", value: c.assignedAccountant,icon: <User size={13} />        },
            { label: "Current Score",       value: String(c.score),     icon: <ShieldCheck size={13} /> },
            { label: "Current Status",      value: c.status,            icon: <Flag size={13} />        },
            { label: "Last Updated",        value: c.lastUpdated,       icon: <Calendar size={13} />    },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: BRAND.muted }}>
                <span style={{ color: BRAND.muted }}>{item.icon}</span>
                {item.label}
              </div>
              <div className="text-sm font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Panel 2: Evidence ── */}
      <Panel title="Evidence" icon={<FileSearch size={16} />}>
        <div className="flex flex-col gap-3">
          {/* Key results */}
          {[
            { label: "KYC / KYB Result",         value: c.kycResult        },
            { label: "Registry Verification",    value: c.registryResult   },
            { label: "Tax Sync Result",          value: c.taxSyncResult    },
            { label: "Bank Sync Status",         value: c.bankSyncStatus   },
          ].map((item) => {
            const ev = evidenceStatus(item.value);
            return (
              <div key={item.label} className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex-shrink-0 mt-0.5" style={{ color: ev.color }}>{ev.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs mb-0.5" style={{ color: BRAND.muted }}>{item.label}</div>
                  <div className="text-sm text-white">{item.value}</div>
                </div>
              </div>
            );
          })}

          {/* Uploaded docs */}
          <div className="py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="text-xs mb-2" style={{ color: BRAND.muted }}>Uploaded Documents</div>
            {c.uploadedDocs.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {c.uploadedDocs.map((doc) => (
                  <div key={doc} className="flex items-center gap-2 text-sm">
                    <FileText size={13} style={{ color: "#06D6A0" }} />
                    <span className="text-white">{doc}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: BRAND.muted }}>No documents uploaded.</div>
            )}
          </div>

          {/* AML flags */}
          <div className="py-2">
            <div className="text-xs mb-2" style={{ color: BRAND.muted }}>AML Flags</div>
            {c.amlFlags.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {c.amlFlags.map((flag) => (
                  <div key={flag} className="flex items-center gap-2 text-sm">
                    <AlertTriangle size={13} style={{ color: "#ef4444" }} />
                    <span style={{ color: "#ef4444" }}>{flag}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={13} style={{ color: "#06D6A0" }} />
                <span style={{ color: "#06D6A0" }}>No AML flags</span>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* ── Panel 3: Review Actions ── */}
      <Panel title="Review Actions" icon={<ShieldCheck size={16} />}>
        <div className="flex flex-col gap-3">
          {/* Info banner */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ backgroundColor: `${BRAND.accent}08`, border: `1px solid ${BRAND.accent}20`, color: "rgba(255,255,255,0.5)" }}>
            <AlertCircle size={13} style={{ color: BRAND.accent, flexShrink: 0, marginTop: 1 }} />
            <span>You can request documents, flag action required, or escalate to admin. Approve, override, and freeze actions are admin-only.</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {/* Request More Documents */}
            <PermissionGuard permission="request_missing_documents">
              <button
                type="button"
                onClick={() => setDocSheet(true)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left transition-colors hover:bg-white/[0.04]"
                style={{ borderColor: `${BRAND.accent}30`, backgroundColor: "rgba(255,255,255,0.02)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND.accent}15` }}>
                  <FileUp size={15} style={{ color: BRAND.accent }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Request More Documents</div>
                  <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>Send a document request to the client</div>
                </div>
              </button>
            </PermissionGuard>

            {/* Mark Action Required */}
            <PermissionGuard permission="add_compliance_notes">
              <button
                type="button"
                onClick={() => setActionRequiredOpen(true)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left transition-colors hover:bg-white/[0.04]"
                style={{ borderColor: `${BRAND.gold}30`, backgroundColor: "rgba(255,255,255,0.02)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND.gold}15` }}>
                  <Flag size={15} style={{ color: BRAND.gold }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Mark Action Required</div>
                  <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>Client gets tasks assigned, case stays open</div>
                </div>
              </button>
            </PermissionGuard>

            {/* Escalate to Admin */}
            <button
              type="button"
              onClick={() => setEscalateOpen(true)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left transition-colors hover:bg-white/[0.04]"
              style={{ borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(255,255,255,0.02)" }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(239,68,68,0.12)" }}>
                <Send size={15} style={{ color: "#ef4444" }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Escalate to Admin</div>
                <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>Admin gets alert; funding lock may activate</div>
              </div>
            </button>
          </div>

          {/* Admin-only blocked actions */}
          <div className="mt-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-xs mb-2" style={{ color: BRAND.muted }}>Admin-only actions (not available to staff)</div>
            <div className="flex flex-wrap gap-2">
              {["Approve Check", "Override Score", "Freeze Funding Eligibility"].map((action) => (
                <span key={action} className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {action}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* ── Panel 4: Notes & Audit Trail ── */}
      <Panel title="Notes & Audit Trail" icon={<FileText size={16} />}>
        {/* Tab bar */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {([
            { key: "notes",     label: "Reviewer Notes"    },
            { key: "comms",     label: "Client Comms"      },
            { key: "history",   label: "Score History"     },
            { key: "overrides", label: "Prior Overrides"   },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.key ? "rgba(255,255,255,0.1)" : "transparent",
                color:           activeTab === tab.key ? "white"                   : BRAND.muted,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reviewer Notes */}
        {activeTab === "notes" && (
          <div className="flex flex-col gap-3">
            <PermissionGuard permission="add_compliance_notes">
              <button
                type="button"
                onClick={() => setNoteSheet(true)}
                className="flex items-center gap-2 self-start px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white/10"
                style={{ borderColor: `${BRAND.gold}40`, color: BRAND.gold }}
              >
                + Add Reviewer Note
              </button>
            </PermissionGuard>
            {c.notes.length > 0 ? (
              c.notes.map((note, i) => (
                <div key={i} className="px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white">{note.author}</span>
                    <span className="text-xs" style={{ color: BRAND.muted }}>{note.date}</span>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)", lineHeight: "1.6" }}>{note.text}</p>
                </div>
              ))
            ) : (
              <div className="text-sm py-4 text-center" style={{ color: BRAND.muted }}>No reviewer notes yet.</div>
            )}
          </div>
        )}

        {/* Client Comms */}
        {activeTab === "comms" && (
          <div className="flex flex-col gap-2">
            {c.clientComms.length > 0 ? (
              c.clientComms.map((comm, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-xs px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5 font-medium" style={{ backgroundColor: `${BRAND.accent}15`, color: BRAND.accent }}>{comm.type}</div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{comm.summary}</div>
                    <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>{comm.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm py-4 text-center" style={{ color: BRAND.muted }}>No client communications logged.</div>
            )}
          </div>
        )}

        {/* Score History */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-2">
            {c.scoreHistory.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="font-bold text-sm flex-shrink-0 w-8" style={{ color: scoreColor(entry.score) }}>{entry.score}</div>
                <div className="flex-1">
                  <div className="text-sm text-white">{entry.note}</div>
                  <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>{entry.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prior Overrides */}
        {activeTab === "overrides" && (
          <div className="text-sm py-4 text-center" style={{ color: BRAND.muted }}>
            No prior overrides recorded for this case.
          </div>
        )}
      </Panel>

      {/* Sheets & Dialogs */}
      <AddNoteSheet   open={noteSheet}  business={c.business} onClose={() => setNoteSheet(false)}  onAdd={handleAddNote} />
      <RequestDocSheet open={docSheet}  business={c.business} onClose={() => setDocSheet(false)} />

      <ConfirmDialog
        open={escalateOpen}
        title="Escalate to Admin"
        description={`This will alert the admin and may activate a funding lock for ${c.business}. Are you sure?`}
        confirmLabel="Escalate"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={handleEscalate}
        onCancel={() => setEscalateOpen(false)}
      />

      <ConfirmDialog
        open={actionRequiredOpen}
        title="Mark Action Required"
        description={`This will assign tasks to ${c.business} and keep the case open until they comply. Proceed?`}
        confirmLabel="Mark Action Required"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={handleActionRequired}
        onCancel={() => setActionRequiredOpen(false)}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StaffCompliancePage() {
  const [cases, setCases] = useState<ComplianceCase[]>(INITIAL_CASES);
  const [view, setView] = useState<"queue" | "case">("queue");
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);

  const handleOpenCase = (c: ComplianceCase) => {
    setSelectedCase(c);
    setView("case");
  };

  const handleBack = () => {
    setView("queue");
    setSelectedCase(null);
  };

  const handleUpdateCase = (updated: ComplianceCase) => {
    setCases((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    setSelectedCase(updated);
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>
            {view === "queue" ? "Review queue for your assigned clients." : `Case — ${selectedCase?.business}`}
          </p>
        </div>

        {/* Content */}
        {view === "queue" && (
          <QueueView cases={cases} onOpenCase={handleOpenCase} />
        )}

        {view === "case" && selectedCase && (
          <CaseView
            c={selectedCase}
            onBack={handleBack}
            onUpdateCase={handleUpdateCase}
          />
        )}

      </div>
    </div>
  );
}
