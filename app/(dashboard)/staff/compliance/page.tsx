"use client";

import React, { useState } from "react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { useToast } from "@/components/shared/toast";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

interface ComplianceClient {
  id: string; business: string; owner: string; score: number;
  status: string; kyc: string; company: string; last_reviewed: string;
}

const ASSIGNED_COMPLIANCE: ComplianceClient[] = [
  { id: "1", business: "Apex Solutions Ltd", owner: "Jane Okonkwo",   score: 92, status: "Verified",    kyc: "Done",    company: "Done",    last_reviewed: "1 Apr 2026"  },
  { id: "2", business: "Nova Consulting UK", owner: "Daniel Obi",     score: 78, status: "In Progress", kyc: "Done",    company: "Done",    last_reviewed: "2 Apr 2026"  },
  { id: "3", business: "Bright Path Ltd",    owner: "Chidi Eze",      score: 65, status: "In Progress", kyc: "Done",    company: "Pending", last_reviewed: "25 Mar 2026" },
  { id: "4", business: "TechBridge NG Ltd",  owner: "Ade Adeyemi",    score: 45, status: "In Progress", kyc: "Done",    company: "Pending", last_reviewed: "28 Mar 2026" },
  { id: "5", business: "Lagos First Capital",owner: "Emeka Nwosu",    score: 20, status: "Unverified",  kyc: "Pending", company: "None",    last_reviewed: "Never"       },
];

const DOC_OPTIONS = ["Certificate of Incorporation", "Bank Statement (3 months)", "VAT Certificate", "Proof of Address", "ID Document", "Other"];

function scoreColor(s: number) {
  if (s >= 70) return "#06D6A0";
  if (s >= 40) return "#D4AF37";
  return "#ef4444";
}

function statusStyle(status: string) {
  if (status === "Verified")    return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"  };
  if (status === "In Progress") return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)" };
  return { color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
}

function docBadge(s: string) {
  if (s === "Done")    return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"   };
  if (s === "Pending") return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)"  };
  return { color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
}

// ─── SVG score gauge ──────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={scoreColor(score)} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`} strokeDashoffset={circ / 4} />
      <text x="36" y="41" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">{score}</text>
    </svg>
  );
}

// ─── Add Note Sheet ───────────────────────────────────────────────────────────
function AddNoteSheet({ open, business, onClose }: { open: boolean; business: string; onClose: () => void }) {
  const [note, setNote] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!note.trim()) return;
    toast({ title: `Note added for ${business}`, variant: "success" });
    setNote("");
    onClose();
  };

  return (
    <SystemSheet open={open} title="Add Internal Note" description={`Private note for ${business}`} onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSubmit} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Add Note</button>
        </div>
      }
    >
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Note</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Enter your internal note..." rows={5}
          className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none placeholder-[#6B7280]"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }} />
      </div>
    </SystemSheet>
  );
}

// ─── Request Document Sheet ───────────────────────────────────────────────────
function RequestDocSheet({ open, business, onClose }: { open: boolean; business: string; onClose: () => void }) {
  const [docType, setDocType] = useState(DOC_OPTIONS[0]);
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({ title: `Document request sent to ${business}`, variant: "success" });
    onClose();
  };

  return (
    <SystemSheet open={open} title="Request Missing Document" description={`Send a document request to ${business}`} onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSubmit} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Send Request</button>
        </div>
      }
    >
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Document Type</label>
        <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }}>
          {DOC_OPTIONS.map((d) => <option key={d} value={d} style={{ background: "#0A2463" }}>{d}</option>)}
        </select>
      </div>
    </SystemSheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StaffCompliancePage() {
  const [noteSheet, setNoteSheet]   = useState<{ open: boolean; id: string; business: string }>({ open: false, id: "", business: "" });
  const [docSheet, setDocSheet]     = useState<{ open: boolean; id: string; business: string }>({ open: false, id: "", business: "" });

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Review compliance status for your assigned clients.</p>
        </div>

        {/* Read-only info banner */}
        <div className="rounded-xl border px-4 py-3 text-xs" style={{ backgroundColor: `${BRAND.accent}08`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.5)" }}>
          ℹ️ Compliance status and score can only be updated by an admin. Use &quot;Add Note&quot; or &quot;Request Document&quot; to flag items for review.
        </div>

        {/* Client compliance cards */}
        <div className="flex flex-col gap-4">
          {ASSIGNED_COMPLIANCE.map((c) => {
            const ss = statusStyle(c.status);
            const kyc = docBadge(c.kyc);
            const co = docBadge(c.company);
            return (
              <div key={c.id} className="rounded-2xl border p-5" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex flex-col sm:flex-row gap-4">

                  {/* Score ring */}
                  <ScoreRing score={c.score} />

                  {/* Details */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-bold text-base">{c.business}</div>
                        <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>{c.owner}</div>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs" style={{ color: BRAND.muted }}>KYC:</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: kyc.color, backgroundColor: kyc.bg }}>{c.kyc}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs" style={{ color: BRAND.muted }}>Company:</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: co.color, backgroundColor: co.bg }}>{c.company}</span>
                      </div>
                      <div className="text-xs" style={{ color: BRAND.muted }}>Last reviewed: {c.last_reviewed}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <PermissionGuard permission="add_compliance_notes">
                        <button type="button" onClick={() => setNoteSheet({ open: true, id: c.id, business: c.business })}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white/10"
                          style={{ borderColor: `${BRAND.gold}40`, color: BRAND.gold }}>
                          Add Note
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="request_missing_documents">
                        <button type="button" onClick={() => setDocSheet({ open: true, id: c.id, business: c.business })}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white/10"
                          style={{ borderColor: `${BRAND.accent}40`, color: BRAND.accent }}>
                          Request Document
                        </button>
                      </PermissionGuard>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <AddNoteSheet  open={noteSheet.open} business={noteSheet.business} onClose={() => setNoteSheet({ open: false, id: "", business: "" })} />
      <RequestDocSheet open={docSheet.open} business={docSheet.business} onClose={() => setDocSheet({ open: false, id: "", business: "" })} />
    </div>
  );
}
