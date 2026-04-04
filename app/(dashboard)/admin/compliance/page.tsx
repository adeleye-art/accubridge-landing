"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { useToast } from "@/components/shared/toast";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type ComplianceStatus = "Verified" | "In Progress" | "Unverified";
type DocStatus = "Done" | "Pending" | "None";

interface ComplianceRecord {
  id: string; business: string; owner: string; score: number;
  status: ComplianceStatus; kyc: DocStatus; company: DocStatus;
  last_reviewed: string; staff: string;
}

const MOCK_COMPLIANCE: ComplianceRecord[] = [
  { id: "1", business: "Apex Solutions Ltd",  owner: "Jane Okonkwo",    score: 92, status: "Verified",     kyc: "Done",    company: "Done",    last_reviewed: "1 Apr 2026",  staff: "Mark Chen"    },
  { id: "2", business: "TechBridge NG Ltd",   owner: "Ade Adeyemi",     score: 45, status: "In Progress",  kyc: "Done",    company: "Pending", last_reviewed: "28 Mar 2026", staff: "Unassigned"   },
  { id: "3", business: "Greenfield Ventures", owner: "Sarah Williams",  score: 12, status: "Unverified",   kyc: "None",    company: "None",    last_reviewed: "Never",       staff: "Priya Sharma" },
  { id: "4", business: "Nova Consulting UK",  owner: "Daniel Obi",      score: 78, status: "In Progress",  kyc: "Done",    company: "Done",    last_reviewed: "2 Apr 2026",  staff: "Mark Chen"    },
  { id: "5", business: "Bright Path Ltd",     owner: "Chidi Eze",       score: 65, status: "In Progress",  kyc: "Done",    company: "Pending", last_reviewed: "25 Mar 2026", staff: "Priya Sharma" },
  { id: "6", business: "Lagos First Capital", owner: "Emeka Nwosu",     score: 20, status: "Unverified",   kyc: "Pending", company: "None",    last_reviewed: "Never",       staff: "Unassigned"   },
];

const STATUS_TABS: (ComplianceStatus | "All")[] = ["All", "Verified", "In Progress", "Unverified"];

function scoreColor(score: number) {
  if (score >= 70) return "#06D6A0";
  if (score >= 40) return "#D4AF37";
  return "#ef4444";
}

function statusStyle(status: ComplianceStatus) {
  switch (status) {
    case "Verified":    return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"   };
    case "In Progress": return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)"  };
    case "Unverified":  return { color: "#ef4444", bg: "rgba(239,68,68,0.1)"   };
  }
}

function docBadge(s: DocStatus) {
  switch (s) {
    case "Done":    return { label: "Done",    color: "#06D6A0", bg: "rgba(6,214,160,0.1)"   };
    case "Pending": return { label: "Pending", color: "#D4AF37", bg: "rgba(212,175,55,0.1)"  };
    case "None":    return { label: "None",    color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
  }
}

// ─── Override Score Sheet ─────────────────────────────────────────────────────
function OverrideScoreSheet({ open, business, currentScore, onClose, onSave }: {
  open: boolean; business: string; currentScore: number; onClose: () => void; onSave: (score: number) => void;
}) {
  const [score, setScore] = useState(currentScore);
  return (
    <SystemSheet open={open} title="Override Compliance Score" description={`Manually set the compliance score for ${business}`} onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={() => onSave(score)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Save Score</button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>New Score (0–100)</label>
          <input type="number" min={0} max={100} value={score} onChange={(e) => setScore(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }} />
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: BRAND.muted }}>
          <span>Current score:</span>
          <span style={{ color: scoreColor(currentScore), fontWeight: 700 }}>{currentScore}</span>
        </div>
      </div>
    </SystemSheet>
  );
}

// ─── Update Status Sheet ──────────────────────────────────────────────────────
function UpdateStatusSheet({ open, business, currentStatus, onClose, onSave }: {
  open: boolean; business: string; currentStatus: ComplianceStatus; onClose: () => void; onSave: (s: ComplianceStatus) => void;
}) {
  const [status, setStatus] = useState<ComplianceStatus>(currentStatus);
  const options: ComplianceStatus[] = ["Verified", "In Progress", "Unverified"];
  return (
    <SystemSheet open={open} title="Update Compliance Status" description={`Change the compliance status for ${business}`} onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={() => onSave(status)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Update Status</button>
        </div>
      }
    >
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Compliance Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as ComplianceStatus)} className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }}>
          {options.map((o) => <option key={o} value={o} style={{ background: "#0A2463" }}>{o}</option>)}
        </select>
      </div>
    </SystemSheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminCompliancePage() {
  const [records, setRecords] = useState(MOCK_COMPLIANCE);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ComplianceStatus | "All">("All");
  const [overrideSheet, setOverrideSheet] = useState<{ open: boolean; id: string; business: string; score: number }>({ open: false, id: "", business: "", score: 0 });
  const [statusSheet, setStatusSheet] = useState<{ open: boolean; id: string; business: string; status: ComplianceStatus }>({ open: false, id: "", business: "", status: "In Progress" });
  const { toast } = useToast();

  const filtered = useMemo(() =>
    records.filter((r) => {
      const matchTab = activeTab === "All" || r.status === activeTab;
      const matchSearch = r.business.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    }), [records, search, activeTab]);

  const verified     = records.filter((r) => r.status === "Verified").length;
  const inProgress   = records.filter((r) => r.status === "In Progress").length;
  const unverified   = records.filter((r) => r.status === "Unverified").length;
  const avgScore     = records.length ? Math.round(records.reduce((a, r) => a + r.score, 0) / records.length) : 0;

  const handleOverride = (score: number) => {
    setRecords((prev) => prev.map((r) => r.id === overrideSheet.id ? { ...r, score } : r));
    toast({ title: "Compliance score updated", variant: "success" });
    setOverrideSheet({ open: false, id: "", business: "", score: 0 });
  };

  const handleStatusUpdate = (status: ComplianceStatus) => {
    setRecords((prev) => prev.map((r) => r.id === statusSheet.id ? { ...r, status } : r));
    toast({ title: "Compliance status updated", variant: "success" });
    setStatusSheet({ open: false, id: "", business: "", status: "In Progress" });
  };

  const handleApproveDoc = (id: string) => {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, kyc: "Done" as DocStatus, company: "Done" as DocStatus } : r));
    toast({ title: "Documents approved", variant: "success" });
  };

  const thStyle = "px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide";

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Monitor compliance health across all registered businesses.</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Verified",    value: verified,   color: "#06D6A0" },
            { label: "In Progress", value: inProgress, color: "#D4AF37" },
            { label: "Unverified",  value: unverified, color: "#ef4444" },
            { label: "Avg Score",   value: avgScore,   color: BRAND.accent },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: BRAND.muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border max-w-xs flex-1" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color: BRAND.muted }} />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] flex-1" />
          </div>
          <div className="flex gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{ backgroundColor: activeTab === tab ? BRAND.gold : "rgba(255,255,255,0.06)", color: activeTab === tab ? BRAND.primary : "rgba(255,255,255,0.6)" }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Business", "Owner", "Score", "Status", "KYC", "Company", "Last Reviewed", "Staff", "Actions"].map((h) => (
                    <th key={h} className={thStyle} style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const ss = statusStyle(r.status);
                  const kyc = docBadge(r.kyc);
                  const co = docBadge(r.company);
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td className="px-4 py-3.5 font-medium">{r.business}</td>
                      <td className="px-4 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{r.owner}</td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: scoreColor(r.score) }}>{r.score}</td>
                      <td className="px-4 py-3.5"><span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{r.status}</span></td>
                      <td className="px-4 py-3.5"><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: kyc.color, backgroundColor: kyc.bg }}>{kyc.label}</span></td>
                      <td className="px-4 py-3.5"><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: co.color, backgroundColor: co.bg }}>{co.label}</span></td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: BRAND.muted }}>{r.last_reviewed}</td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: r.staff === "Unassigned" ? BRAND.muted : "rgba(255,255,255,0.7)" }}>{r.staff}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <PermissionGuard permission="override_compliance_score">
                            <button type="button" onClick={() => setOverrideSheet({ open: true, id: r.id, business: r.business, score: r.score })}
                              className="px-2 py-1 rounded-lg text-xs font-medium border transition-colors hover:bg-white/10"
                              style={{ borderColor: `${BRAND.gold}40`, color: BRAND.gold }}>
                              Score
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="approve_documents">
                            <button type="button" onClick={() => handleApproveDoc(r.id)}
                              className="px-2 py-1 rounded-lg text-xs font-medium border transition-colors hover:bg-green-500/10"
                              style={{ borderColor: "rgba(6,214,160,0.3)", color: "#06D6A0" }}>
                              Docs
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission="update_compliance_status">
                            <button type="button" onClick={() => setStatusSheet({ open: true, id: r.id, business: r.business, status: r.status })}
                              className="px-2 py-1 rounded-lg text-xs font-medium border transition-colors hover:bg-white/10"
                              style={{ borderColor: `${BRAND.accent}40`, color: BRAND.accent }}>
                              Status
                            </button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No records match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <OverrideScoreSheet open={overrideSheet.open} business={overrideSheet.business} currentScore={overrideSheet.score} onClose={() => setOverrideSheet({ open: false, id: "", business: "", score: 0 })} onSave={handleOverride} />
      <UpdateStatusSheet open={statusSheet.open} business={statusSheet.business} currentStatus={statusSheet.status} onClose={() => setStatusSheet({ open: false, id: "", business: "", status: "In Progress" })} onSave={handleStatusUpdate} />
    </div>
  );
}
