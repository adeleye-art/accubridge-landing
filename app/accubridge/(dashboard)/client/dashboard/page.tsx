"use client";

import { TrendingUp, ArrowUpRight, ArrowDownRight, BarChart2, Building2, Handshake, Zap, Plus } from "lucide-react";
import { useCurrency } from "@/lib/accubridge/currency-context";
import { useGetClientDashboardQuery } from "@/lib/accubridge/api/clientDashboardApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className ?? ""}`}
      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
    />
  );
}

function ComplianceGauge({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle cx="48" cy="48" r={r} fill="none" stroke="#06D6A0" strokeWidth="8"
        strokeLinecap="round" strokeDasharray={`${filled} ${circ}`} strokeDashoffset={circ / 4} />
      <text x="48" y="53" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">{score}</text>
    </svg>
  );
}

function statusStyle(status: string) {
  switch (status) {
    case "Verified":    return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)" };
    case "InProgress":  return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)" };
    case "UnderReview": return { color: "#3E92CC", bg: "rgba(62,146,204,0.1)" };
    default:            return { color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const { fmt } = useCurrency();
  const { data, isLoading, isError } = useGetClientDashboardQuery();

  const financialStats = data?.financialStats;
  const reg            = data?.businessRegistration;
  const REG_STEPS      = ["Not Started", "In Progress", "Submitted", "Registered"];
  const regCurrent     = reg ? Math.min(reg.currentStep, REG_STEPS.length - 1) : 0;

  const stats = financialStats
    ? [
        {
          label: "Total Income", amount: financialStats.totalIncome, sub: "Current month",
          icon: <ArrowUpRight size={20} className="text-white" />, iconBg: "#16a34a",
          valueColor: "#06D6A0", trend: "", trendUp: true as boolean | null,
        },
        {
          label: "Total Expenses", amount: financialStats.totalExpenses, sub: "Current month",
          icon: <ArrowDownRight size={20} className="text-white" />, iconBg: "#dc2626",
          valueColor: "#ef4444", trend: "", trendUp: false as boolean | null,
        },
        {
          label: "Net Profit", amount: financialStats.netProfit, sub: "Current month",
          icon: <BarChart2 size={20} className="text-white" />, iconBg: "#1e3a6e",
          valueColor: financialStats.netProfit >= 0 ? "#06D6A0" : "#ef4444",
          trend: financialStats.netProfit === 0 ? "Break-even" : financialStats.netProfit > 0 ? "Profitable" : "Net loss",
          trendUp: financialStats.netProfit > 0 ? true : financialStats.netProfit < 0 ? false : null,
        },
      ]
    : [];

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: "#6B7280" }}>
            Client Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-0.5">
            {isLoading ? "Welcome back" : (data?.welcomeMessage ?? "Welcome back")}
          </h1>
          <p style={{ color: "#6B7280" }} className="text-sm">Here&apos;s an overview of your business finances.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-5 flex flex-col gap-3 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            : isError
              ? (
                <div className="col-span-3 rounded-2xl p-5 border text-center text-sm" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "#6B7280" }}>
                  Failed to load financial data.
                </div>
              )
              : stats.map((s) => (
                  <div key={s.label} className="rounded-2xl p-5 flex flex-col gap-3 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm mb-1" style={{ color: "#6B7280" }}>{s.label}</div>
                        <div className="text-2xl font-bold" style={{ color: s.valueColor }}>{fmt(s.amount)}</div>
                        <div className="text-xs mt-1" style={{ color: "#6B7280" }}>{s.sub}</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.iconBg }}>
                        {s.icon}
                      </div>
                    </div>
                    {s.trend && (
                      <div className="text-xs px-2 py-1 rounded-lg w-fit" style={{
                        backgroundColor: s.trendUp === true ? "rgba(6,214,160,0.1)" : s.trendUp === false ? "rgba(239,68,68,0.1)" : "rgba(62,146,204,0.1)",
                        color: s.trendUp === true ? "#06D6A0" : s.trendUp === false ? "#ef4444" : "#3E92CC",
                      }}>
                        {s.trend}
                      </div>
                    )}
                  </div>
                ))
          }
        </div>

        {/* Compliance Score */}
        <div className="rounded-2xl p-5 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base">Compliance Score</h2>
              <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>Your current compliance standing</p>
            </div>
            <a href="/accubridge/client/compliance" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#D4AF37" }}>
              View Passport
            </a>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 flex flex-col gap-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-shrink-0">
                <ComplianceGauge score={data?.complianceScore?.score ?? 0} />
              </div>
              <div className="flex-1 flex flex-col gap-3 w-full">
                {(reg || data?.complianceScore) && (
                  <>
                    {[
                      ...(reg ? [
                        { label: "KYC Status", value: reg.kycStatus },
                        { label: "KYB Status", value: reg.kybStatus },
                      ] : []),
                      ...(data?.complianceScore ? [
                        { label: "Tax Filing", value: data.complianceScore.taxFilingStatus },
                        { label: "Bookkeeping", value: data.complianceScore.bookkeepingStatus },
                        { label: "Regulatory", value: data.complianceScore.regulatoryObligations },
                      ] : []),
                    ].map((item) => {
                      const s = statusStyle(item.value);
                      return (
                        <div key={item.label} className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                          <span className="text-sm" style={{ color: "#6B7280" }}>{item.label}</span>
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>{item.value}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Business Registration + Funding */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Business Registration */}
          <div className="rounded-2xl p-5 border flex flex-col gap-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">Business Registration</h2>
              {reg && (
                <span className="text-xs font-medium px-3 py-1 rounded-full border"
                  style={{ borderColor: "rgba(255,255,255,0.15)", color: "#D4AF37", backgroundColor: "rgba(212,175,55,0.1)" }}>
                  Step {reg.currentStep} of {reg.totalSteps}
                </span>
              )}
            </div>

            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex items-center gap-0">
                {REG_STEPS.map((step, i) => {
                  const done   = i < regCurrent;
                  const active = i === regCurrent;
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                          style={{
                            backgroundColor: done || active ? "#D4AF37" : "transparent",
                            borderColor:     done || active ? "#D4AF37" : "rgba(255,255,255,0.2)",
                            color:           done || active ? "#0A2463" : "#6B7280",
                          }}>
                          {done ? "✓" : i + 1}
                        </div>
                        <span className="text-[10px] text-center whitespace-nowrap"
                          style={{ color: active ? "#D4AF37" : done ? "rgba(255,255,255,0.6)" : "#6B7280" }}>
                          {step}
                        </span>
                      </div>
                      {i < REG_STEPS.length - 1 && (
                        <div className="flex-1 h-px mx-1 mb-5"
                          style={{ backgroundColor: i < regCurrent ? "#D4AF37" : "rgba(255,255,255,0.12)" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs" style={{ color: "#6B7280" }}>
              <Building2 size={14} />
              <span>KYC: {reg?.kycStatus ?? "—"} · KYB: {reg?.kybStatus ?? "—"}</span>
            </div>
          </div>

          {/* Funding Applications */}
          <div className="rounded-2xl p-5 border flex flex-col gap-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">Funding Applications</h2>
              <a href="/accubridge/client/funding" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#D4AF37" }}>
                View All
              </a>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : (data?.fundingApplications ?? []).length > 0 ? (
              <div className="flex flex-col gap-2">
                {data!.fundingApplications.map((f) => {
                  const s = statusStyle(f.status);
                  return (
                    <div key={f.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border"
                      style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
                      <div>
                        <div className="text-sm font-medium">{fmt(f.amount)}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{new Date(f.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                      <span className="text-xs font-medium px-3 py-1 rounded-full border flex-shrink-0"
                        style={{ borderColor: "rgba(255,255,255,0.15)", color: s.color, backgroundColor: s.bg }}>
                        {f.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 gap-2 flex-1">
                <Handshake size={28} style={{ color: "#6B7280" }} />
                <p className="text-sm" style={{ color: "#6B7280" }}>No active applications</p>
                <a href="/accubridge/client/funding" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#D4AF37" }}>
                  Explore funding
                </a>
              </div>
            )}
          </div>
        </div>

        {/* AI Ideas + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* AI Business Ideas */}
          <div className="lg:col-span-2 rounded-2xl p-5 border flex flex-col gap-4"
            style={{ backgroundColor: "rgba(212,175,55,0.08)", borderColor: "rgba(212,175,55,0.2)" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}>
                <Zap size={18} style={{ color: "#D4AF37" }} />
              </div>
              <div>
                <h2 className="font-bold text-sm" style={{ color: "#D4AF37" }}>AI Business Ideas</h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Get tailored business ideas based on your skills and capital.
                </p>
              </div>
            </div>
            <a href="/accubridge/client/ai-ideas"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#D4AF37", color: "#0A2463" }}>
              <Zap size={14} />
              Generate Ideas
            </a>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-3 rounded-2xl p-5 border flex flex-col gap-4"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-base">Recent Transactions</h2>
              <div className="flex items-center gap-2">
                <a href="/accubridge/client/transactions" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: "#D4AF37" }}>
                  View All
                </a>
                <a href="/accubridge/client/transactions"
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#D4AF37", color: "#0A2463" }}>
                  <Plus size={12} />
                  Add
                </a>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-4 text-xs font-medium px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "#6B7280" }}>
              <span>Date</span>
              <span>Type</span>
              <span>Category</span>
              <span className="text-right">Amount</span>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (data?.recentTransactions ?? []).length > 0 ? (
              <div className="flex flex-col">
                {data!.recentTransactions.map((tx) => (
                  <div key={tx.id} className="grid grid-cols-4 items-center px-3 py-3 text-sm border-b last:border-0"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <span style={{ color: "#6B7280" }}>{new Date(tx.date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
                    <span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full border"
                        style={{
                          borderColor: "rgba(255,255,255,0.15)",
                          color: tx.type === "Expense" ? "#ef4444" : "#06D6A0",
                          backgroundColor: tx.type === "Expense" ? "rgba(239,68,68,0.1)" : "rgba(6,214,160,0.1)",
                        }}>
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
