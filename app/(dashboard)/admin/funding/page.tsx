"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { type SupportedCurrency, formatAmountRaw } from "@/lib/currency";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type FundingStatus = "Pending" | "Confirmed" | "Approved" | "Rejected" | "Under Review";

interface RaffleApp   { id: string; business: string; raffle_id: string; entry_fee: number; currency: SupportedCurrency; submitted: string; status: FundingStatus }
interface ComplianceApp { id: string; business: string; score: number; months_active: number; requested: number; currency: SupportedCurrency; submitted: string; status: FundingStatus }
interface InvestorApp { id: string; business: string; pitch_deck: string; target: number; currency: SupportedCurrency; stage: string; submitted: string; status: FundingStatus }

const INIT_RAFFLE: RaffleApp[] = [
  { id: "r1", business: "Apex Solutions Ltd", raffle_id: "RAF-2026-001", entry_fee: 25,   currency: "GBP", submitted: "10 Mar 2026", status: "Pending"   },
  { id: "r2", business: "Bright Path Ltd",    raffle_id: "RAF-2026-002", entry_fee: 25,   currency: "GBP", submitted: "12 Mar 2026", status: "Confirmed"  },
];
const INIT_COMPLIANCE: ComplianceApp[] = [
  { id: "c1", business: "Nova Consulting UK",  score: 78, months_active: 14, requested: 5000, currency: "GBP", submitted: "1 Apr 2026",  status: "Approved" },
  { id: "c2", business: "Greenfield Ventures", score: 12, months_active: 3,  requested: 2000, currency: "GBP", submitted: "2 Apr 2026",  status: "Pending"  },
];
const INIT_INVESTOR: InvestorApp[] = [
  { id: "i1", business: "TechBridge NG Ltd", pitch_deck: "pitch_v2.pdf", target: 50000, currency: "NGN", stage: "Seed", submitted: "30 Mar 2026", status: "Under Review" },
];

function statusStyle(status: FundingStatus) {
  switch (status) {
    case "Approved":     return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"   };
    case "Pending":      return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)"  };
    case "Rejected":     return { color: "#ef4444", bg: "rgba(239,68,68,0.1)"   };
    case "Under Review": return { color: "#3E92CC", bg: "rgba(62,146,204,0.1)"  };
    case "Confirmed":    return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"   };
    default:             return { color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
  }
}

function scoreColor(score: number) {
  if (score >= 70) return "#06D6A0";
  if (score >= 40) return "#D4AF37";
  return "#ef4444";
}

type TabType = "raffle" | "compliance" | "investor";

// ─── Action buttons ───────────────────────────────────────────────────────────
function ApproveRejectButtons({ id, onApprove, onRejectClick }: { id: string; onApprove: (id: string) => void; onRejectClick: (id: string) => void }) {
  return (
    <PermissionGuard permission="approve_funding">
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onApprove(id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-green-500/20" style={{ color: "#06D6A0" }}>
          <CheckCircle size={13} /> Approve
        </button>
        <button type="button" onClick={() => onRejectClick(id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-red-500/20" style={{ color: "#ef4444" }}>
          <XCircle size={13} /> Reject
        </button>
      </div>
    </PermissionGuard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminFundingPage() {
  const [activeTab, setActiveTab] = useState<TabType>("raffle");
  const [raffle, setRaffle] = useState(INIT_RAFFLE);
  const [compliance, setCompliance] = useState(INIT_COMPLIANCE);
  const [investor, setInvestor] = useState(INIT_INVESTOR);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string; type: TabType }>({ open: false, id: "", type: "raffle" });
  const { toast } = useToast();

  const pendingCount = [...raffle, ...compliance, ...investor].filter((a) => a.status === "Pending" || a.status === "Under Review").length;
  const approvedCount = [...raffle, ...compliance, ...investor].filter((a) => a.status === "Approved" || a.status === "Confirmed").length;

  const updateStatus = (type: TabType, id: string, status: FundingStatus) => {
    if (type === "raffle")     setRaffle((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    if (type === "compliance") setCompliance((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    if (type === "investor")   setInvestor((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  const handleApprove = (id: string) => {
    updateStatus(activeTab, id, "Approved");
    toast({ title: "Application approved", variant: "success" });
  };

  const handleReject = () => {
    updateStatus(rejectDialog.type, rejectDialog.id, "Rejected");
    toast({ title: "Application rejected", variant: "success" });
    setRejectDialog({ open: false, id: "", type: "raffle" });
  };

  const TABS: { id: TabType; label: string }[] = [
    { id: "raffle",     label: "Raffle" },
    { id: "compliance", label: "Compliance Grants" },
    { id: "investor",   label: "Investor Pitch" },
  ];

  const thStyle = "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide";
  const tdStyle = "px-5 py-3.5";

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
          <h1 className="text-2xl font-bold tracking-tight">Funding Queue</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Review and action all funding applications.</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Pending Review",      value: pendingCount,  color: BRAND.gold   },
            { label: "Approved This Month", value: approvedCount, color: "#06D6A0"    },
            { label: "Total Applications",  value: raffle.length + compliance.length + investor.length, color: BRAND.accent },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: BRAND.muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{ backgroundColor: activeTab === tab.id ? BRAND.gold : "rgba(255,255,255,0.06)", color: activeTab === tab.id ? BRAND.primary : "rgba(255,255,255,0.7)" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Raffle table */}
        {activeTab === "raffle" && (
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Business", "Raffle ID", "Entry Fee", "Submitted", "Status", "Actions"].map((h) => (
                      <th key={h} className={thStyle} style={{ color: BRAND.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {raffle.map((a) => {
                    const ss = statusStyle(a.status);
                    return (
                      <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className={tdStyle + " font-medium"}>{a.business}</td>
                        <td className={tdStyle} style={{ color: BRAND.muted }}>{a.raffle_id}</td>
                        <td className={tdStyle}>{formatAmountRaw(a.entry_fee, a.currency)}</td>
                        <td className={tdStyle} style={{ color: BRAND.muted }}>{a.submitted}</td>
                        <td className={tdStyle}><span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{a.status}</span></td>
                        <td className={tdStyle}>
                          {(a.status === "Pending") && (
                            <ApproveRejectButtons id={a.id} onApprove={handleApprove} onRejectClick={(id) => setRejectDialog({ open: true, id, type: "raffle" })} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compliance table */}
        {activeTab === "compliance" && (
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Business", "Score", "Months Active", "Amount Requested", "Submitted", "Status", "Actions"].map((h) => (
                      <th key={h} className={thStyle} style={{ color: BRAND.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compliance.map((a) => {
                    const ss = statusStyle(a.status);
                    return (
                      <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className={tdStyle + " font-medium"}>{a.business}</td>
                        <td className={tdStyle + " font-bold"} style={{ color: scoreColor(a.score) }}>{a.score}</td>
                        <td className={tdStyle} style={{ color: "rgba(255,255,255,0.7)" }}>{a.months_active} months</td>
                        <td className={tdStyle}>{formatAmountRaw(a.requested, a.currency)}</td>
                        <td className={tdStyle} style={{ color: BRAND.muted }}>{a.submitted}</td>
                        <td className={tdStyle}><span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{a.status}</span></td>
                        <td className={tdStyle}>
                          {(a.status === "Pending") && (
                            <ApproveRejectButtons id={a.id} onApprove={handleApprove} onRejectClick={(id) => setRejectDialog({ open: true, id, type: "compliance" })} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Investor table */}
        {activeTab === "investor" && (
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Business", "Pitch Deck", "Target", "Stage", "Submitted", "Status", "Actions"].map((h) => (
                      <th key={h} className={thStyle} style={{ color: BRAND.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {investor.map((a) => {
                    const ss = statusStyle(a.status);
                    return (
                      <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className={tdStyle + " font-medium"}>{a.business}</td>
                        <td className={tdStyle}><span className="text-xs underline" style={{ color: BRAND.accent }}>{a.pitch_deck}</span></td>
                        <td className={tdStyle}>{formatAmountRaw(a.target, a.currency)}</td>
                        <td className={tdStyle}><span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: BRAND.accent, borderColor: `${BRAND.accent}40` }}>{a.stage}</span></td>
                        <td className={tdStyle} style={{ color: BRAND.muted }}>{a.submitted}</td>
                        <td className={tdStyle}><span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{a.status}</span></td>
                        <td className={tdStyle}>
                          {(a.status === "Pending" || a.status === "Under Review") && (
                            <ApproveRejectButtons id={a.id} onApprove={handleApprove} onRejectClick={(id) => setRejectDialog({ open: true, id, type: "investor" })} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      <ConfirmDialog
        open={rejectDialog.open}
        title="Reject Application"
        description="Are you sure you want to reject this funding application?"
        confirmLabel="Reject"
        variant="danger"
        onConfirm={handleReject}
        onCancel={() => setRejectDialog({ open: false, id: "", type: "raffle" })}
      />
    </div>
  );
}
