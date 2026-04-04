"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const CLIENT_LIST  = ["Apex Solutions Ltd", "Nova Consulting UK", "Bright Path Ltd", "TechBridge NG Ltd", "Lagos First Capital"];
const DOC_OPTIONS  = ["Certificate of Incorporation", "Bank Statement (3 months)", "VAT Certificate", "Proof of Address", "ID Document", "Other"];

type RequestStatus = "Pending" | "Submitted" | "Overdue";

interface DocRequest {
  id: string; client: string; document: string; status: RequestStatus; requested: string; due: string;
}

const INIT_REQUESTS: DocRequest[] = [
  { id: "d1", client: "TechBridge NG Ltd",    document: "Certificate of Incorporation", status: "Pending",   requested: "1 Apr 2026",  due: "8 Apr 2026"  },
  { id: "d2", client: "Lagos First Capital",  document: "Bank Statement (3 months)",    status: "Pending",   requested: "31 Mar 2026", due: "7 Apr 2026"  },
  { id: "d3", client: "Bright Path Ltd",      document: "VAT Certificate",              status: "Submitted", requested: "25 Mar 2026", due: "1 Apr 2026"  },
  { id: "d4", client: "Nova Consulting UK",   document: "Proof of Address",             status: "Overdue",   requested: "15 Mar 2026", due: "22 Mar 2026" },
];

function statusStyle(s: RequestStatus) {
  if (s === "Submitted") return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"  };
  if (s === "Pending")   return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)" };
  return { color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
}

function NewRequestSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (r: Omit<DocRequest, "id" | "status">) => void }) {
  const [form, setForm] = useState({ client: CLIENT_LIST[0], document: DOC_OPTIONS[0], due: "", message: "" });
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!form.due) return;
    onCreate({ client: form.client, document: form.document, requested: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), due: form.due });
    toast({ title: `Document request sent to ${form.client}`, variant: "success" });
    setForm({ client: CLIENT_LIST[0], document: DOC_OPTIONS[0], due: "", message: "" });
    onClose();
  };

  const inputStyle = { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)", color: "white" };
  const labelStyle = { color: "rgba(255,255,255,0.7)" };

  return (
    <SystemSheet open={open} title="New Document Request" description="Send a document request to a client" onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSubmit} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Send Request</button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Client</label>
          <select value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
            {CLIENT_LIST.map((c) => <option key={c} value={c} style={{ background: "#0A2463" }}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Document Type</label>
          <select value={form.document} onChange={(e) => setForm((f) => ({ ...f, document: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
            {DOC_OPTIONS.map((d) => <option key={d} value={d} style={{ background: "#0A2463" }}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Due Date</label>
          <input type="date" value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Message (optional)</label>
          <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Add context for the client..." rows={3}
            className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none placeholder-[#6B7280]" style={inputStyle} />
        </div>
      </div>
    </SystemSheet>
  );
}

export default function StaffDocumentsPage() {
  const [requests, setRequests] = useState(INIT_REQUESTS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const { toast } = useToast();

  const pendingCount   = requests.filter((r) => r.status === "Pending").length;
  const submittedCount = requests.filter((r) => r.status === "Submitted").length;
  const overdueCount   = requests.filter((r) => r.status === "Overdue").length;

  const handleCreate = (r: Omit<DocRequest, "id" | "status">) => {
    setRequests((prev) => [{ ...r, id: `d${Date.now()}`, status: "Pending" }, ...prev]);
  };

  const handleCancel = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Request cancelled", variant: "success" });
    setCancelDialog({ open: false, id: "" });
  };

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
            <button type="button" onClick={() => setSheetOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
              <Plus size={16} /> New Request
            </button>
          </PermissionGuard>
        </div>

        {/* Summary */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Pending",   value: pendingCount,   color: BRAND.gold   },
            { label: "Submitted", value: submittedCount, color: "#06D6A0"    },
            { label: "Overdue",   value: overdueCount,   color: "#ef4444"    },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" }}>
              <span className="font-bold text-sm" style={{ color: b.color }}>{b.value}</span>
              <span className="text-xs" style={{ color: BRAND.muted }}>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Client", "Document", "Requested", "Due Date", "Status", ""].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const ss = statusStyle(r.status);
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td className="px-5 py-3.5 font-medium">{r.client}</td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{r.document}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{r.requested}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: r.status === "Overdue" ? "#ef4444" : BRAND.muted }}>{r.due}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{r.status}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {r.status === "Pending" && (
                          <button type="button" onClick={() => setCancelDialog({ open: true, id: r.id })}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: "#ef4444" }} title="Cancel request">
                            <X size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {requests.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No document requests.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <NewRequestSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onCreate={handleCreate} />
      <ConfirmDialog
        open={cancelDialog.open}
        title="Cancel Request"
        description="Are you sure you want to cancel this document request?"
        confirmLabel="Cancel Request"
        variant="danger"
        onConfirm={() => handleCancel(cancelDialog.id)}
        onCancel={() => setCancelDialog({ open: false, id: "" })}
      />
    </div>
  );
}
