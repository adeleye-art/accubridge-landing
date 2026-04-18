"use client";

import React, { useState } from "react";
import {
  Search, AlertTriangle, CheckCircle, Clock, FileX, Banknote,
  Database, ChevronRight, Shield, NotepadText, History, Gavel,
  TriangleAlert, X, Plus, Trash2, FileText,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { useGetComplianceCasesQuery, useUpdateComplianceCaseMutation, type ApiComplianceCase } from "@/lib/api/complianceApi";
import { useGetInternalNotesQuery, useCreateInternalNoteMutation, useDeleteInternalNoteMutation } from "@/lib/api/internalNoteApi";
import { useCreateDocumentRequestMutation, useGetDocumentRequestsQuery } from "@/lib/api/documentRequestApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463", green: "#06D6A0", red: "#ef4444", amber: "#f59e0b" };

// ─── Types & Mappings ─────────────────────────────────────────────────────────

type ReviewReason = "high_risk" | "pending_review" | "doc_mismatch" | "overdue_tax" | "funding_review" | "stale_data";
type Urgency = "high" | "medium" | "low";
type DecisionStatus = "open" | "action_required" | "approved" | "escalated" | "rejected";

const REASON_FROM_API: Record<string, ReviewReason> = {
  HighRisk: "high_risk", PendingReview: "pending_review", DocumentMismatch: "doc_mismatch",
  OverdueTaxIssues: "overdue_tax", FundingRelatedReview: "funding_review", StaleFinancialData: "stale_data",
};

const REASON_TO_API: Record<ReviewReason, number> = {
  high_risk: 0, pending_review: 1, doc_mismatch: 2, overdue_tax: 3, funding_review: 4, stale_data: 5,
};

const URGENCY_FROM_API: Record<string, Urgency> = { Low: "low", Medium: "medium", High: "high" };
const URGENCY_TO_API: Record<Urgency, number> = { low: 0, medium: 1, high: 2 };

const STATUS_FROM_API: Record<string, DecisionStatus> = {
  Pending: "open", UnderReview: "action_required", Resolved: "approved", Escalated: "escalated",
};
const STATUS_TO_API: Record<DecisionStatus, number> = {
  open: 0, action_required: 1, approved: 2, escalated: 3, rejected: 2,
};

// Document type enum matching API
const DOC_TYPES: Array<{ value: number; label: string }> = [
  { value: 0, label: "Certificate of Incorporation" },
  { value: 1, label: "Bank Statement" },
  { value: 2, label: "VAT Certificate" },
  { value: 3, label: "Proof of Address" },
  { value: 4, label: "Tax Return" },
  { value: 5, label: "Financial Statements" },
  { value: 6, label: "Other" },
];

function scoreColor(score: number) {
  if (score >= 85) return BRAND.green;
  if (score >= 70) return "#22c55e";
  if (score >= 50) return BRAND.gold;
  return BRAND.red;
}

function urgencyStyle(u: Urgency) {
  switch (u) {
    case "high":   return { color: BRAND.amber, bg: "rgba(245,158,11,0.12)", label: "High" };
    case "medium": return { color: BRAND.gold,  bg: "rgba(212,175,55,0.12)", label: "Medium" };
    case "low":    return { color: BRAND.green,  bg: "rgba(6,214,160,0.12)",  label: "Low" };
  }
}

function decisionStyle(d: DecisionStatus) {
  switch (d) {
    case "approved":        return { color: BRAND.green,  bg: "rgba(6,214,160,0.1)",   label: "Approved" };
    case "action_required": return { color: BRAND.amber,  bg: "rgba(245,158,11,0.1)",  label: "Action Required" };
    case "escalated":       return { color: BRAND.red,    bg: "rgba(239,68,68,0.1)",   label: "Escalated" };
    case "rejected":        return { color: "#9ca3af",    bg: "rgba(156,163,175,0.1)", label: "Rejected" };
    case "open":            return { color: BRAND.accent, bg: "rgba(62,146,204,0.1)",  label: "Open" };
  }
}

const REASON_LABELS: Record<ReviewReason, { label: string; icon: React.ReactNode }> = {
  high_risk:      { label: "High Risk",      icon: <TriangleAlert size={11} /> },
  pending_review: { label: "Pending Review", icon: <Clock size={11} /> },
  doc_mismatch:   { label: "Doc Mismatch",   icon: <FileX size={11} /> },
  overdue_tax:    { label: "Overdue Tax",    icon: <Gavel size={11} /> },
  funding_review: { label: "Funding Review", icon: <Banknote size={11} /> },
  stale_data:     { label: "Stale Data",     icon: <Database size={11} /> },
};

const FILTER_TABS: Array<{ key: ReviewReason | "all"; label: string }> = [
  { key: "all",            label: "All" },
  { key: "high_risk",      label: "High Risk" },
  { key: "pending_review", label: "Pending Review" },
  { key: "doc_mismatch",   label: "Doc Mismatch" },
  { key: "overdue_tax",    label: "Overdue Tax" },
  { key: "funding_review", label: "Funding Review" },
  { key: "stale_data",     label: "Stale Data" },
];

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ""}`} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />;
}

// ─── Case Sheet ───────────────────────────────────────────────────────────────
type CaseTab = "summary" | "actions" | "notes" | "documents";

function CaseSheet({ open, caseItem, onClose }: {
  open: boolean; caseItem: ApiComplianceCase | null; onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<CaseTab>("summary");
  const [note, setNote] = useState("");
  const [freezeConfirm, setFreezeConfirm] = useState(false);

  // Urgency — allow changing within the review
  const [selectedUrgency, setSelectedUrgency] = useState<Urgency | null>(null);

  const { toast } = useToast();

  const [updateCase, { isLoading: updating }] = useUpdateComplianceCaseMutation();
  const { data: notesData, isLoading: notesLoading } = useGetInternalNotesQuery(
    { clientId: caseItem?.clientId },
    { skip: !caseItem || activeTab !== "notes" },
  );
  const [createNote, { isLoading: creatingNote }] = useCreateInternalNoteMutation();
  const [deleteNote] = useDeleteInternalNoteMutation();

  // Document request state
  const [docType, setDocType]     = useState<number>(0);
  const [dueDate, setDueDate]     = useState("");
  const [docMessage, setDocMessage] = useState("");
  const [createDocRequest, { isLoading: sendingDocRequest }] = useCreateDocumentRequestMutation();
  const { data: docRequestsData, isLoading: docRequestsLoading } = useGetDocumentRequestsQuery(
    { clientId: caseItem?.clientId },
    { skip: !caseItem || activeTab !== "documents" },
  );

  if (!caseItem) return null;

  const urgency   = selectedUrgency ?? (URGENCY_FROM_API[caseItem.urgency] ?? "medium");
  const decision  = STATUS_FROM_API[caseItem.status] ?? "open";
  const reason    = REASON_FROM_API[caseItem.reason] ?? "pending_review";
  const urg       = urgencyStyle(urgency);
  const dec       = decisionStyle(decision);
  const sc        = scoreColor(caseItem.clientScore);

  const tabs: Array<{ key: CaseTab; label: string; icon: React.ReactNode }> = [
    { key: "summary",   label: "Case",      icon: <Shield size={13} />   },
    { key: "actions",   label: "Review",    icon: <Gavel size={13} />    },
    { key: "notes",     label: "Notes",     icon: <History size={13} />  },
    { key: "documents", label: "Documents", icon: <FileText size={13} /> },
  ];

  const handleDecision = async (newDecision: DecisionStatus) => {
    if (!note.trim() && newDecision !== "approved") {
      toast({ title: "Add a note before submitting", variant: "warning" });
      return;
    }
    try {
      await updateCase({
        id: caseItem.id,
        body: {
          status:  STATUS_TO_API[newDecision],
          urgency: URGENCY_TO_API[urgency],
          notes:   note || undefined,
        },
      }).unwrap();
      const labels: Record<DecisionStatus, string> = {
        approved: "Case approved", action_required: "Action required set",
        escalated: "Case escalated", rejected: "Case closed", open: "Case reopened",
      };
      toast({
        title: labels[newDecision],
        variant: newDecision === "approved" ? "success"
          : newDecision === "escalated" || newDecision === "rejected" ? "error"
          : "warning",
      });
      setNote("");
      setSelectedUrgency(null);
      onClose();
    } catch {
      toast({ title: "Failed to update case", variant: "error" });
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await createNote({ clientId: caseItem.clientId, note }).unwrap();
      toast({ title: "Note added", variant: "success" });
      setNote("");
    } catch {
      toast({ title: "Failed to add note", variant: "error" });
    }
  };

  const handleRequestDocument = async () => {
    if (!dueDate) {
      toast({ title: "Please set a due date", variant: "warning" });
      return;
    }
    try {
      await createDocRequest({
        clientId:     caseItem.clientId,
        documentType: docType,
        dueDate:      new Date(dueDate).toISOString(),
        message:      docMessage || undefined,
      }).unwrap();
      toast({ title: "Document request sent to client", variant: "success" });
      setDocMessage("");
      setDueDate("");
    } catch {
      toast({ title: "Failed to send document request", variant: "error" });
    }
  };

  return (
    <SystemSheet open={open} title={caseItem.businessName} description={`Case opened ${caseItem.openedAtFormatted}`} onClose={onClose} width={680}>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ backgroundColor: activeTab === t.key ? BRAND.gold : "transparent", color: activeTab === t.key ? BRAND.primary : "rgba(255,255,255,0.5)" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Panel 1: Case Summary ─────────────────────────────────────────────── */}
      {activeTab === "summary" && (
        <div className="flex flex-col gap-5">
          {/* Score card */}
          <div className="rounded-2xl p-5 border flex items-center gap-5" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border shrink-0" style={{ borderColor: `${sc}44`, backgroundColor: `${sc}0d` }}>
              <span className="text-2xl font-black" style={{ color: sc }}>{caseItem.clientScore}</span>
              <span className="text-xs" style={{ color: BRAND.muted }}>/100</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit" style={{ color: dec.color, backgroundColor: dec.bg }}>{dec.label}</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit" style={{ color: urg.color, backgroundColor: urg.bg }}>{urg.label} Urgency</span>
              {caseItem.assignedReviewerName && (
                <span className="text-xs" style={{ color: BRAND.muted }}>Reviewer: {caseItem.assignedReviewerName}</span>
              )}
            </div>
          </div>

          {/* Case details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Business",      value: caseItem.businessName },
              { label: "Review Reason", value: REASON_LABELS[reason]?.label ?? caseItem.reason },
              { label: "Opened",        value: caseItem.openedAtFormatted },
              { label: "Reviewer",      value: caseItem.assignedReviewerName ?? "Unassigned" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl p-3 border" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="text-xs mb-0.5" style={{ color: BRAND.muted }}>{f.label}</div>
                <div className="text-sm font-medium text-white">{f.value}</div>
              </div>
            ))}
          </div>

          {caseItem.notes && (
            <div className="rounded-xl p-4 border" style={{ backgroundColor: "rgba(62,146,204,0.06)", borderColor: "rgba(62,146,204,0.2)" }}>
              <div className="text-xs font-semibold mb-1" style={{ color: BRAND.accent }}>Case Notes</div>
              <div className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{caseItem.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Panel 2: Review Actions ───────────────────────────────────────────── */}
      {activeTab === "actions" && (
        <div className="flex flex-col gap-5">
          {/* Urgency selector */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.muted }}>Urgency Level</div>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as Urgency[]).map((u) => {
                const s = urgencyStyle(u);
                return (
                  <button key={u} type="button" onClick={() => setSelectedUrgency(u)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all border"
                    style={{
                      backgroundColor: urgency === u ? s.bg : "transparent",
                      borderColor:     urgency === u ? s.color : "rgba(255,255,255,0.12)",
                      color:           urgency === u ? s.color : "rgba(255,255,255,0.4)",
                    }}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.muted }}>
              <NotepadText size={11} className="inline mr-1" /> Reviewer Note (required for most decisions)
            </label>
            <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Add your review note, reasoning, or instructions…"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", lineHeight: "1.6" }} />
          </div>

          {/* Decision buttons */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: BRAND.muted }}>Review Decision</div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleDecision("approved")} disabled={updating}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.3)", color: BRAND.green }}>
                <CheckCircle size={14} /> Approve / Resolve
              </button>
              <button type="button" onClick={() => handleDecision("action_required")} disabled={updating}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: BRAND.amber }}>
                <Clock size={14} /> Action Required
              </button>
              <button type="button" onClick={() => handleDecision("escalated")} disabled={updating}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: BRAND.red }}>
                <TriangleAlert size={14} /> Escalate
              </button>
              <button type="button" onClick={() => handleDecision("rejected")} disabled={updating}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "rgba(107,114,128,0.1)", border: "1px solid rgba(107,114,128,0.25)", color: "#9ca3af" }}>
                <X size={14} /> Reject / Close
              </button>
            </div>
          </div>

          <PermissionGuard permission="freeze_funding_eligibility">
            <button type="button" onClick={() => setFreezeConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: BRAND.red }}>
              <Banknote size={14} /> Freeze Funding Eligibility
            </button>
          </PermissionGuard>
        </div>
      )}

      {/* ── Panel 3: Internal Notes ───────────────────────────────────────────── */}
      {activeTab === "notes" && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Add an internal note…"
              className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }} />
            <button type="button" onClick={handleAddNote} disabled={creatingNote || !note.trim()}
              className="px-3 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40 hover:opacity-80"
              style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
              <Plus size={16} />
            </button>
          </div>

          {notesLoading && <Skeleton className="h-16 w-full" />}
          {!notesLoading && (notesData?.notes ?? []).length === 0 && (
            <div className="text-sm text-center py-6" style={{ color: BRAND.muted }}>No internal notes yet.</div>
          )}
          {(notesData?.notes ?? []).map((n) => (
            <div key={n.id} className="relative rounded-xl p-4 border group" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm text-white mb-1">{n.note}</div>
                  <div className="text-xs" style={{ color: BRAND.muted }}>By {n.authorName} · {n.createdAtFormatted}</div>
                </div>
                <button type="button" onClick={() => deleteNote(n.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 transition-all"
                  style={{ color: "#ef4444" }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Panel 4: Request Documents ────────────────────────────────────────── */}
      {activeTab === "documents" && (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl p-4 border text-sm" style={{ backgroundColor: "rgba(62,146,204,0.06)", borderColor: "rgba(62,146,204,0.2)", color: "rgba(255,255,255,0.7)" }}>
            Request a specific document from <strong className="text-white">{caseItem.businessName}</strong>. The client will be notified and prompted to upload it.
          </div>

          {/* Document type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.muted }}>Document Type</label>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TYPES.map((dt) => (
                <button key={dt.value} type="button" onClick={() => setDocType(dt.value)}
                  className="py-2.5 px-3 rounded-xl text-xs font-medium text-left transition-all border"
                  style={{
                    backgroundColor: docType === dt.value ? `${BRAND.gold}18` : "rgba(255,255,255,0.03)",
                    borderColor:     docType === dt.value ? BRAND.gold : "rgba(255,255,255,0.1)",
                    color:           docType === dt.value ? BRAND.gold : "rgba(255,255,255,0.6)",
                  }}>
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.muted }}>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.muted }}>Message to Client (optional)</label>
            <textarea rows={3} value={docMessage} onChange={(e) => setDocMessage(e.target.value)}
              placeholder="e.g. Please upload a clear, certified copy…"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }} />
          </div>

          <button
            type="button"
            onClick={handleRequestDocument}
            disabled={sendingDocRequest || !dueDate}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
          >
            <FileText size={14} />
            {sendingDocRequest ? "Sending Request…" : "Send Document Request"}
          </button>

          {/* Previously sent requests */}
          <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: BRAND.muted }}>
              Previously Sent Requests
            </div>
            {docRequestsLoading && <Skeleton className="h-14 w-full" />}
            {!docRequestsLoading && (docRequestsData?.requests ?? []).length === 0 && (
              <div className="text-xs text-center py-4" style={{ color: BRAND.muted }}>
                No document requests sent yet.
              </div>
            )}
            {(docRequestsData?.requests ?? []).map((req) => {
              const docLabel = DOC_TYPES.find((d) => String(d.value) === req.documentType || d.label === req.documentType)?.label ?? req.documentType;
              const statusMap: Record<string, { color: string; bg: string; label: string }> = {
                Pending:   { color: BRAND.amber,  bg: "rgba(245,158,11,0.12)",  label: "Pending"   },
                Submitted: { color: BRAND.accent, bg: "rgba(62,146,204,0.12)",  label: "Submitted" },
                Overdue:   { color: BRAND.red,    bg: "rgba(239,68,68,0.12)",   label: "Overdue"   },
                Approved:  { color: BRAND.green,  bg: "rgba(6,214,160,0.12)",   label: "Approved"  },
                Rejected:  { color: "#9ca3af",    bg: "rgba(156,163,175,0.1)",  label: "Rejected"  },
              };
              const st = statusMap[req.status] ?? { color: BRAND.muted, bg: "rgba(255,255,255,0.06)", label: req.status };
              return (
                <div
                  key={req.id}
                  className="flex items-start justify-between gap-3 rounded-xl p-3 mb-2 border"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{docLabel}</div>
                    <div className="text-xs" style={{ color: BRAND.muted }}>
                      Due {req.dueDateFormatted}
                      {req.isOverdue && (
                        <span className="ml-1.5" style={{ color: BRAND.red }}>· Overdue</span>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{ color: st.color, backgroundColor: st.bg }}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={freezeConfirm}
        title="Freeze Funding Eligibility"
        description={`This will block ${caseItem.businessName} from applying for or receiving funding until an admin lifts the freeze. This action is logged.`}
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
  const [search,        setSearch]        = useState("");
  const [activeFilter,  setActiveFilter]  = useState<ReviewReason | "all">("all");
  const [urgencyFilter, setUrgencyFilter] = useState<number | undefined>(undefined);
  const [statusFilter,  setStatusFilter]  = useState<number | undefined>(undefined);
  const [page,          setPage]          = useState(1);
  const [caseSheet,     setCaseSheet]     = useState<ApiComplianceCase | null>(null);

  const PAGE_SIZE = 20;

  const { data, isLoading } = useGetComplianceCasesQuery({
    reason:   activeFilter !== "all" ? REASON_TO_API[activeFilter] : undefined,
    urgency:  urgencyFilter,
    status:   statusFilter,
    page,
    pageSize: PAGE_SIZE,
  });

  const cases = data?.cases ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const filtered = search
    ? cases.filter((c) => {
        const q = search.toLowerCase();
        return c.businessName.toLowerCase().includes(q) ||
               (c.assignedReviewerName ?? "").toLowerCase().includes(q);
      })
    : cases;

  const thStyle = "px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap";

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Review Queue</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Manage review cases, inspect evidence, and issue decisions across all registered businesses.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Cases",    value: data?.allCount ?? 0,                  color: BRAND.accent },
            { label: "High Risk",      value: data?.highRiskCount ?? 0,             color: BRAND.red    },
            { label: "Pending Review", value: data?.pendingReviewCount ?? 0,        color: BRAND.amber  },
            { label: "Funding Review", value: data?.fundingRelatedReviewCount ?? 0, color: BRAND.gold   },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              {isLoading ? <Skeleton className="h-8 w-12 mb-1" /> : <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>}
              <div className="text-xs mt-1" style={{ color: BRAND.muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="flex flex-col gap-3">
          {/* Search + Urgency/Status selects */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[200px]" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
              <Search size={14} style={{ color: BRAND.muted }} />
              <input type="text" placeholder="Search business or reviewer…" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] w-full" />
            </div>
            <select
              value={urgencyFilter ?? ""}
              onChange={(e) => { setUrgencyFilter(e.target.value === "" ? undefined : Number(e.target.value)); setPage(1); }}
              className="h-9 px-3 rounded-xl text-sm outline-none border appearance-none cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: urgencyFilter !== undefined ? "white" : BRAND.muted, colorScheme: "dark" }}
            >
              <option value="">All Urgency</option>
              <option value="0">Low</option>
              <option value="1">Medium</option>
              <option value="2">High</option>
            </select>
            <select
              value={statusFilter ?? ""}
              onChange={(e) => { setStatusFilter(e.target.value === "" ? undefined : Number(e.target.value)); setPage(1); }}
              className="h-9 px-3 rounded-xl text-sm outline-none border appearance-none cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: statusFilter !== undefined ? "white" : BRAND.muted, colorScheme: "dark" }}
            >
              <option value="">All Status</option>
              <option value="0">Pending</option>
              <option value="1">Under Review</option>
              <option value="2">Resolved</option>
              <option value="3">Escalated</option>
            </select>
          </div>
          {/* Reason filter tabs */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_TABS.map((tab) => (
              <button key={tab.key} type="button"
                onClick={() => { setActiveFilter(tab.key); setPage(1); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{ backgroundColor: activeFilter === tab.key ? BRAND.gold : "rgba(255,255,255,0.06)", color: activeFilter === tab.key ? BRAND.primary : "rgba(255,255,255,0.6)" }}>
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
                  {["Business", "Score", "Reason", "Urgency", "Reviewer", "Opened", "Status", ""].map((h) => (
                    <th key={h} className={thStyle} style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : filtered.length === 0
                    ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: BRAND.muted }}>
                          No review cases match your filters.
                        </td>
                      </tr>
                    )
                    : filtered.map((c) => {
                        const urgency  = URGENCY_FROM_API[c.urgency] ?? "medium";
                        const decision = STATUS_FROM_API[c.status] ?? "open";
                        const reason   = REASON_FROM_API[c.reason] ?? "pending_review";
                        const urg      = urgencyStyle(urgency);
                        const dec      = decisionStyle(decision);
                        return (
                          <tr key={c.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                            onClick={() => setCaseSheet(c)}>
                            <td className="px-4 py-3.5">
                              <div className="font-medium text-white">{c.businessName}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-lg font-black" style={{ color: scoreColor(c.clientScore) }}>{c.clientScore}</span>
                              <span className="text-xs ml-1" style={{ color: BRAND.muted }}>/100</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit" style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}>
                                {REASON_LABELS[reason]?.icon} {REASON_LABELS[reason]?.label ?? c.reason}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: urg.color, backgroundColor: urg.bg }}>{urg.label}</span>
                            </td>
                            <td className="px-4 py-3.5 text-sm" style={{ color: c.assignedReviewerName ? "rgba(255,255,255,0.7)" : BRAND.muted }}>
                              {c.assignedReviewerName ?? "Unassigned"}
                            </td>
                            <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: BRAND.muted }}>{c.openedAtFormatted}</td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: dec.color, backgroundColor: dec.bg }}>{dec.label}</span>
                            </td>
                            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                              <button type="button" onClick={() => setCaseSheet(c)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
                                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}>
                                Open <ChevronRight size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: BRAND.muted }}>
              Page {page} of {totalPages} · {totalCount} total cases
            </span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}>
                Previous
              </button>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}>
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      <CaseSheet open={!!caseSheet} caseItem={caseSheet} onClose={() => setCaseSheet(null)} />
    </div>
  );
}
