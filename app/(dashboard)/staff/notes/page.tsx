"use client";

import React, { useState, useEffect } from "react";
import { Pin, Trash2, Plus, Search } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import {
  useGetInternalNotesQuery,
  useCreateInternalNoteMutation,
  useDeleteInternalNoteMutation,
} from "@/lib/api/internalNoteApi";
import { useGetClientsQuery } from "@/lib/api/clientApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ""}`} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />;
}

function AddNoteSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: clientData } = useGetClientsQuery({ pageSize: 100 });
  const clients = clientData?.clients ?? [];

  const [clientId, setClientId]   = useState<number | "">("");
  const [content, setContent]     = useState("");
  const [createNote, { isLoading }] = useCreateInternalNoteMutation();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) { setClientId(""); setContent(""); }
  }, [open]);

  useEffect(() => {
    if (clients.length > 0 && clientId === "") setClientId(clients[0].id);
  }, [clients, clientId]);

  const handleSubmit = async () => {
    if (!content.trim() || clientId === "") {
      toast({ title: "Please select a client and enter a note", variant: "error" });
      return;
    }
    try {
      await createNote({ clientId: clientId as number, note: content.trim() }).unwrap();
      toast({ title: "Note added", variant: "success" });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to add note";
      toast({ title: msg, variant: "error" });
    }
  };

  const inputStyle = { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)", color: "white" };
  const labelStyle = { color: "rgba(255,255,255,0.7)" };

  return (
    <SystemSheet open={open} title="Add Internal Note" description="Add a private note for a client account." onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={isLoading} className="px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-60" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
            {isLoading ? "Saving…" : "Add Note"}
          </button>
        </div>
      }>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Client</label>
          <select value={clientId} onChange={(e) => setClientId(Number(e.target.value))} className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none" style={inputStyle}>
            {clients.map((c) => <option key={c.id} value={c.id} style={{ background: "#0A2463" }}>{c.businessName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Note</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your internal note..." rows={5}
            className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none placeholder-[#6B7280]"
            style={inputStyle} />
        </div>
      </div>
    </SystemSheet>
  );
}

export default function StaffNotesPage() {
  const [sheetOpen, setSheetOpen]       = useState(false);
  const [search, setSearch]             = useState("");
  const [debSearch, setDebSearch]       = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number }>({ open: false, id: 0 });

  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebSearch(val), 300);
  }

  const { data, isLoading, isFetching } = useGetInternalNotesQuery({
    search: debSearch || undefined,
    sortDesc: true,
    pageSize: 50,
  });

  const [deleteNote, { isLoading: deleting }] = useDeleteInternalNoteMutation();
  const { toast } = useToast();

  const notes = data?.notes ?? [];

  const handleDelete = async () => {
    try {
      await deleteNote(deleteDialog.id).unwrap();
      toast({ title: "Note deleted", variant: "success" });
      setDeleteDialog({ open: false, id: 0 });
    } catch {
      toast({ title: "Failed to delete note", variant: "error" });
    }
  };

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

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border max-w-sm" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
          <Search size={14} style={{ color: BRAND.muted }} />
          <input type="text" placeholder="Search notes…" value={search} onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] flex-1" />
        </div>

        {/* Notes list */}
        {isLoading || isFetching ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3" style={{ color: BRAND.muted }}>
            <Pin size={32} />
            <p className="text-sm">No notes yet. Add your first note above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((n) => (
              <div key={n.id} className="rounded-2xl border p-5 flex flex-col gap-3" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-bold" style={{ color: BRAND.accent }}>{n.clientName}</span>
                  <button type="button" onClick={() => setDeleteDialog({ open: true, id: n.id })}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0" style={{ color: "#ef4444" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{n.note}</p>
                <div className="flex items-center gap-3 text-xs" style={{ color: BRAND.muted }}>
                  <span>{n.authorName}</span>
                  <span>·</span>
                  <span>{n.createdAtFormatted}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <AddNoteSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Note"
        description="This note will be permanently deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: 0 })}
        loading={deleting}
      />
    </div>
  );
}
