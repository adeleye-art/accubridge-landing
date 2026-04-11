"use client";

import React, { useState } from "react";
import { ArrowLeft, Building2, User, Calendar, ShieldCheck, ChevronRight, AlertCircle } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { useToast } from "@/components/shared/toast";
import {
  useGetComplianceCasesQuery,
  useGetComplianceCaseDetailQuery,
  useUpdateComplianceCaseMutation,
  ApiComplianceCase,
} from "@/lib/api/complianceApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

// Reason filter map: value=undefined means "All"
const REASON_FILTERS: Array<{ label: string; value: number | undefined; countKey: keyof typeof COUNT_KEYS }> = [
  { label: "All",                    value: undefined, countKey: "allCount"                   },
  { label: "High Risk",              value: 0,         countKey: "highRiskCount"              },
  { label: "Pending Review",         value: 1,         countKey: "pendingReviewCount"         },
  { label: "Document Mismatch",      value: 2,         countKey: "documentMismatchCount"      },
  { label: "Overdue Tax Issues",     value: 3,         countKey: "overdueTaxIssuesCount"      },
  { label: "Funding-Related Review", value: 4,         countKey: "fundingRelatedReviewCount"  },
  { label: "Stale Financial Data",   value: 5,         countKey: "staleFinancialDataCount"    },
];

// Just used as a type reference for the count key lookup
const COUNT_KEYS = {
  allCount: 0, highRiskCount: 0, pendingReviewCount: 0, documentMismatchCount: 0,
  overdueTaxIssuesCount: 0, fundingRelatedReviewCount: 0, staleFinancialDataCount: 0,
};

const STATUS_OPTIONS = [
  { label: "Pending",       value: 0 },
  { label: "Under Review",  value: 1 },
  { label: "Resolved",      value: 2 },
  { label: "Escalated",     value: 3 },
];

const URGENCY_OPTIONS = [
  { label: "Low",    value: 0 },
  { label: "Medium", value: 1 },
  { label: "High",   value: 2 },
];

function scoreColor(s: number) {
  if (s >= 70) return "#06D6A0";
  if (s >= 40) return "#D4AF37";
  return "#ef4444";
}

function urgencyStyle(u: string) {
  if (u === "High")   return { color: "#ef4444", bg: "rgba(239,68,68,0.1)"  };
  if (u === "Medium") return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)" };
  return                     { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"  };
}

function statusStyle(s: string) {
  if (s === "Resolved")    return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"  };
  if (s === "UnderReview") return { color: "#3E92CC", bg: "rgba(62,146,204,0.1)" };
  if (s === "Escalated")   return { color: "#ef4444", bg: "rgba(239,68,68,0.1)"  };
  return                          { color: "#D4AF37", bg: "rgba(212,175,55,0.1)" };
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ""}`} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />;
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

// ─── Update Case Sheet ────────────────────────────────────────────────────────

function UpdateCaseSheet({ caseItem, onClose }: { caseItem: ApiComplianceCase; onClose: () => void }) {
  const statusValue  = STATUS_OPTIONS.find((o) => o.label.replace(" ", "") === caseItem.status.replace(" ", ""))?.value ?? 0;
  const urgencyValue = URGENCY_OPTIONS.find((o) => o.label === caseItem.urgency)?.value ?? 0;

  const [status,  setStatus]  = useState(statusValue);
  const [urgency, setUrgency] = useState(urgencyValue);
  const [notes,   setNotes]   = useState(caseItem.notes ?? "");
  const [updateCase, { isLoading }] = useUpdateComplianceCaseMutation();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await updateCase({ id: caseItem.id, body: { status, urgency, notes: notes || null } }).unwrap();
      toast({ title: "Case updated", variant: "success" });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to update case";
      toast({ title: msg, variant: "error" });
    }
  };

  const inputStyle = { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)", color: "white" };
  const labelStyle = { color: "rgba(255,255,255,0.7)" };

  return (
    <SystemSheet open onClose={onClose} title="Update Case" description={`Update compliance case for ${caseItem.businessName}`}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSave} disabled={isLoading} className="px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-60" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
            {isLoading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      }>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Status</label>
          <select value={status} onChange={(e) => setStatus(Number(e.target.value))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value} style={{ background: "#0A2463" }}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Urgency</label>
          <select value={urgency} onChange={(e) => setUrgency(Number(e.target.value))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
            {URGENCY_OPTIONS.map((o) => <option key={o.value} value={o.value} style={{ background: "#0A2463" }}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} placeholder="Add reviewer notes..."
            className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none resize-none placeholder-[#6B7280]"
            style={inputStyle} />
        </div>
      </div>
    </SystemSheet>
  );
}

// ─── Case View ────────────────────────────────────────────────────────────────

function CaseView({ caseId, onBack }: { caseId: number; onBack: () => void }) {
  const { data: c, isLoading } = useGetComplianceCaseDetailQuery(caseId);
  const [updateOpen, setUpdateOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: BRAND.accent }}>
          <ArrowLeft size={15} /> Back to Review Queue
        </button>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  if (!c) return null;

  const ss = statusStyle(c.status);
  const us = urgencyStyle(c.urgency);

  return (
    <div className="flex flex-col gap-5">
      {/* Back + header */}
      <div>
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm mb-4 hover:opacity-80 transition-opacity" style={{ color: BRAND.accent }}>
          <ArrowLeft size={15} /> Back to Review Queue
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-white">{c.businessName}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: us.color, backgroundColor: us.bg }}>{c.urgency} Urgency</span>
              <span className="text-xs" style={{ color: BRAND.muted }}>Reason: {c.reason}</span>
            </div>
          </div>
          <PermissionGuard permission="add_compliance_notes">
            <button type="button" onClick={() => setUpdateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90"
              style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
              Update Case
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Business Summary */}
      <Panel title="Business Summary" icon={<Building2 size={16} />}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Business Name",     value: c.businessName,                icon: <Building2 size={13} />   },
            { label: "Compliance Score",  value: String(c.clientScore),         icon: <ShieldCheck size={13} /> },
            { label: "Assigned Reviewer", value: c.assignedReviewerName ?? "—", icon: <User size={13} />        },
            { label: "Opened",            value: c.openedAtFormatted,           icon: <Calendar size={13} />    },
            { label: "Status",            value: c.status,                      icon: <ShieldCheck size={13} /> },
            { label: "Urgency",           value: c.urgency,                     icon: <AlertCircle size={13} /> },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: BRAND.muted }}>
                {item.icon} {item.label}
              </div>
              <div className="text-sm font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Reviewer Notes */}
      <Panel title="Reviewer Notes" icon={<ShieldCheck size={16} />}>
        {c.notes ? (
          <p className="text-sm text-white whitespace-pre-wrap" style={{ lineHeight: 1.6 }}>{c.notes}</p>
        ) : (
          <p className="text-sm" style={{ color: BRAND.muted }}>No notes recorded yet.</p>
        )}
      </Panel>

      {updateOpen && <UpdateCaseSheet caseItem={c} onClose={() => setUpdateOpen(false)} />}
    </div>
  );
}

// ─── Queue View ───────────────────────────────────────────────────────────────

function QueueView({ onOpenCase }: { onOpenCase: (id: number) => void }) {
  const [reasonFilter, setReasonFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetComplianceCasesQuery({
    reason: reasonFilter,
    page,
    pageSize: 20,
    sortDesc: true,
  });

  const cases = data?.cases ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {REASON_FILTERS.map((f) => {
          const active = reasonFilter === f.value;
          const count  = data ? (data[f.countKey as keyof typeof data] as number ?? 0) : 0;
          return (
            <button key={f.label} type="button" onClick={() => { setReasonFilter(f.value); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
              style={{
                borderColor:     active ? `${BRAND.accent}60`  : "rgba(255,255,255,0.1)",
                backgroundColor: active ? `${BRAND.accent}15`  : "rgba(255,255,255,0.03)",
                color:           active ? BRAND.accent          : "rgba(255,255,255,0.55)",
              }}>
              {f.label}
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                style={{ backgroundColor: active ? `${BRAND.accent}25` : "rgba(255,255,255,0.08)", color: active ? BRAND.accent : BRAND.muted }}>
                {count}
              </span>
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
                {["Business", "Score", "Reason for Review", "Urgency", "Status", "Opened", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : cases.map((c) => {
                    const us = urgencyStyle(c.urgency);
                    const ss = statusStyle(c.status);
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className="px-5 py-3.5 font-medium">{c.businessName}</td>
                        <td className="px-5 py-3.5 font-bold" style={{ color: scoreColor(c.clientScore) }}>{c.clientScore}</td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{c.reason}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: us.color, backgroundColor: us.bg }}>{c.urgency}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{c.openedAtFormatted}</td>
                        <td className="px-5 py-3.5">
                          <button type="button" onClick={() => onOpenCase(c.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-white/10"
                            style={{ borderColor: `${BRAND.accent}40`, color: BRAND.accent }}>
                            Open Case <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
              }
              {!isLoading && !isFetching && cases.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: BRAND.muted }}>No cases match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalCount > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="text-xs" style={{ color: BRAND.muted }}>Page {page} · {data.totalCount} total</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border text-xs transition-colors hover:bg-white/10 disabled:opacity-30"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>Prev</button>
              <button type="button" onClick={() => setPage((p) => p + 1)} disabled={data.totalCount <= page * 20}
                className="px-3 py-1.5 rounded-lg border text-xs transition-colors hover:bg-white/10 disabled:opacity-30"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StaffCompliancePage() {
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        {!selectedCaseId && (
          <div>
            <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
            <h1 className="text-2xl font-bold tracking-tight">Compliance Review Queue</h1>
            <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Review and action compliance cases for your assigned clients.</p>
          </div>
        )}

        {selectedCaseId
          ? <CaseView caseId={selectedCaseId} onBack={() => setSelectedCaseId(null)} />
          : <QueueView onOpenCase={setSelectedCaseId} />
        }

      </div>
    </div>
  );
}
