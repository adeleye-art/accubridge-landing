"use client";

import React, { useState } from "react";
import {
  Search, ChevronRight, Shield, Gavel, History, FileText,
  CheckCircle, Clock, TriangleAlert, Plus, Trash2, NotepadText,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { useToast } from "@/components/shared/toast";
import {
  useGetComplianceCasesQuery,
  useGetComplianceCaseDetailQuery,
  useUpdateComplianceCaseMutation,
  ApiComplianceCase,
} from "@/lib/api/complianceApi";
import {
  useGetInternalNotesQuery,
  useCreateInternalNoteMutation,
  useDeleteInternalNoteMutation,
} from "@/lib/api/internalNoteApi";
import { useCreateDocumentRequestMutation } from "@/lib/api/documentRequestApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = {
  gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280",
  primary: "#0A2463", green: "#06D6A0", red: "#ef4444", amber: "#f59e0b",
};

const REASON_FILTERS: Array<{ label: string; value: number | undefined; countKey: string }> = [
  { label: "All",                    value: undefined, countKey: "allCount"                   },
  { label: "High Risk",              value: 0,         countKey: "highRiskCount"              },
  { label: "Pending Review",         value: 1,         countKey: "pendingReviewCount"         },
  { label: "Document Mismatch",      value: 2,         countKey: "documentMismatchCount"      },
  { label: "Overdue Tax Issues",     value: 3,         countKey: "overdueTaxIssuesCount"      },
  { label: "Funding-Related Review", value: 4,         countKey: "fundingRelatedReviewCount"  },
  { label: "Stale Financial Data",   value: 5,         countKey: "staleFinancialDataCount"    },
];

const DOC_TYPES = [
  { value: 0, label: "Certificate of Incorporation" },
  { value: 1, label: "Bank Statement" },
  { value: 2, label: "VAT Certificate" },
  { value: 3, label: "Proof of Address" },
  { value: 4, label: "Tax Return" },
  { value: 5, label: "Financial Statements" },
  { value: 6, label: "Other" },
];

type Urgency = "low" | "medium" | "high";
type DecisionAction = "resolved" | "action_required" | "escalated";

const URGENCY_FROM_API: Record<string, Urgency> = { Low: "low", Medium: "medium", High: "high" };
const URGENCY_TO_API: Record<Urgency, number>   = { low: 0, medium: 1, high: 2 };
const DECISION_TO_STATUS: Record<DecisionAction, number> = { resolved: 2, action_required: 1, escalated: 3 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 70) return BRAND.green;
  if (s >= 40) return BRAND.gold;
  return BRAND.red;
}

function urgencyStyle(u: Urgency) {
  switch (u) {
    case "high":   return { color: BRAND.amber, bg: "rgba(245,158,11,0.12)",  label: "High"   };
    case "medium": return { color: BRAND.gold,  bg: "rgba(212,175,55,0.12)",  label: "Medium" };
    case "low":    return { color: BRAND.green, bg: "rgba(6,214,160,0.12)",   label: "Low"    };
  }
}

function statusStyle(s: string) {
  if (s === "Resolved")    return { color: BRAND.green,  bg: "rgba(6,214,160,0.1)"  };
  if (s === "UnderReview") return { color: BRAND.accent, bg: "rgba(62,146,204,0.1)" };
  if (s === "Escalated")   return { color: BRAND.red,    bg: "rgba(239,68,68,0.1)"  };
  return                          { color: BRAND.gold,   bg: "rgba(212,175,55,0.1)" };
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className ?? ""}`}
      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
    />
  );
}

// ─── Case Sheet ───────────────────────────────────────────────────────────────

type CaseTab = "summary" | "review" | "notes" | "documents";

function CaseSheet({
  caseItem,
  onClose,
}: {
  caseItem: ApiComplianceCase | null;
  onClose: () => void;
}) {
  const [activeTab,       setActiveTab]       = useState<CaseTab>("summary");
  const [selectedUrgency, setSelectedUrgency] = useState<Urgency | null>(null);
  const [reviewNote,      setReviewNote]      = useState("");
  const [noteInput,       setNoteInput]       = useState("");
  const [docType,         setDocType]         = useState(0);
  const [dueDate,         setDueDate]         = useState("");
  const [docMessage,      setDocMessage]      = useState("");

  const { toast } = useToast();

  const { data: c, isLoading: detailLoading } = useGetComplianceCaseDetailQuery(
    caseItem?.id ?? 0,
    { skip: !caseItem },
  );

  const [updateCase, { isLoading: updating }] = useUpdateComplianceCaseMutation();

  const { data: notesData, isLoading: notesLoading } = useGetInternalNotesQuery(
    { clientId: caseItem?.clientId },
    { skip: !caseItem || activeTab !== "notes" },
  );
  const [createNote, { isLoading: creatingNote }] = useCreateInternalNoteMutation();
  const [deleteNote]                               = useDeleteInternalNoteMutation();

  const [createDocRequest, { isLoading: sendingDoc }] = useCreateDocumentRequestMutation();

  if (!caseItem) return null;

  const urgency = selectedUrgency ?? (URGENCY_FROM_API[caseItem.urgency] ?? "medium");
  const ss      = statusStyle(caseItem.status);
  const us      = urgencyStyle(urgency);
  const sc      = scoreColor(caseItem.clientScore);

  const tabs: Array<{ key: CaseTab; label: string; icon: React.ReactNode }> = [
    { key: "summary",   label: "Case",      icon: <Shield size={13} />   },
    { key: "review",    label: "Review",    icon: <Gavel size={13} />    },
    { key: "notes",     label: "Notes",     icon: <History size={13} />  },
    { key: "documents", label: "Documents", icon: <FileText size={13} /> },
  ];

  const handleDecision = async (action: DecisionAction) => {
    if (!reviewNote.trim() && action !== "resolved") {
      toast({ title: "Add a review note before submitting", variant: "warning" });
      return;
    }
    try {
      await updateCase({
        id:   caseItem.id,
        body: {
          status:  DECISION_TO_STATUS[action],
          urgency: URGENCY_TO_API[urgency],
          notes:   reviewNote || undefined,
        },
      }).unwrap();
      const labels: Record<DecisionAction, string> = {
        resolved: "Case resolved", action_required: "Action required set", escalated: "Case escalated",
      };
      toast({
        title:   labels[action],
        variant: action === "resolved" ? "success" : action === "escalated" ? "error" : "warning",
      });
      setReviewNote("");
      setSelectedUrgency(null);
      onClose();
    } catch {
      toast({ title: "Failed to update case", variant: "error" });
    }
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    try {
      await createNote({ clientId: caseItem.clientId, note: noteInput }).unwrap();
      toast({ title: "Note added", variant: "success" });
      setNoteInput("");
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

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  return (
    <SystemSheet
      open={!!caseItem}
      onClose={onClose}
      title={caseItem.businessName}
      description={`Case opened ${caseItem.openedAtFormatted}`}
      width={640}
    >
      {/* Tab bar */}
      <div
        className="flex gap-1 mb-5 p-1 rounded-xl"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: activeTab === t.key ? BRAND.gold : "transparent",
              color:           activeTab === t.key ? BRAND.primary : "rgba(255,255,255,0.5)",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────────── */}
      {activeTab === "summary" && (
        <div className="flex flex-col gap-5">
          {detailLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : (
            <>
              {/* Score card */}
              <div
                className="rounded-2xl p-5 border flex items-center gap-5"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border shrink-0"
                  style={{ borderColor: `${sc}44`, backgroundColor: `${sc}0d` }}
                >
                  <span className="text-2xl font-black" style={{ color: sc }}>{caseItem.clientScore}</span>
                  <span className="text-xs" style={{ color: BRAND.muted }}>/100</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full w-fit"
                    style={{ color: ss.color, backgroundColor: ss.bg }}
                  >
                    {caseItem.status}
                  </span>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full w-fit"
                    style={{ color: us.color, backgroundColor: us.bg }}
                  >
                    {us.label} Urgency
                  </span>
                  {caseItem.assignedReviewerName && (
                    <span className="text-xs" style={{ color: BRAND.muted }}>
                      Reviewer: {caseItem.assignedReviewerName}
                    </span>
                  )}
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Business",      value: caseItem.businessName },
                  { label: "Review Reason", value: caseItem.reason },
                  { label: "Opened",        value: caseItem.openedAtFormatted },
                  { label: "Reviewer",      value: caseItem.assignedReviewerName ?? "Unassigned" },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="rounded-xl p-3 border"
                    style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
                  >
                    <div className="text-xs mb-0.5" style={{ color: BRAND.muted }}>{f.label}</div>
                    <div className="text-sm font-medium text-white">{f.value}</div>
                  </div>
                ))}
              </div>

              {c?.notes && (
                <div
                  className="rounded-xl p-4 border"
                  style={{ backgroundColor: "rgba(62,146,204,0.06)", borderColor: "rgba(62,146,204,0.2)" }}
                >
                  <div className="text-xs font-semibold mb-1" style={{ color: BRAND.accent }}>Case Notes</div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{c.notes}</div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Review ───────────────────────────────────────────────────────────── */}
      {activeTab === "review" && (
        <div className="flex flex-col gap-5">
          {/* Urgency selector */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.muted }}>
              Urgency Level
            </div>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as Urgency[]).map((u) => {
                const s = urgencyStyle(u);
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setSelectedUrgency(u)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all border"
                    style={{
                      backgroundColor: urgency === u ? s.bg        : "transparent",
                      borderColor:     urgency === u ? s.color     : "rgba(255,255,255,0.12)",
                      color:           urgency === u ? s.color     : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review note */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: BRAND.muted }}
            >
              <NotepadText size={11} className="inline mr-1" />
              Review Note (required for escalation / action required)
            </label>
            <textarea
              rows={4}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Add your review note, reasoning, or instructions…"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none placeholder-[#6B7280]"
              style={{ ...inputStyle, lineHeight: "1.6" }}
            />
          </div>

          {/* Decision buttons */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: BRAND.muted }}>
              Review Decision
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleDecision("resolved")}
                disabled={updating}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.3)", color: BRAND.green }}
              >
                <CheckCircle size={14} /> Resolve Case
              </button>
              <button
                type="button"
                onClick={() => handleDecision("action_required")}
                disabled={updating}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: BRAND.amber }}
              >
                <Clock size={14} /> Action Required
              </button>
              <button
                type="button"
                onClick={() => handleDecision("escalated")}
                disabled={updating}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: BRAND.red }}
              >
                <TriangleAlert size={14} /> Escalate to Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Internal Notes ────────────────────────────────────────────────────── */}
      {activeTab === "notes" && (
        <div className="flex flex-col gap-4">
          <PermissionGuard permission="add_compliance_notes">
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add an internal note…"
                className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none placeholder-[#6B7280]"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={creatingNote || !noteInput.trim()}
                className="px-3 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40 hover:opacity-80 shrink-0"
                style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
              >
                <Plus size={16} />
              </button>
            </div>
          </PermissionGuard>

          {notesLoading && <Skeleton className="h-16 w-full" />}

          {!notesLoading && (notesData?.notes ?? []).length === 0 && (
            <div className="text-sm text-center py-6" style={{ color: BRAND.muted }}>
              No internal notes yet.
            </div>
          )}

          {(notesData?.notes ?? []).map((n) => (
            <div
              key={n.id}
              className="relative rounded-xl p-4 border group"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm text-white mb-1">{n.note}</div>
                  <div className="text-xs" style={{ color: BRAND.muted }}>
                    By {n.authorName} · {n.createdAtFormatted}
                  </div>
                </div>
                <PermissionGuard permission="add_compliance_notes">
                  <button
                    type="button"
                    onClick={() => deleteNote(n.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 transition-all shrink-0"
                    style={{ color: BRAND.red }}
                  >
                    <Trash2 size={12} />
                  </button>
                </PermissionGuard>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Request Document ──────────────────────────────────────────────────── */}
      {activeTab === "documents" && (
        <div className="flex flex-col gap-5">
          <div
            className="rounded-xl p-4 border text-sm"
            style={{ backgroundColor: "rgba(62,146,204,0.06)", borderColor: "rgba(62,146,204,0.2)", color: "rgba(255,255,255,0.7)" }}
          >
            Request a specific document from{" "}
            <strong className="text-white">{caseItem.businessName}</strong>. The client will be
            notified and prompted to upload it.
          </div>

          {/* Document type */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.muted }}>
              Document Type
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TYPES.map((dt) => (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => setDocType(dt.value)}
                  className="py-2.5 px-3 rounded-xl text-xs font-medium text-left transition-all border"
                  style={{
                    backgroundColor: docType === dt.value ? `${BRAND.gold}18` : "rgba(255,255,255,0.03)",
                    borderColor:     docType === dt.value ? BRAND.gold         : "rgba(255,255,255,0.1)",
                    color:           docType === dt.value ? BRAND.gold         : "rgba(255,255,255,0.6)",
                  }}
                >
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.muted }}>
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
              style={{ ...inputStyle, colorScheme: "dark" as const }}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.muted }}>
              Message to Client (optional)
            </label>
            <textarea
              rows={3}
              value={docMessage}
              onChange={(e) => setDocMessage(e.target.value)}
              placeholder="e.g. Please upload a clear, certified copy…"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none placeholder-[#6B7280]"
              style={inputStyle}
            />
          </div>

          <button
            type="button"
            onClick={handleRequestDocument}
            disabled={sendingDoc || !dueDate}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
          >
            <FileText size={14} />
            {sendingDoc ? "Sending Request…" : "Send Document Request"}
          </button>
        </div>
      )}
    </SystemSheet>
  );
}

// ─── Queue View ───────────────────────────────────────────────────────────────

function QueueView() {
  const [reasonFilter, setReasonFilter] = useState<number | undefined>(undefined);
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [caseSheet,    setCaseSheet]    = useState<ApiComplianceCase | null>(null);

  const PAGE_SIZE = 20;

  const { data, isLoading, isFetching } = useGetComplianceCasesQuery({
    reason:   reasonFilter,
    page,
    pageSize: PAGE_SIZE,
    sortDesc: true,
  });

  const allCases   = data?.cases ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const cases = search
    ? allCases.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.businessName.toLowerCase().includes(q) ||
          (c.assignedReviewerName ?? "").toLowerCase().includes(q)
        );
      })
    : allCases;

  return (
    <div className="flex flex-col gap-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Cases",    value: data?.allCount                  ?? 0, color: BRAND.accent },
          { label: "High Risk",      value: data?.highRiskCount             ?? 0, color: BRAND.red    },
          { label: "Pending Review", value: data?.pendingReviewCount        ?? 0, color: BRAND.amber  },
          { label: "Funding Review", value: data?.fundingRelatedReviewCount ?? 0, color: BRAND.gold   },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            {isLoading
              ? <Skeleton className="h-8 w-12 mb-1" />
              : <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            }
            <div className="text-xs mt-1" style={{ color: BRAND.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter chips */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: BRAND.muted }}
          />
          <input
            type="text"
            placeholder="Search by business or reviewer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl text-sm text-white outline-none placeholder-[#6B7280]"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {REASON_FILTERS.map((f) => {
            const active = reasonFilter === f.value;
            const count  = data
              ? (data[f.countKey as keyof typeof data] as number) ?? 0
              : 0;
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => { setReasonFilter(f.value); setPage(1); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                style={{
                  borderColor:     active ? `${BRAND.accent}60`  : "rgba(255,255,255,0.1)",
                  backgroundColor: active ? `${BRAND.accent}15`  : "rgba(255,255,255,0.03)",
                  color:           active ? BRAND.accent          : "rgba(255,255,255,0.55)",
                }}
              >
                {f.label}
                <span
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                  style={{
                    backgroundColor: active ? `${BRAND.accent}25` : "rgba(255,255,255,0.08)",
                    color:           active ? BRAND.accent          : BRAND.muted,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Business", "Score", "Reason for Review", "Urgency", "Status", "Opened", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: BRAND.muted }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : cases.map((c) => {
                    const urgency = URGENCY_FROM_API[c.urgency] ?? "medium";
                    const us = urgencyStyle(urgency);
                    const ss = statusStyle(c.status);
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-white/[0.02] transition-colors"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <td className="px-5 py-3.5 font-medium text-white">{c.businessName}</td>
                        <td className="px-5 py-3.5 font-bold" style={{ color: scoreColor(c.clientScore) }}>
                          {c.clientScore}
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                          {c.reason}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ color: us.color, backgroundColor: us.bg }}
                          >
                            {us.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ color: ss.color, backgroundColor: ss.bg }}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>
                          {c.openedAtFormatted}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => setCaseSheet(c)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-white/10"
                            style={{ borderColor: `${BRAND.accent}40`, color: BRAND.accent }}
                          >
                            Open <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
              }
              {!isLoading && !isFetching && cases.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm"
                    style={{ color: BRAND.muted }}
                  >
                    No cases match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-3 border-t"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <span className="text-xs" style={{ color: BRAND.muted }}>
              Page {page} of {totalPages} · {totalCount} total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border text-xs transition-colors hover:bg-white/10 disabled:opacity-30"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border text-xs transition-colors hover:bg-white/10 disabled:opacity-30"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Case sheet — opens alongside the queue */}
      <CaseSheet caseItem={caseSheet} onClose={() => setCaseSheet(null)} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StaffCompliancePage() {
  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div>
          <div
            className="inline-block border rounded-lg px-3 py-1 text-xs mb-2"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}
          >
            Staff
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Review Queue</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>
            Review and action compliance cases for your assigned clients.
          </p>
        </div>

        <QueueView />
      </div>
    </div>
  );
}
