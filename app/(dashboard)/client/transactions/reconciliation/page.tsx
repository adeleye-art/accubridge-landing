"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ArrowRight,
  FileText,
  BarChart2,
  Lock,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useGetReconciliationsQuery } from "@/lib/api/reconciliationApi";
import type { ReconciliationListItem } from "@/lib/api/reconciliationApi";

const BRAND = {
  primary: "#0A2463",
  gold: "#D4AF37",
  green: "#06D6A0",
  accent: "#3E92CC",
  muted: "#6B7280",
  red: "#ef4444",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map the API status int/label to our 3 display states */
function resolveStatus(item: ReconciliationListItem): "complete" | "in-progress" | "needs-review" {
  const label = item.statusLabel?.toLowerCase() ?? "";
  if (label.includes("complete")) return "complete";
  if (label.includes("review") || label.includes("needs")) return "needs-review";
  return "in-progress";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Status badge ─────────────────────────────────────────────────────────────

type DisplayStatus = "complete" | "in-progress" | "needs-review";

function StatusBadge({ status }: { status: DisplayStatus }) {
  const cfg: Record<DisplayStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    complete:      { label: "Complete",      color: BRAND.green, bg: `${BRAND.green}15`,     border: `${BRAND.green}30`,      icon: <CheckCircle2 size={11} /> },
    "in-progress": { label: "In Progress",   color: BRAND.gold,  bg: `${BRAND.gold}15`,      border: `${BRAND.gold}30`,       icon: <Clock size={11} /> },
    "needs-review":{ label: "Needs Review",  color: BRAND.red,   bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)",  icon: <AlertOctagon size={11} /> },
  };
  const c = cfg[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0"
      style={{ backgroundColor: c.bg, color: c.color, borderColor: c.border }}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

// ─── Match bar ────────────────────────────────────────────────────────────────

function MatchBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "rgba(255,255,255,0.08)", minWidth: "60px" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? BRAND.green : `linear-gradient(to right, ${BRAND.green}, ${BRAND.accent})`,
          }}
        />
      </div>
      <span
        className="text-[11px] font-semibold flex-shrink-0"
        style={{ color: pct === 100 ? BRAND.green : BRAND.muted }}
      >
        {pct}%
      </span>
    </div>
  );
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCards({
  complete,
  inProgress,
  needsReview,
}: {
  complete: number;
  inProgress: number;
  needsReview: number;
}) {
  const cards = [
    { label: "Complete",     value: complete,    color: BRAND.green, bg: `${BRAND.green}15`,     border: `${BRAND.green}20`,     icon: <CheckCircle2 size={18} /> },
    { label: "In Progress",  value: inProgress,  color: BRAND.gold,  bg: `${BRAND.gold}15`,      border: `${BRAND.gold}20`,      icon: <Clock size={18} /> },
    { label: "Needs Review", value: needsReview, color: BRAND.red,   bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.18)", icon: <AlertOctagon size={18} /> },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border p-4 flex items-center gap-4"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` }}
          >
            {c.icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{c.value}</div>
            <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReconciliationHistoryPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetReconciliationsQuery();

  const runs = data?.reconciliations ?? [];
  const summary = data?.summary;

  function openRun(id: number) {
    router.push(`/client/transactions/reconciliation/${id}`);
  }

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-0">

        <PageHeader
          badge="Transactions"
          title="Reconciliation"
          description="Match your bank statements against recorded transactions."
          actions={
            <button
              type="button"
              onClick={() => router.push("/client/transactions/reconciliation/new")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "12px",
                background: BRAND.gold,
                color: BRAND.primary,
                fontWeight: 700,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Plus size={16} />
              New Reconciliation
            </button>
          }
        />

        {/* Summary stats */}
        <SummaryCards
          complete={summary?.complete ?? 0}
          inProgress={summary?.inProgress ?? 0}
          needsReview={summary?.needsReview ?? 0}
        />

        {/* History list */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          {/* List header */}
          <div
            className="grid px-5 py-3 border-b"
            style={{
              gridTemplateColumns: "1fr 130px 130px 120px 36px",
              borderColor: "rgba(255,255,255,0.07)",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            {["Period", "Bank", "Lines", "Status", ""].map((h) => (
              <span
                key={h}
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: BRAND.muted }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 size={20} className="animate-spin" style={{ color: BRAND.muted }} />
              <span className="text-sm" style={{ color: BRAND.muted }}>Loading reconciliations…</span>
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center gap-2 py-16 text-center px-6">
              <AlertOctagon size={24} style={{ color: BRAND.red }} />
              <p className="text-sm" style={{ color: BRAND.muted }}>
                Failed to load reconciliations. Please try again.
              </p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && runs.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <BarChart2 size={24} style={{ color: BRAND.muted }} />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">No reconciliations yet</p>
                <p className="text-sm" style={{ color: BRAND.muted }}>
                  Start your first reconciliation to match your bank statements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/client/transactions/reconciliation/new")}
                style={{
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  background: BRAND.gold,
                  color: BRAND.primary,
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Plus size={16} />
                New Reconciliation
              </button>
            </div>
          )}

          {/* Rows */}
          {!isLoading && !isError && runs.map((run, i) => {
            const displayStatus = resolveStatus(run);
            const borderColor =
              displayStatus === "complete" ? BRAND.green
              : displayStatus === "needs-review" ? BRAND.red
              : BRAND.gold;

            return (
              <button
                key={run.id}
                type="button"
                onClick={() => openRun(run.id)}
                className="w-full text-left transition-colors duration-150 hover:bg-white/[0.025]"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 130px 130px 120px 36px",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderBottom: i < runs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  borderLeft: `3px solid ${borderColor}`,
                }}
              >
                {/* Period + meta */}
                <div className="flex flex-col gap-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: displayStatus === "complete" ? `${BRAND.green}12` : "rgba(255,255,255,0.06)",
                        border: `1px solid ${displayStatus === "complete" ? `${BRAND.green}25` : "rgba(255,255,255,0.09)"}`,
                      }}
                    >
                      {displayStatus === "complete"
                        ? <Lock size={12} style={{ color: BRAND.green }} />
                        : <FileText size={12} style={{ color: BRAND.muted }} />
                      }
                    </div>
                    <span className="font-semibold text-sm text-white truncate">{run.period}</span>
                  </div>
                  <div className="flex items-center gap-2 pl-9">
                    <span className="text-[11px]" style={{ color: BRAND.muted }}>{run.fileName}</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                    <span className="text-[11px]" style={{ color: BRAND.muted }}>{formatDate(run.createdAt)}</span>
                  </div>
                  <div className="pl-9">
                    <MatchBar pct={run.progressPercentage} />
                  </div>
                </div>

                {/* Bank */}
                <span className="text-xs truncate pr-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {run.bankName}
                </span>

                {/* Lines */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">{run.totalLines} lines</span>
                  <span className="text-[11px]" style={{ color: BRAND.muted }}>
                    {run.matchedCount}M · {run.totalLines - run.matchedCount}U
                  </span>
                </div>

                {/* Status */}
                <StatusBadge status={displayStatus} />

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ArrowRight size={14} style={{ color: BRAND.muted }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 px-1">
          {[
            { label: "M = Matched",   color: BRAND.green },
            { label: "U = Unmatched", color: BRAND.gold  },
          ].map((l) => (
            <span key={l.label} className="text-[11px]" style={{ color: l.color }}>
              {l.label}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}
