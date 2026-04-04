"use client";

import React, { useState } from "react";
import { Pin, Trash2, Plus } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { useToast } from "@/components/shared/toast";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const CLIENT_LIST = ["Apex Solutions Ltd", "Nova Consulting UK", "Bright Path Ltd", "TechBridge NG Ltd", "Lagos First Capital"];

interface Note { id: string; client: string; author: string; content: string; created: string; pinned: boolean; }

const INIT_NOTES: Note[] = [
  { id: "n1", client: "Apex Solutions Ltd",  author: "Mark Chen",    content: "Client has uploaded Q1 bank statements. Reconciliation in progress.",          created: "2 Apr 2026 10:30", pinned: true  },
  { id: "n2", client: "Bright Path Ltd",     author: "Mark Chen",    content: "Missing VAT certificate — sent document request on 1 Apr.",                   created: "1 Apr 2026 15:20", pinned: false },
  { id: "n3", client: "Nova Consulting UK",  author: "Priya Sharma", content: "Compliance score updated after KYC completion. Passport now eligible.",       created: "30 Mar 2026 09:45", pinned: false },
];

function AddNoteSheet({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (n: Omit<Note, "id">) => void }) {
  const [client, setClient] = useState(CLIENT_LIST[0]);
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!content.trim()) return;
    onAdd({ client, author: "Mark Chen", content, created: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), pinned: false });
    toast({ title: "Note added", variant: "success" });
    setContent("");
    onClose();
  };

  return (
    <SystemSheet open={open} title="Add Internal Note" onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSubmit} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Add Note</button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Client</label>
          <select value={client} onChange={(e) => setClient(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }}>
            {CLIENT_LIST.map((c) => <option key={c} value={c} style={{ background: "#0A2463" }}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Note</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your internal note..." rows={5}
            className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none placeholder-[#6B7280]"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
    </SystemSheet>
  );
}

export default function StaffNotesPage() {
  const [notes, setNotes] = useState(INIT_NOTES);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleAdd = (n: Omit<Note, "id">) => {
    setNotes((prev) => [{ ...n, id: `n${Date.now()}` }, ...prev]);
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
            <h1 className="text-2xl font-bold tracking-tight">Internal Notes</h1>
            <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Private notes for your assigned client accounts.</p>
          </div>
          <PermissionGuard permission="add_internal_notes">
            <button type="button" onClick={() => setSheetOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
              <Plus size={16} /> Add Note
            </button>
          </PermissionGuard>
        </div>

        {/* Notes list */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3" style={{ color: BRAND.muted }}>
            <Pin size={32} />
            <p className="text-sm">No notes yet. Add your first note above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((n) => (
              <div key={n.id} className="rounded-2xl border p-5 flex flex-col gap-3" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: n.pinned ? `${BRAND.gold}30` : "rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {n.pinned && <Pin size={12} style={{ color: BRAND.gold }} />}
                    <span className="text-sm font-bold" style={{ color: BRAND.accent }}>{n.client}</span>
                  </div>
                  <button type="button" onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0" style={{ color: "#ef4444" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{n.content}</p>
                <div className="flex items-center gap-3 text-xs" style={{ color: BRAND.muted }}>
                  <span>{n.author}</span>
                  <span>·</span>
                  <span>{n.created}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <AddNoteSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
