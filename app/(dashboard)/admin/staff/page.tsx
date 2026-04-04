"use client";

import React, { useState } from "react";
import { UserPlus, PowerOff, Trash2, Power } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type StaffStatus = "Active" | "Inactive";
interface StaffMember {
  id: string; name: string; email: string; role: string;
  clients: number; status: StaffStatus; joined: string;
}

const INITIAL_STAFF: StaffMember[] = [
  { id: "s1", name: "Mark Chen",    email: "mark@accubridge.com",  role: "Senior Accountant",  clients: 38, status: "Active",   joined: "1 Oct 2025"  },
  { id: "s2", name: "Priya Sharma", email: "priya@accubridge.com", role: "Accountant",          clients: 22, status: "Active",   joined: "5 Nov 2025"  },
  { id: "s3", name: "Tom Walsh",    email: "tom@accubridge.com",   role: "Junior Accountant",   clients: 0,  status: "Inactive", joined: "1 Feb 2026"  },
];

const ROLE_OPTIONS = ["Senior Accountant", "Accountant", "Junior Accountant"];

// ─── Create Staff Sheet ───────────────────────────────────────────────────────
function CreateStaffSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (member: Omit<StaffMember, "id" | "clients" | "joined">) => void }) {
  const [form, setForm] = useState({ name: "", email: "", role: ROLE_OPTIONS[1], password: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onCreate({ name: form.name, email: form.email, role: form.role, status: "Active" });
      toast({ title: `Staff account created for ${form.name}`, variant: "success" });
      setForm({ name: "", email: "", role: ROLE_OPTIONS[1], password: "" });
      onClose();
    }, 1000);
  };

  const inputStyle = { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)", color: "white" };
  const labelStyle = { color: "rgba(255,255,255,0.7)" };

  return (
    <SystemSheet open={open} title="Add Staff Member" description="Create a new accountant account on the platform" onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="px-5 py-2 rounded-xl text-sm font-bold transition-opacity" style={{ backgroundColor: BRAND.gold, color: BRAND.primary, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {[
          { label: "Full Name", key: "name", type: "text", placeholder: "e.g. John Smith" },
          { label: "Email Address", key: "email", type: "email", placeholder: "john@accubridge.com" },
          { label: "Temporary Password", key: "password", type: "password", placeholder: "••••••••" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-2" style={labelStyle}>{label}</label>
            <input type={type} placeholder={placeholder} value={form[key as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none placeholder-[#6B7280]"
              style={inputStyle} />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Role</label>
          <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r} style={{ background: "#0A2463" }}>{r}</option>)}
          </select>
        </div>
      </div>
    </SystemSheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminStaffPage() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });
  const { toast } = useToast();

  const totalActive = staff.filter((s) => s.status === "Active").length;
  const avgClients = staff.length ? Math.round(staff.reduce((a, s) => a + s.clients, 0) / staff.length) : 0;

  const toggleStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" as StaffStatus } : s)
    );
    const member = staff.find((s) => s.id === id);
    toast({ title: `${member?.name} ${member?.status === "Active" ? "deactivated" : "activated"}`, variant: "success" });
  };

  const handleDelete = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Staff account removed", variant: "success" });
    setDeleteDialog({ open: false, id: "", name: "" });
  };

  const handleCreate = (data: Omit<StaffMember, "id" | "clients" | "joined">) => {
    const newMember: StaffMember = { ...data, id: `s${Date.now()}`, clients: 0, joined: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) };
    setStaff((prev) => [newMember, ...prev]);
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
            <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Manage your team of accountants and their client assignments.</p>
          </div>
          <PermissionGuard permission="manage_staff">
            <button type="button" onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
              <UserPlus size={16} /> Add Staff Member
            </button>
          </PermissionGuard>
        </div>

        {/* Summary badges */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total Staff",          value: staff.length,  color: BRAND.accent },
            { label: "Active",               value: totalActive,   color: "#06D6A0"    },
            { label: "Avg Clients / Member", value: avgClients,    color: BRAND.gold   },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" }}>
              <span className="font-bold text-sm" style={{ color: badge.color }}>{badge.value}</span>
              <span className="text-xs" style={{ color: BRAND.muted }}>{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Staff table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Name", "Role", "Clients Assigned", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="transition-colors duration-150 hover:bg-white/[0.02]" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs" style={{ color: BRAND.muted }}>{s.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{s.role}</td>
                    <td className="px-5 py-3.5 font-bold" style={{ color: BRAND.accent }}>{s.clients}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                        color: s.status === "Active" ? "#06D6A0" : "#6B7280",
                        backgroundColor: s.status === "Active" ? "rgba(6,214,160,0.1)" : "rgba(107,114,128,0.1)",
                      }}>{s.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{s.joined}</td>
                    <td className="px-5 py-3.5">
                      <PermissionGuard permission="manage_staff">
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => toggleStatus(s.id)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            style={{ color: s.status === "Active" ? "#D4AF37" : "#06D6A0" }}
                            title={s.status === "Active" ? "Deactivate" : "Activate"}>
                            {s.status === "Active" ? <PowerOff size={14} /> : <Power size={14} />}
                          </button>
                          <button type="button" onClick={() => setDeleteDialog({ open: true, id: s.id, name: s.name })}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: "#ef4444" }} title="Remove staff">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </PermissionGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <CreateStaffSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onCreate={handleCreate} />
      <ConfirmDialog
        open={deleteDialog.open}
        title="Remove Staff Member"
        description={`Are you sure you want to remove "${deleteDialog.name}"? This cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => handleDelete(deleteDialog.id)}
        onCancel={() => setDeleteDialog({ open: false, id: "", name: "" })}
      />
    </div>
  );
}
