"use client";

import { TrendingUp, TrendingDown, BarChart2, ArrowUpRight, ArrowDownRight, Building2, Handshake, Zap, Plus } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";

// ─── Mock data ────────────────────────────────────────────────────────────────
const STATS = [
  {
    label: "Total Income",
    amount: 101585,
    sub: "Current month",
    icon: <ArrowUpRight size={20} className="text-white" />,
    iconBg: "#16a34a",
    valueColor: "#06D6A0",
    trend: "+12% vs last month",
    trendUp: true,
  },
  {
    label: "Total Expenses",
    amount: 101585,
    sub: "Current month",
    icon: <ArrowDownRight size={20} className="text-white" />,
    iconBg: "#dc2626",
    valueColor: "#ef4444",
    trend: "+3% vs last month",
    trendUp: false,
  },
  {
    label: "Net Profit",
    amount: 0,
    sub: "Current month",
    icon: <BarChart2 size={20} className="text-white" />,
    iconBg: "#1e3a6e",
    valueColor: "#3E92CC",
    trend: "Break-even",
    trendUp: null,
  },
];

const COMPLIANCE = {
  score: 92,
  items: [
    { label: "Tax Filing Status",       value: "Filed" },
    { label: "Bookkeeping",             value: "Regular" },
    { label: "Regulatory Obligations",  value: "VAT registration, annual return" },
  ],
};

const REG_STEPS = ["Not Started", "In Progress", "Submitted", "Registered"];
const REG_CURRENT = 1; // 0-indexed, "In Progress"

const FUNDING = [
  { name: "Raffle Funding", date: "Mar 10, 2026 11:00 am", status: "Pending" },
];

const TRANSACTIONS = [
  { date: "3/08/26", type: "Expense", category: "Salaries & Wages", amount: 8700 },
];

// ─── Compliance gauge (SVG) ───────────────────────────────────────────────────
function ComplianceGauge({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      {/* Track */}
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      {/* Progress — start from top (-90deg) */}
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="#06D6A0"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`}
        strokeDashoffset={circ / 4}
      />
      <text x="48" y="53" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">
        {score}
      </text>
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const { fmt } = useCurrency();

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">

        {/* ── Header ── */}
        <div>
          <div
            className="inline-block border rounded-lg px-3 py-1 text-xs mb-2"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#6B7280" }}
          >
            Client Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-0.5">Welcome back 👋</h1>
          <p style={{ color: "#6B7280" }} className="text-sm">Here&apos;s an overview of your business finances.</p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-5 flex flex-col gap-3 border"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm mb-1" style={{ color: "#6B7280" }}>{s.label}</div>
                  <div className="text-2xl font-bold" style={{ color: s.valueColor }}>{fmt(s.amount)}</div>
                  <div className="text-xs mt-1" style={{ color: "#6B7280" }}>{s.sub}</div>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: s.iconBg }}
                >
                  {s.icon}
                </div>
              </div>
              <div
                className="text-xs px-2 py-1 rounded-lg w-fit"
                style={{
                  backgroundColor: s.trendUp === true
                    ? "rgba(6,214,160,0.1)"
                    : s.trendUp === false
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(62,146,204,0.1)",
                  color: s.trendUp === true ? "#06D6A0" : s.trendUp === false ? "#ef4444" : "#3E92CC",
                }}
              >
                {s.trend}
              </div>
            </div>
          ))}
        </div>

        {/* ── Compliance Score (full-width card) ── */}
        <div
          className="rounded-2xl p-5 border"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base">Compliance Score</h2>
              <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>Your current compliance standing</p>
            </div>
            <a href="/client/compliance" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#D4AF37" }}>
              View Passport
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0">
              <ComplianceGauge score={COMPLIANCE.score} />
            </div>
            <div className="flex-1 flex flex-col gap-3 w-full">
              {COMPLIANCE.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <span className="text-sm" style={{ color: "#6B7280" }}>{item.label}</span>
                  <span className="text-sm font-medium text-right" style={{ color: "rgba(255,255,255,0.85)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Business Registration + Funding ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Business Registration */}
          <div
            className="rounded-2xl p-5 border flex flex-col gap-4"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">Business Registration</h2>
              <span
                className="text-xs font-medium px-3 py-1 rounded-full border"
                style={{ borderColor: "rgba(255,255,255,0.15)", color: "#D4AF37", backgroundColor: "rgba(212,175,55,0.1)" }}
              >
                In Progress
              </span>
            </div>

            {/* Step tracker */}
            <div className="flex items-center gap-0">
              {REG_STEPS.map((step, i) => {
                const done = i < REG_CURRENT;
                const active = i === REG_CURRENT;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    {/* Node */}
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                        style={{
                          backgroundColor: done || active ? "#D4AF37" : "transparent",
                          borderColor: done || active ? "#D4AF37" : "rgba(255,255,255,0.2)",
                          color: done || active ? "#0A2463" : "#6B7280",
                        }}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      <span className="text-[10px] text-center whitespace-nowrap" style={{ color: active ? "#D4AF37" : done ? "rgba(255,255,255,0.6)" : "#6B7280" }}>
                        {step}
                      </span>
                    </div>
                    {/* Connector */}
                    {i < REG_STEPS.length - 1 && (
                      <div
                        className="flex-1 h-px mx-1 mb-5"
                        style={{ backgroundColor: i < REG_CURRENT ? "#D4AF37" : "rgba(255,255,255,0.12)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs" style={{ color: "#6B7280" }}>
              <Building2 size={14} />
              <span>Authority: Companies House (UK)</span>
            </div>
          </div>

          {/* Funding Applications */}
          <div
            className="rounded-2xl p-5 border flex flex-col gap-4"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">Funding Applications</h2>
              <a href="/client/funding/applications" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#D4AF37" }}>
                View All
              </a>
            </div>

            {FUNDING.length > 0 ? (
              <div className="flex flex-col gap-2">
                {FUNDING.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border"
                    style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}
                  >
                    <div>
                      <div className="text-sm font-medium">{f.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{f.date}</div>
                    </div>
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full border flex-shrink-0"
                      style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.06)" }}
                    >
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-4 gap-2 flex-1">
              <Handshake size={28} style={{ color: "#6B7280" }} />
              <p className="text-sm" style={{ color: "#6B7280" }}>No active applications</p>
              <a href="/client/funding" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#D4AF37" }}>
                Explore funding
              </a>
            </div>
          </div>
        </div>

        {/* ── AI Ideas + Recent Transactions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* AI Business Ideas */}
          <div
            className="lg:col-span-2 rounded-2xl p-5 border flex flex-col gap-4"
            style={{ backgroundColor: "rgba(212,175,55,0.08)", borderColor: "rgba(212,175,55,0.2)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}
              >
                <Zap size={18} style={{ color: "#D4AF37" }} />
              </div>
              <div>
                <h2 className="font-bold text-sm" style={{ color: "#D4AF37" }}>AI Business Ideas</h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Get tailored business ideas based on your skills and capital.
                </p>
              </div>
            </div>
            <a
              href="/client/ai-ideas"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#D4AF37", color: "#0A2463" }}
            >
              <Zap size={14} />
              Generate Ideas
            </a>
          </div>

          {/* Recent Transactions */}
          <div
            className="lg:col-span-3 rounded-2xl p-5 border flex flex-col gap-4"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-base">Recent Transactions</h2>
              <div className="flex items-center gap-2">
                <a href="/client/transactions" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#D4AF37" }}>
                  View All
                </a>
                <a
                  href="/client/transactions/new"
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#D4AF37", color: "#0A2463" }}
                >
                  <Plus size={12} />
                  Add Transaction
                </a>
              </div>
            </div>

            {/* Table header */}
            <div
              className="grid grid-cols-4 text-xs font-medium px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "#6B7280" }}
            >
              <span>Date</span>
              <span>Type</span>
              <span>Category</span>
              <span className="text-right">Amount</span>
            </div>

            {/* Rows */}
            {TRANSACTIONS.length > 0 ? (
              <div className="flex flex-col">
                {TRANSACTIONS.map((tx, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 items-center px-3 py-3 text-sm border-b last:border-0"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <span style={{ color: "#6B7280" }}>{tx.date}</span>
                    <span>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full border"
                        style={{
                          borderColor: "rgba(255,255,255,0.15)",
                          color: tx.type === "Expense" ? "#ef4444" : "#06D6A0",
                          backgroundColor: tx.type === "Expense" ? "rgba(239,68,68,0.1)" : "rgba(6,214,160,0.1)",
                        }}
                      >
                        {tx.type}
                      </span>
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>{tx.category}</span>
                    <span className="text-right font-medium" style={{ color: tx.type === "Expense" ? "#ef4444" : "#06D6A0" }}>
                      {fmt(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 gap-2" style={{ color: "#6B7280" }}>
                <TrendingUp size={24} />
                <span className="text-sm">No transactions yet</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
