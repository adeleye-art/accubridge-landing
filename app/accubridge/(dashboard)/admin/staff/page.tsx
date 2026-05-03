"use client";

import React, { useState } from "react";
import { UserPlus, PowerOff, Trash2, Power } from "lucide-react";
import { PermissionGuard } from "@/components/accubridge/auth/permission-guard";
import { SystemSheet } from "@/components/accubridge/shared/system-sheet";
import { ConfirmDialog } from "@/components/accubridge/shared/confirm-dialog";
import { useToast } from "@/components/accubridge/shared/toast";
import {
  useGetStaffQuery,
  useCreateStaffMutation,
  useToggleStaffStatusMutation,
  useDeleteStaffMutation,
} from "@/lib/accubridge/api/staffApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ""}`} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />;
}

// ─── Create Staff Sheet ───────────────────────────────────────────────────────
function CreateStaffSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", lastname: "", email: "", password: "", phoneNo: "", country: "" });
  const [createStaff, { isLoading }] = useCreateStaffMutation();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!form.name || !form.lastname || !form.email || !form.password) return;
    try {
      await createStaff({
        name: form.name,
        lastname: form.lastname,
        email: form.email,
        password: form.password,
        phoneNo: form.phoneNo || undefined,
        country: form.country || undefined,
      }).unwrap();
      toast({ title: `Staff account created for ${form.name} ${form.lastname}`, variant: "success" });
      setForm({ name: "", lastname: "", email: "", password: "", phoneNo: "", country: "" });
      onClose();
    } catch {
      toast({ title: "Failed to create staff account", variant: "error" });
    }
  };

  const inputStyle = { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)", color: "white" };
  const labelStyle = { color: "rgba(255,255,255,0.7)" };

  return (
    <SystemSheet open={open} title="Add Staff Member" description="Create a new accountant account on the platform" onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={isLoading} className="px-5 py-2 rounded-xl text-sm font-bold transition-opacity" style={{ backgroundColor: BRAND.gold, color: BRAND.primary, opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? "Creating…" : "Create Account"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {[
          { label: "First Name",         key: "name",     type: "text",     placeholder: "e.g. John"             },
          { label: "Last Name",          key: "lastname", type: "text",     placeholder: "e.g. Smith"            },
          { label: "Email Address",      key: "email",    type: "email",    placeholder: "john@accubridge.com"   },
          { label: "Temporary Password", key: "password", type: "password", placeholder: "••••••••"              },
          { label: "Phone (optional)",   key: "phoneNo",  type: "text",     placeholder: "+1234567890"           },
          { label: "Country (optional)", key: "country",  type: "text",     placeholder: "e.g. US"               },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-2" style={labelStyle}>{label}</label>
            <input type={type} placeholder={placeholder} value={form[key as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none placeholder-[#6B7280]"
              style={inputStyle} />
          </div>
        ))}
      </div>
    </SystemSheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminStaffPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number; name: string }>({ open: false, id: 0, name: "" });
  const { toast } = useToast();

  const { data, isLoading } = useGetStaffQuery({ pageSize: 100 });
  const [toggleStatus, { isLoading: toggling }] = useToggleStaffStatusMutation();
  const [deleteStaff, { isLoading: deleting }] = useDeleteStaffMutation();

  const staff = data?.staff ?? [];
  const totalActive = staff.filter((s) => s.isActive).length;
  const avgClients = staff.length ? Math.round(staff.reduce((a, s) => a + (s.assignedClientsCount ?? 0), 0) / staff.length) : 0;

  const handleToggle = async (id: number, isActive: boolean, name: string) => {
    try {
      await toggleStatus(id).unwrap();
      toast({ title: `${name} ${isActive ? "deactivated" : "activated"}`, variant: "success" });
    } catch {
      toast({ title: "Failed to update status", variant: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStaff(deleteDialog.id).unwrap();
      toast({ title: "Staff account removed", variant: "success" });
      setDeleteDialog({ open: false, id: 0, name: "" });
    } catch {
      toast({ title: "Failed to remove staff", variant: "error" });
    }
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
            { label: "Total Staff",          value: isLoading ? "—" : staff.length,  color: BRAND.accent },
            { label: "Active",               value: isLoading ? "—" : totalActive,   color: "#06D6A0"    },
            { label: "Avg Clients / Member", value: isLoading ? "—" : avgClients,    color: BRAND.gold   },
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
                  {["Name", "Role", "Clients Assigned", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        {Array.from({ length: 5 }).map((__, j) => (
                          <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : staff.map((s) => (
                      <tr key={s.id} className="transition-colors duration-150 hover:bg-white/[0.02]" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className="px-5 py-3.5">
                          <div className="font-medium">{s.fullName}</div>
                          <div className="text-xs" style={{ color: BRAND.muted }}>{s.email}</div>
                        </td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{s.role}</td>
                        <td className="px-5 py-3.5 font-bold" style={{ color: BRAND.accent }}>{s.assignedClientsCount ?? 0}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                            color: s.isActive ? "#06D6A0" : "#6B7280",
                            backgroundColor: s.isActive ? "rgba(6,214,160,0.1)" : "rgba(107,114,128,0.1)",
                          }}>{s.isActive ? "Active" : "Inactive"}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <PermissionGuard permission="manage_staff">
                            <div className="flex items-center gap-1.5">
                              <button type="button" onClick={() => handleToggle(s.id, s.isActive, s.fullName)} disabled={toggling}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                style={{ color: s.isActive ? "#D4AF37" : "#06D6A0" }}
                                title={s.isActive ? "Deactivate" : "Activate"}>
                                {s.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                              </button>
                              <button type="button" onClick={() => setDeleteDialog({ open: true, id: s.id, name: s.fullName })}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: "#ef4444" }} title="Remove staff">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </PermissionGuard>
                        </td>
                      </tr>
                    ))
                }
                {!isLoading && staff.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No staff members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <CreateStaffSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <ConfirmDialog
        open={deleteDialog.open}
        title="Remove Staff Member"
        description={`Are you sure you want to remove "${deleteDialog.name}"? This cannot be undone.`}
        confirmLabel={deleting ? "Removing…" : "Remove"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: 0, name: "" })}
      />
    </div>
  );
}
