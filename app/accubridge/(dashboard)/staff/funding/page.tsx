"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { PermissionGuard } from "@/components/accubridge/auth/permission-guard";
import { ConfirmDialog } from "@/components/accubridge/shared/confirm-dialog";
import { useToast } from "@/components/accubridge/shared/toast";
import { formatAmountRaw, type SupportedCurrency } from "@/lib/accubridge/currency";
import {
  useGetFundingApplicationsQuery,
  useReviewFundingApplicationMutation,
  type ApiFundingApplication,
} from "@/lib/accubridge/api/fundingApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type TabType = "raffle" | "compliance" | "investor";
const TAB_TYPE_MAP: Record<TabType, number> = { raffle: 3, compliance: 5, investor: 4 };

function apiStatusToDisplay(status: string): string {
  switch (status) {
    case "Draft":       return "Draft";
    case "Submitted":   return "Pending";
    case "UnderReview": return "Under Review";
    case "Approved":    return "Approved";
    case "Rejected":    return "Rejected";
    case "Completed":   return "Completed";
    default:            return status;
  }
}

function statusStyle(display: string) {
  switch (display) {
    case "Approved":    return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"   };
    case "Pending":     return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)"  };
    case "Rejected":    return { color: "#ef4444", bg: "rgba(239,68,68,0.1)"   };
    case "Under Review":return { color: "#3E92CC", bg: "rgba(62,146,204,0.1)"  };
    default:            return { color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
  }
}

function scoreColor(score: number) {
  if (score >= 70) return "#06D6A0";
  if (score >= 40) return "#D4AF37";
  return "#ef4444";
}

// ─── Action buttons ───────────────────────────────────────────────────────────
function ApproveRejectButtons({
  app,
  onApprove,
  onRejectClick,
}: {
  app: ApiFundingApplication;
  onApprove: (app: ApiFundingApplication) => void;
  onRejectClick: (app: ApiFundingApplication) => void;
}) {
  const display = apiStatusToDisplay(app.status);
  if (display !== "Pending" && display !== "Under Review") return null;
  return (
    <PermissionGuard permission="approve_funding">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onApprove(app)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-green-500/20"
          style={{ color: "#06D6A0" }}
        >
          <CheckCircle size={13} /> Approve
        </button>
        <button
          type="button"
          onClick={() => onRejectClick(app)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-red-500/20"
          style={{ color: "#ef4444" }}
        >
          <XCircle size={13} /> Reject
        </button>
      </div>
    </PermissionGuard>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.08)", width: i === 0 ? "70%" : "50%" }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StaffFundingPage() {
  const [activeTab, setActiveTab] = useState<TabType>("raffle");
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; app: ApiFundingApplication | null }>({ open: false, app: null });
  const { toast } = useToast();

  const { data: raffleData,     isLoading: raffleLoading }     = useGetFundingApplicationsQuery({ type: TAB_TYPE_MAP.raffle,     pageSize: 50 });
  const { data: complianceData, isLoading: complianceLoading } = useGetFundingApplicationsQuery({ type: TAB_TYPE_MAP.compliance, pageSize: 50 });
  const { data: investorData,   isLoading: investorLoading }   = useGetFundingApplicationsQuery({ type: TAB_TYPE_MAP.investor,   pageSize: 50 });
  const [reviewApplication]  = useReviewFundingApplicationMutation();

  const currentData    = activeTab === "raffle" ? raffleData    : activeTab === "compliance" ? complianceData    : investorData;
  const currentLoading = activeTab === "raffle" ? raffleLoading : activeTab === "compliance" ? complianceLoading : investorLoading;

  // Only show non-Draft, non-Cancelled applications
  const visibleApps = (currentData?.applications ?? []).filter(
    (a) => a.status !== "Draft" && a.status !== "Cancelled",
  );

  // Summary from all three datasets
  const allApps = [
    ...(raffleData?.applications ?? []),
    ...(complianceData?.applications ?? []),
    ...(investorData?.applications ?? []),
  ].filter((a) => a.status !== "Draft" && a.status !== "Cancelled");

  const pendingCount     = allApps.filter((a) => a.status === "Submitted" || a.status === "UnderReview").length;
  const approvedCount    = allApps.filter((a) => a.status === "Approved").length;

  const handleApprove = async (app: ApiFundingApplication) => {
    try {
      await reviewApplication({ id: app.id, body: { approve: true, approvedAmount: app.requestedAmount, notes: "" } }).unwrap();
      toast({ title: "Application approved", variant: "success" });
    } catch {
      toast({ title: "Failed to approve application", variant: "error" });
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.app) return;
    try {
      await reviewApplication({ id: rejectDialog.app.id, body: { approve: false, rejectionReason: "Rejected by staff", notes: "" } }).unwrap();
      toast({ title: "Application rejected", variant: "success" });
    } catch {
      toast({ title: "Failed to reject application", variant: "error" });
    } finally {
      setRejectDialog({ open: false, app: null });
    }
  };

  const TABS: { id: TabType; label: string }[] = [
    { id: "raffle",     label: "Raffle" },
    { id: "compliance", label: "Compliance Grants" },
    { id: "investor",   label: "Investor Pitch" },
  ];

  const thStyle = "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide";
  const tdStyle = "px-5 py-3.5";

  const currency: SupportedCurrency = "GBP";

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
          <h1 className="text-2xl font-bold tracking-tight">Funding Review</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Review and action funding applications from your clients.</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Pending Review",      value: pendingCount,  color: BRAND.gold   },
            { label: "Approved",            value: approvedCount, color: "#06D6A0"    },
            { label: "Total Applications",  value: allApps.length, color: BRAND.accent },
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
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === tab.id ? BRAND.gold : "rgba(255,255,255,0.06)",
                color: activeTab === tab.id ? BRAND.primary : "rgba(255,255,255,0.7)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {(activeTab === "raffle"
                    ? ["Business / Purpose", "Amount Requested", "Submitted", "Status", "Actions"]
                    : activeTab === "compliance"
                    ? ["Business / Purpose", "Score", "Amount Requested", "Submitted", "Status", "Actions"]
                    : ["Business / Purpose", "Amount Requested", "Submitted", "Status", "Actions"]
                  ).map((h) => (
                    <th key={h} className={thStyle} style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonRow key={i} cols={activeTab === "compliance" ? 6 : 5} />
                  ))
                ) : visibleApps.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "compliance" ? 6 : 5} className="px-5 py-12 text-center text-sm" style={{ color: BRAND.muted }}>
                      No applications to review
                    </td>
                  </tr>
                ) : (
                  visibleApps.map((app) => {
                    const display = apiStatusToDisplay(app.status);
                    const ss = statusStyle(display);
                    return (
                      <tr key={app.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className={tdStyle + " font-medium max-w-xs"}>
                          <div className="truncate">{app.purpose || `Application #${app.id}`}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: BRAND.muted }}>ID: {app.id}</div>
                        </td>
                        {activeTab === "compliance" && (
                          <td className={tdStyle + " font-bold"} style={{ color: scoreColor(app.requestedAmount > 0 ? 75 : 0) }}>—</td>
                        )}
                        <td className={tdStyle}>{formatAmountRaw(app.requestedAmount, currency)}</td>
                        <td className={tdStyle} style={{ color: BRAND.muted }}>
                          {app.submittedAt
                            ? new Date(app.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
                            : new Date(app.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                        </td>
                        <td className={tdStyle}>
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>
                            {display}
                          </span>
                        </td>
                        <td className={tdStyle}>
                          <ApproveRejectButtons
                            app={app}
                            onApprove={handleApprove}
                            onRejectClick={(a) => setRejectDialog({ open: true, app: a })}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={rejectDialog.open}
        title="Reject Application"
        description="Are you sure you want to reject this funding application? This action cannot be undone."
        confirmLabel="Reject"
        variant="danger"
        onConfirm={handleReject}
        onCancel={() => setRejectDialog({ open: false, app: null })}
      />
    </div>
  );
}
