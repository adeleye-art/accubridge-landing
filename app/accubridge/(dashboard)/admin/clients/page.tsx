"use client";

import React, { useState } from "react";
import { Link2, PauseCircle, PlayCircle, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PermissionGuard } from "@/components/accubridge/auth/permission-guard";
import { SystemSheet } from "@/components/accubridge/shared/system-sheet";
import { ConfirmDialog } from "@/components/accubridge/shared/confirm-dialog";
import { useToast } from "@/components/accubridge/shared/toast";
import {
  useGetClientsQuery,
  useToggleClientStatusMutation,
  useDeleteClientMutation,
  useAssignStaffMutation,
  useUnassignStaffMutation,
} from "@/lib/accubridge/api/clientApi";
import { useGetStaffQuery } from "@/lib/accubridge/api/staffApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type ClientStatus = "Active" | "Pending" | "Suspended";
const STATUS_TABS: (ClientStatus | "All")[] = ["All", "Active", "Pending", "Suspended"];
const STATUS_VALUE: Record<ClientStatus | "All", number | undefined> = {
  All: undefined, Active: 1, Pending: 0, Suspended: 2,
};

function statusStyle(status: string) {
  switch (status) {
    case "Active":    return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"  };
    case "Pending":   return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)" };
    case "Suspended": return { color: "#ef4444", bg: "rgba(239,68,68,0.1)"  };
    default:          return { color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
  }
}

function scoreColor(score: number) {
  if (score >= 70) return "#06D6A0";
  if (score >= 40) return "#D4AF37";
  return "#ef4444";
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ""}`} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />;
}

// ─── Assign Staff Sheet ───────────────────────────────────────────────────────
function AssignStaffSheet({
  open, clientId, clientName, currentStaffId, onClose,
}: {
  open: boolean; clientId: number; clientName: string; currentStaffId: number | null; onClose: () => void;
}) {
  const { data: staffData } = useGetStaffQuery({ pageSize: 100 });
  const [assignStaff, { isLoading: assigning }] = useAssignStaffMutation();
  const [unassignStaff, { isLoading: unassigning }] = useUnassignStaffMutation();
  const [selectedId, setSelectedId] = useState<string>(currentStaffId ? String(currentStaffId) : "");
  const { toast } = useToast();
  const busy = assigning || unassigning;

  const handleSave = async () => {
    try {
      if (selectedId) {
        await assignStaff({ clientId, staffId: Number(selectedId) }).unwrap();
        toast({ title: "Staff assigned successfully", variant: "success" });
      } else {
        await unassignStaff(clientId).unwrap();
        toast({ title: "Staff unassigned", variant: "success" });
      }
      onClose();
    } catch {
      toast({ title: "Failed to update staff assignment", variant: "error" });
    }
  };

  return (
    <SystemSheet open={open} title="Assign Staff Member" description={`Assign an accountant to ${clientName}`} onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSave} disabled={busy} className="px-4 py-2 rounded-xl text-sm font-bold transition-opacity" style={{ backgroundColor: BRAND.gold, color: BRAND.primary, opacity: busy ? 0.7 : 1 }}>
            {busy ? "Saving…" : "Save Assignment"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Select Staff Member</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full bg-transparent border rounded-xl px-3 py-2.5 text-white text-sm outline-none" style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.05)" }}>
            <option value="" style={{ background: "#0A2463" }}>Unassigned</option>
            {(staffData?.staff ?? []).map((s) => (
              <option key={s.id} value={String(s.id)} style={{ background: "#0A2463" }}>{s.fullName}</option>
            ))}
          </select>
        </div>
      </div>
    </SystemSheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminClientsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ClientStatus | "All">("All");
  const [page, setPage] = useState(1);
  const [assignSheet, setAssignSheet] = useState<{ open: boolean; clientId: number; clientName: string; currentStaffId: number | null }>({ open: false, clientId: 0, clientName: "", currentStaffId: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; clientId: number; clientName: string }>({ open: false, clientId: 0, clientName: "" });
  const { toast } = useToast();

  const { data, isLoading, isFetching } = useGetClientsQuery({
    search: search || undefined,
    status: STATUS_VALUE[activeTab],
    page,
    pageSize: 20,
  });

  const [toggleStatus, { isLoading: toggling }] = useToggleClientStatusMutation();
  const [deleteClient, { isLoading: deleting }] = useDeleteClientMutation();

  const handleToggle = async (id: number, currentStatus: string) => {
    try {
      await toggleStatus(id).unwrap();
      toast({ title: `Client ${currentStatus === "Suspended" ? "activated" : "suspended"}`, variant: "success" });
    } catch {
      toast({ title: "Failed to update status", variant: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteClient(deleteDialog.clientId).unwrap();
      toast({ title: "Client deleted", variant: "success" });
      setDeleteDialog({ open: false, clientId: 0, clientName: "" });
    } catch {
      toast({ title: "Failed to delete client", variant: "error" });
    }
  };

  const clients = data?.clients ?? [];

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
            <h1 className="text-2xl font-bold tracking-tight">All Clients</h1>
            <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>
              {data?.summary
                ? `${data.summary.totalCount} total · ${data.summary.activeCount} active · ${data.summary.pendingCount} pending · ${data.summary.suspendedCount} suspended`
                : "View, manage, and assign staff to client accounts."}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 max-w-xs" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color: BRAND.muted }} />
            <input type="text" placeholder="Search clients..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] flex-1" />
          </div>
          <div className="flex gap-1.5">
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
          {data && (
            <span className="text-xs ml-auto" style={{ color: BRAND.muted }}>
              {data.totalCount} result{data.totalCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Business", "Owner", "Assigned Staff", "Score", "Status", "Joined", "Actions"].map((h) => (
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
                  : clients.map((c) => {
                      const ss = statusStyle(c.status);
                      return (
                        <tr key={c.id} className="transition-colors duration-150 hover:bg-white/[0.02]" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td className="px-5 py-3.5 font-medium">{c.businessName}</td>
                          <td className="px-5 py-3.5">
                            <div className="font-medium">{c.ownerName}</div>
                            <div className="text-xs" style={{ color: BRAND.muted }}>{c.ownerEmail}</div>
                          </td>
                          <td className="px-5 py-3.5 text-sm" style={{ color: c.assignedStaffName ? "rgba(255,255,255,0.8)" : BRAND.muted }}>
                            {c.assignedStaffName ?? "Unassigned"}
                          </td>
                          <td className="px-5 py-3.5 font-bold" style={{ color: scoreColor(c.score) }}>{c.score}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span>
                          </td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{c.joinedDateFormatted}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <PermissionGuard permission="assign_staff">
                                <button type="button" onClick={() => setAssignSheet({ open: true, clientId: c.id, clientName: c.businessName, currentStaffId: c.assignedStaffId })}
                                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: BRAND.accent }} title="Assign staff">
                                  <Link2 size={14} />
                                </button>
                              </PermissionGuard>
                              <PermissionGuard permission="suspend_client">
                                <button type="button" onClick={() => handleToggle(c.id, c.status)} disabled={toggling}
                                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: c.status === "Suspended" ? "#06D6A0" : "#D4AF37" }} title={c.status === "Suspended" ? "Activate" : "Suspend"}>
                                  {c.status === "Suspended" ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                                </button>
                              </PermissionGuard>
                              <PermissionGuard permission="delete_client">
                                <button type="button" onClick={() => setDeleteDialog({ open: true, clientId: c.id, clientName: c.businessName })}
                                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: "#ef4444" }} title="Delete client">
                                  <Trash2 size={14} />
                                </button>
                              </PermissionGuard>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                }
                {!isLoading && !isFetching && clients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No clients match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="text-xs" style={{ color: BRAND.muted }}>Page {data.page} of {data.totalPages}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((p) => p - 1)} disabled={!data.hasPreviousPage}
                  className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={() => setPage((p) => p + 1)} disabled={!data.hasNextPage}
                  className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Sheets & dialogs */}
      <AssignStaffSheet
        open={assignSheet.open}
        clientId={assignSheet.clientId}
        clientName={assignSheet.clientName}
        currentStaffId={assignSheet.currentStaffId}
        onClose={() => setAssignSheet({ open: false, clientId: 0, clientName: "", currentStaffId: null })}
      />
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Client"
        description={`Are you sure you want to delete "${deleteDialog.clientName}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, clientId: 0, clientName: "" })}
      />
    </div>
  );
}
