"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280", red: "#ef4444" };

// ─── Types ────────────────────────────────────────────────────────────────────

type ReconcileStatus = "complete" | "in-progress" | "pending";

interface ReconciliationRun {
  id: string;
  period: string;          // e.g. "March 2026"
  uploadedAt: string;      // display date
  bank: string;            // bank name
  fileName: string;
  totalLines: number;
  matched: number;
  unmatched: number;
  flagged: number;
  totalAmount: number;     // total £ across all lines
  status: ReconcileStatus;
}

// ─── Mock history ─────────────────────────────────────────────────────────────

const MOCK_RUNS: ReconciliationRun[] = [
  {
    id: "r1",
    period: "March 2026",
    uploadedAt: "28 Mar 2026",
    bank: "Barclays Business",
    fileName: "march_2026_barclays.csv",
    totalLines: 12,
    matched: 10,
    unmatched: 0,
    flagged: 2,
    totalAmount: 18878.99,
    status: "in-progress",
  },
  {
    id: "r2",
    period: "February 2026",
    uploadedAt: "02 Mar 2026",
    bank: "Barclays Business",
    fileName: "feb_2026_barclays.csv",
    totalLines: 9,
    matched: 9,
    unmatched: 0,
    flagged: 0,
    totalAmount: 14320.00,
    status: "complete",
  },
  {
    id: "r3",
    period: "January 2026",
    uploadedAt: "01 Feb 2026",
    bank: "HSBC UK",
    fileName: "jan_2026_hsbc.csv",
    totalLines: 11,
    matched: 11,
    unmatched: 0,
    flagged: 0,
    totalAmount: 22150.50,
    status: "complete",
  },
  {
    id: "r4",
    period: "December 2025",
    uploadedAt: "03 Jan 2026",
    bank: "HSBC UK",
    fileName: "dec_2025_hsbc.csv",
    totalLines: 14,
    matched: 14,
    unmatched: 0,
    flagged: 0,
    totalAmount: 31400.00,
    status: "complete",
  },
  {
    id: "r5",
    period: "November 2025",
    uploadedAt: "01 Dec 2025",
    bank: "Barclays Business",
    fileName: "nov_2025_barclays.csv",
    totalLines: 8,
    matched: 6,
    unmatched: 1,
    flagged: 1,
    totalAmount: 9870.00,
    status: "pending",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtAmount(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 }).format(n);
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReconcileStatus }) {
  const cfg = {
    complete:    { label: "Complete",    color: BRAND.green, bg: `${BRAND.green}15`,    border: `${BRAND.green}30`,    icon: <CheckCircle2 size={11} /> },
    "in-progress":{ label: "In Progress", color: BRAND.gold,  bg: `${BRAND.gold}15`,    border: `${BRAND.gold}30`,     icon: <Clock size={11} /> },
    pending:     { label: "Pending",     color: BRAND.red,   bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", icon: <AlertOctagon size={11} /> },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0"
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Mini match bar ───────────────────────────────────────────────────────────

function MatchBar({ matched, total }: { matched: number; total: number }) {
  const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
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
      <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: pct === 100 ? BRAND.green : BRAND.muted }}>
        {pct}%
      </span>
    </div>
  );
}

// ─── Summary stats (top of page) ──────────────────────────────────────────────

function SummaryStats({ runs }: { runs: ReconciliationRun[] }) {
  const complete   = runs.filter((r) => r.status === "complete").length;
  const inProgress = runs.filter((r) => r.status === "in-progress").length;
  const pending    = runs.filter((r) => r.status === "pending").length;

  const cards = [
    { label: "Complete",     value: complete,   color: BRAND.green, bg: `${BRAND.green}15`,     border: `${BRAND.green}20`,     icon: <CheckCircle2 size={18} /> },
    { label: "In Progress",  value: inProgress, color: BRAND.gold,  bg: `${BRAND.gold}15`,      border: `${BRAND.gold}20`,      icon: <Clock size={18} /> },
    { label: "Needs Review", value: pending,    color: BRAND.red,   bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.18)", icon: <AlertOctagon size={18} /> },
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
  const [runs] = useState<ReconciliationRun[]>(MOCK_RUNS);

  function openRun(run: ReconciliationRun) {
    // In production: router.push(`/client/transactions/reconciliation/${run.id}`)
    // For now, all rows go to the new/matching screen
    router.push("/client/transactions/reconciliation/new");
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
        <SummaryStats runs={runs} />

        {/* History list */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          {/* List header */}
          <div
            className="grid px-5 py-3 border-b"
            style={{
              gridTemplateColumns: "1fr 130px 130px 130px 120px 36px",
              borderColor: "rgba(255,255,255,0.07)",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            {["Period", "Bank", "Lines", "Amount", "Status", ""].map((h) => (
              <span
                key={h}
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: BRAND.muted }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {runs.length === 0 ? (
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
          ) : (
            runs.map((run, i) => (
              <button
                key={run.id}
                type="button"
                onClick={() => openRun(run)}
                className="w-full text-left transition-colors duration-150 hover:bg-white/[0.025]"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 130px 130px 130px 120px 36px",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderBottom: i < runs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  borderLeft: `3px solid ${
                    run.status === "complete" ? BRAND.green
                    : run.status === "in-progress" ? BRAND.gold
                    : BRAND.red
                  }`,
                }}
              >
                {/* Period + meta */}
                <div className="flex flex-col gap-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: run.status === "complete" ? `${BRAND.green}12` : "rgba(255,255,255,0.06)",
                        border: `1px solid ${run.status === "complete" ? `${BRAND.green}25` : "rgba(255,255,255,0.09)"}`,
                      }}
                    >
                      {run.status === "complete"
                        ? <Lock size={12} style={{ color: BRAND.green }} />
                        : <FileText size={12} style={{ color: BRAND.muted }} />
                      }
                    </div>
                    <span className="font-semibold text-sm text-white truncate">{run.period}</span>
                  </div>
                  <div className="flex items-center gap-2 pl-9">
                    <span className="text-[11px]" style={{ color: BRAND.muted }}>{run.fileName}</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                    <span className="text-[11px]" style={{ color: BRAND.muted }}>{run.uploadedAt}</span>
                  </div>
                  <div className="pl-9">
                    <MatchBar matched={run.matched} total={run.totalLines} />
                  </div>
                </div>

                {/* Bank */}
                <span className="text-xs truncate pr-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {run.bank}
                </span>

                {/* Lines */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">{run.totalLines} lines</span>
                  <span className="text-[11px]" style={{ color: BRAND.muted }}>
                    {run.matched}M · {run.unmatched}U · {run.flagged}F
                  </span>
                </div>

                {/* Amount */}
                <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {fmtAmount(run.totalAmount)}
                </span>

                {/* Status */}
                <StatusBadge status={run.status} />

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ArrowRight size={14} style={{ color: BRAND.muted }} />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 px-1">
          {[
            { label: "M = Matched",   color: BRAND.green },
            { label: "U = Unmatched", color: BRAND.gold  },
            { label: "F = Flagged",   color: BRAND.red   },
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
