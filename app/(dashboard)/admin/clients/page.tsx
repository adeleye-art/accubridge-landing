"use client";

import React, { useState, useMemo } from "react";
import { Pencil, Link2, PauseCircle, PlayCircle, Trash2, Search } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

// ─── Mock data ────────────────────────────────────────────────────────────────
type ClientStatus = "Active" | "Pending" | "Suspended";
interface Client {
  id: string; business: string; owner: string; email: string;
  staff: string; status: ClientStatus; score: number; joined: string; country: string;
}

const MOCK_CLIENTS: Client[] = [
  { id: "1", business: "Apex Solutions Ltd",   owner: "Jane Okonkwo",    email: "jane@apex.co.uk",      staff: "Mark Chen",    status: "Active",    score: 92, joined: "10 Jan 2026", country: "UK"     },
  { id: "2", business: "TechBridge NG Ltd",    owner: "Ade Adeyemi",     email: "ade@techbridge.ng",    staff: "Unassigned",   status: "Pending",   score: 45, joined: "15 Jan 2026", country: "Nigeria" },
  { id: "3", business: "Greenfield Ventures",  owner: "Sarah Williams",  email: "s@greenfield.co.uk",   staff: "Priya Sharma", status: "Suspended", score: 12, joined: "5 Feb 2026",  country: "UK"     },
  { id: "4", business: "Nova Consulting UK",   owner: "Daniel Obi",      email: "d@nova.co.uk",         staff: "Mark Chen",    status: "Active",    score: 78, joined: "20 Feb 2026", country: "UK"     },
  { id: "5", business: "Bright Path Ltd",      owner: "Chidi Eze",       email: "c@brightpath.co.uk",   staff: "Priya Sharma", status: "Active",    score: 65, joined: "1 Mar 2026",  country: "UK"     },
  { id: "6", business: "Lagos First Capital",  owner: "Emeka Nwosu",     email: "e@lagosfirst.ng",      staff: "Unassigned",   status: "Pending",   score: 30, joined: "10 Mar 2026", country: "Nigeria" },
];

const STAFF_LIST = ["Mark Chen", "Priya Sharma", "Tom Walsh"];
const STATUS_TABS: (ClientStatus | "All")[] = ["All", "Active", "Pending", "Suspended"];

const COUNTRY_FLAG: Record<string, string> = { UK: "🇬🇧", Nigeria: "🇳🇬" };

function statusStyle(status: ClientStatus) {
  switch (status) {
    case "Active":    return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"   };
    case "Pending":   return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)"  };
    case "Suspended": return { color: "#ef4444", bg: "rgba(239,68,68,0.1)"   };
  }
}

function scoreColor(score: number) {
  if (score >= 70) return "#06D6A0";
  if (score >= 40) return "#D4AF37";
  return "#ef4444";
}

// ─── Assign Staff Sheet ───────────────────────────────────────────────────────
function AssignStaffSheet({ open, clientName, onClose }: { open: boolean; clientName: string; onClose: () => void }) {
  const [selected, setSelected] = useState(STAFF_LIST[0]);
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: `Assigned ${selected} to ${clientName}`, variant: "success" });
    onClose();
  };

  return (
    <SystemSheet open={open} title="Assign Staff Member" description={`Assign an accountant to ${clientName}`} onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSave} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Save Assignment</button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Select Staff Member</label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full bg-transparent border rounded-xl px-3 py-2.5 text-white text-sm outline-none" style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.05)" }}>
            {STAFF_LIST.map((s) => <option key={s} value={s} style={{ background: "#0A2463" }}>{s}</option>)}
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
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [assignSheet, setAssignSheet] = useState<{ open: boolean; clientId: string; clientName: string }>({ open: false, clientId: "", clientName: "" });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; clientId: string; clientName: string }>({ open: false, clientId: "", clientName: "" });
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchTab = activeTab === "All" || c.status === activeTab;
      const matchSearch = c.business.toLowerCase().includes(search.toLowerCase()) || c.owner.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [clients, search, activeTab]);

  const toggleSuspend = (id: string) => {
    setClients((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: c.status === "Suspended" ? "Active" : "Suspended" as ClientStatus } : c)
    );
    const client = clients.find((c) => c.id === id);
    toast({ title: `${client?.business} ${client?.status === "Suspended" ? "activated" : "suspended"}`, variant: "success" });
  };

  const handleDelete = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Client deleted", variant: "success" });
    setDeleteDialog({ open: false, clientId: "", clientName: "" });
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
            <h1 className="text-2xl font-bold tracking-tight">All Clients</h1>
            <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>View, manage, and assign staff to client accounts.</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 max-w-xs" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color: BRAND.muted }} />
            <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] flex-1" />
          </div>
          <div className="flex gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: activeTab === tab ? BRAND.gold : "rgba(255,255,255,0.06)",
                  color: activeTab === tab ? BRAND.primary : "rgba(255,255,255,0.6)",
                }}>
                {tab}
              </button>
            ))}
          </div>
          <span className="text-xs ml-auto" style={{ color: BRAND.muted }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
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
                {filtered.map((c) => {
                  const ss = statusStyle(c.status);
                  return (
                    <tr key={c.id} className="transition-colors duration-150 hover:bg-white/[0.02]" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td className="px-5 py-3.5">
                        <div className="font-medium">{COUNTRY_FLAG[c.country]} {c.business}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium">{c.owner}</div>
                        <div className="text-xs" style={{ color: BRAND.muted }}>{c.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: c.staff === "Unassigned" ? BRAND.muted : "rgba(255,255,255,0.8)" }}>{c.staff}</td>
                      <td className="px-5 py-3.5 font-bold" style={{ color: scoreColor(c.score) }}>{c.score}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{c.joined}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <PermissionGuard permission="edit_client_profile">
                            <button type="button" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: BRAND.muted }} title="Edit client">
                              <Pencil size={14} />
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="assign_staff">
                            <button type="button" onClick={() => setAssignSheet({ open: true, clientId: c.id, clientName: c.business })}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: BRAND.accent }} title="Assign staff">
                              <Link2 size={14} />
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="suspend_client">
                            <button type="button" onClick={() => toggleSuspend(c.id)}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: c.status === "Suspended" ? "#06D6A0" : "#D4AF37" }} title={c.status === "Suspended" ? "Activate" : "Suspend"}>
                              {c.status === "Suspended" ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="delete_client">
                            <button type="button" onClick={() => setDeleteDialog({ open: true, clientId: c.id, clientName: c.business })}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: "#ef4444" }} title="Delete client">
                              <Trash2 size={14} />
                            </button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No clients match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Sheets & dialogs */}
      <AssignStaffSheet open={assignSheet.open} clientName={assignSheet.clientName} onClose={() => setAssignSheet({ open: false, clientId: "", clientName: "" })} />
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Client"
        description={`Are you sure you want to delete "${deleteDialog.clientName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => handleDelete(deleteDialog.clientId)}
        onCancel={() => setDeleteDialog({ open: false, clientId: "", clientName: "" })}
      />
    </div>
  );
}
