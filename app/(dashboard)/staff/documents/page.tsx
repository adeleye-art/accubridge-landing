"use client";

import React, { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { useToast } from "@/components/shared/toast";
import {
  useGetDocumentRequestsQuery,
  useCreateDocumentRequestMutation,
} from "@/lib/api/documentRequestApi";
import { useGetClientsQuery } from "@/lib/api/clientApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const DOC_TYPE_OPTIONS = [
  { value: 0, label: "Certificate of Incorporation" },
  { value: 1, label: "Bank Statement"               },
  { value: 2, label: "VAT Certificate"              },
  { value: 3, label: "Proof of Address"             },
  { value: 4, label: "Tax Return"                   },
  { value: 5, label: "Financial Statements"         },
  { value: 6, label: "Other"                        },
];

type StatusTab = "All" | "Pending" | "Submitted" | "Overdue" | "Approved" | "Rejected";
const STATUS_TABS: StatusTab[] = ["All", "Pending", "Submitted", "Overdue", "Approved", "Rejected"];
const STATUS_FILTER_VALUE: Record<StatusTab, number | undefined> = {
  All: undefined, Pending: 0, Submitted: 1, Overdue: 2, Approved: 3, Rejected: 4,
};

function statusStyle(status: string) {
  switch (status) {
    case "Submitted": return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"   };
    case "Pending":   return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)"  };
    case "Approved":  return { color: "#3E92CC", bg: "rgba(62,146,204,0.1)"  };
    case "Rejected":  return { color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
    case "Overdue":   return { color: "#ef4444", bg: "rgba(239,68,68,0.1)"   };
    default:          return { color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
  }
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ""}`} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />;
}

// ─── New Request Sheet ────────────────────────────────────────────────────────
function NewRequestSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ clientId: "", documentType: "0", dueDate: "", message: "" });
  const [createDocumentRequest, { isLoading }] = useCreateDocumentRequestMutation();
  const { data: clientsData } = useGetClientsQuery({ pageSize: 100 });
  const { toast } = useToast();

  const clients = clientsData?.clients ?? [];
  const canSubmit = !!form.clientId && !!form.dueDate && !isLoading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createDocumentRequest({
        clientId: Number(form.clientId),
        documentType: Number(form.documentType),
        dueDate: `${form.dueDate}T00:00:00Z`,
        message: form.message || null,
      }).unwrap();
      toast({ title: "Document request sent", variant: "success" });
      setForm({ clientId: "", documentType: "0", dueDate: "", message: "" });
      onClose();
    } catch {
      toast({ title: "Failed to send document request", variant: "error" });
    }
  };

  const inputStyle = { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)", color: "white" };
  const labelStyle = { color: "rgba(255,255,255,0.7)" };

  return (
    <SystemSheet
      open={open}
      title="New Document Request"
      description="Send a document request to a client"
      onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm border"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={!canSubmit}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-opacity"
            style={{ backgroundColor: BRAND.gold, color: BRAND.primary, opacity: canSubmit ? 1 : 0.5 }}>
            {isLoading ? "Sending…" : "Send Request"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Client</label>
          <select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
            className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
            <option value="" style={{ background: "#0A2463" }}>Select a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={String(c.id)} style={{ background: "#0A2463" }}>{c.businessName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Document Type</label>
          <select value={form.documentType} onChange={(e) => setForm((f) => ({ ...f, documentType: e.target.value }))}
            className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
            {DOC_TYPE_OPTIONS.map((d) => (
              <option key={d.value} value={String(d.value)} style={{ background: "#0A2463" }}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Due Date</label>
          <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Message (optional)</label>
          <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Add context for the client..." rows={3}
            className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none placeholder-[#6B7280]"
            style={inputStyle} />
        </div>
      </div>
    </SystemSheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StaffDocumentsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>("All");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data, isLoading } = useGetDocumentRequestsQuery({
    status: STATUS_FILTER_VALUE[activeTab],
    page,
    pageSize: PAGE_SIZE,
  });

  const requests   = data?.requests ?? [];
  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1;

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
            <h1 className="text-2xl font-bold tracking-tight">Document Requests</h1>
            <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Track and send missing document requests to clients.</p>
          </div>
          <PermissionGuard permission="request_missing_documents">
            <button type="button" onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90"
              style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
              <Plus size={16} /> New Request
            </button>
          </PermissionGuard>
        </div>

        {/* Summary badges */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Pending",   value: isLoading ? "—" : (data?.pendingCount   ?? 0), color: BRAND.gold  },
            { label: "Submitted", value: isLoading ? "—" : (data?.submittedCount ?? 0), color: "#06D6A0"   },
            { label: "Overdue",   value: isLoading ? "—" : (data?.overdueCount   ?? 0), color: "#ef4444"   },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 px-4 py-2 rounded-full border"
              style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" }}>
              <span className="font-bold text-sm" style={{ color: b.color }}>{b.value}</span>
              <span className="text-xs" style={{ color: BRAND.muted }}>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button key={tab} type="button" onClick={() => { setActiveTab(tab); setPage(1); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === tab ? BRAND.gold : "rgba(255,255,255,0.06)",
                color: activeTab === tab ? BRAND.primary : "rgba(255,255,255,0.6)",
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Client", "Document", "Requested By", "Due Date", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        {Array.from({ length: 5 }).map((__, j) => (
                          <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : requests.map((r) => {
                      const ss = statusStyle(r.status);
                      return (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td className="px-5 py-3.5 font-medium">{r.clientName}</td>
                          <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{r.documentType}</td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{r.requestedByName}</td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: r.isOverdue ? "#ef4444" : BRAND.muted }}>{r.dueDateFormatted}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{r.status}</span>
                          </td>
                        </tr>
                      );
                    })
                }
                {!isLoading && requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No document requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="text-xs" style={{ color: BRAND.muted }}>Page {data.page} of {totalPages}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                  className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
                  className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <NewRequestSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
