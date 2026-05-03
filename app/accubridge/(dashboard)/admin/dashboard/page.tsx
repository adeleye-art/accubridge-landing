"use client";

import {
  Users, ClipboardList, AlertTriangle, Landmark,
  UserCog, ShieldCheck, ScrollText, Settings, ArrowUpRight,
} from "lucide-react";
import { useGetDashboardOverviewQuery } from "@/lib/accubridge/api/dashboardApi";

// ─── Brand ────────────────────────────────────────────────────────────────────
const BRAND = { primary: "#0A2463", accent: "#3E92CC", gold: "#D4AF37", muted: "#6B7280" };

const QUICK_ACTIONS = [
  { label: "View All Clients",    href: "/accubridge/admin/clients",    icon: <Users size={20} />,       color: "#3E92CC" },
  { label: "Funding Queue",       href: "/accubridge/admin/funding",    icon: <Landmark size={20} />,     color: "#D4AF37" },
  { label: "Manage Staff",        href: "/accubridge/admin/staff",      icon: <UserCog size={20} />,      color: "#06D6A0" },
  { label: "Compliance Overview", href: "/accubridge/admin/compliance", icon: <ShieldCheck size={20} />, color: "#a78bfa" },
  { label: "Activity Logs",       href: "/accubridge/admin/logs",       icon: <ScrollText size={20} />,   color: "#fb923c" },
  { label: "Platform Settings",   href: "/accubridge/admin/settings",   icon: <Settings size={20} />,     color: BRAND.muted },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusStyle(status: string) {
  switch (status) {
    case "Active":       return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)" };
    case "Pending":      return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)" };
    case "Suspended":    return { color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
    case "Approved":     return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)" };
    case "Under Review": return { color: "#3E92CC", bg: "rgba(62,146,204,0.1)" };
    default:             return { color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
  }
}

function scoreColor(score: number) {
  if (score >= 70) return "#06D6A0";
  if (score >= 40) return "#D4AF37";
  return "#ef4444";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className ?? ""}`}
      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: overview, isLoading, isError } = useGetDashboardOverviewQuery();

  const stats = overview
    ? [
        {
          label: "Total Clients",
          value: String(overview.stats.totalClients),
          sub: "Registered businesses",
          iconBg: "#1e3a6e",
          valueColor: "#3E92CC",
          icon: <Users size={20} className="text-white" />,
          trend: `+${overview.stats.clientsGrowthThisMonth} this month`,
          trendUp: true,
        },
        {
          label: "Active Onboardings",
          value: String(overview.stats.activeOnboardings),
          sub: "In progress",
          iconBg: "#78350f",
          valueColor: "#D4AF37",
          icon: <ClipboardList size={20} className="text-white" />,
          trend: `${overview.stats.onboardingsCreated} created`,
          trendUp: null,
        },
        {
          label: "Compliance Alerts",
          value: String(overview.stats.complianceAlerts),
          sub: "Require attention",
          iconBg: "#7f1d1d",
          valueColor: "#ef4444",
          icon: <AlertTriangle size={20} className="text-white" />,
          trend: `${overview.stats.complianceAlertsCritical} critical`,
          trendUp: false,
        },
        {
          label: "Funding Applications",
          value: String(overview.stats.fundingApplications),
          sub: "Awaiting review",
          iconBg: "#064e3b",
          valueColor: "#06D6A0",
          icon: <Landmark size={20} className="text-white" />,
          trend: `+${overview.stats.fundingApplicationsThisWeek} this week`,
          trendUp: true,
        },
      ]
    : [];

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>
            Super Admin
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-0.5">Platform Overview</h1>
          <p className="text-sm" style={{ color: BRAND.muted }}>Full visibility across all clients, staff, compliance, and funding.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-5 flex flex-col gap-3 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))
            : stats.map((s) => (
                <div key={s.label} className="rounded-2xl p-5 flex flex-col gap-3 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm mb-1" style={{ color: BRAND.muted }}>{s.label}</div>
                      <div className="text-2xl font-bold" style={{ color: s.valueColor }}>{s.value}</div>
                      <div className="text-xs mt-1" style={{ color: BRAND.muted }}>{s.sub}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.iconBg }}>{s.icon}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-lg w-fit" style={{
                    backgroundColor: s.trendUp === true ? "rgba(6,214,160,0.1)" : s.trendUp === false ? "rgba(239,68,68,0.1)" : "rgba(62,146,204,0.1)",
                    color: s.trendUp === true ? "#06D6A0" : s.trendUp === false ? "#ef4444" : "#3E92CC",
                  }}>
                    {s.trend}
                  </div>
                </div>
              ))
          }
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-bold text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>QUICK ACTIONS</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="rounded-2xl p-4 flex flex-col items-center gap-3 border text-center group transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200" style={{ backgroundColor: `${action.color}18`, color: action.color }}>
                  {action.icon}
                </div>
                <span className="text-xs font-medium leading-tight group-hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Recent clients table */}
          <div className="lg:col-span-3 rounded-2xl border flex flex-col" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="font-bold text-base">Recent Clients</h2>
              <a href="/accubridge/admin/clients" className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: BRAND.gold }}>
                View All <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex flex-col gap-2 px-5 pb-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : isError ? (
                <p className="px-5 pb-5 text-sm" style={{ color: BRAND.muted }}>Failed to load clients.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Business", "Owner", "Staff", "Score", "Status"].map((h) => (
                        <th key={h} className="px-5 py-2.5 text-left text-xs font-medium" style={{ color: BRAND.muted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {overview?.recentClients.map((c) => {
                      const ss = statusStyle(c.status);
                      return (
                        <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td className="px-5 py-3 font-medium text-sm">{c.businessName}</td>
                          <td className="px-5 py-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{c.ownerName}</td>
                          <td className="px-5 py-3 text-sm" style={{ color: BRAND.muted }}>{c.assignedStaffName ?? "Unassigned"}</td>
                          <td className="px-5 py-3 text-sm font-bold" style={{ color: scoreColor(c.score) }}>{c.score}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Funding queue */}
          <div className="lg:col-span-2 rounded-2xl border flex flex-col" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="font-bold text-base">Funding Queue</h2>
              <a href="/accubridge/admin/funding" className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: BRAND.gold }}>
                View All <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="flex flex-col px-3 pb-3 gap-2">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                : isError
                  ? <p className="px-2 text-sm" style={{ color: BRAND.muted }}>Failed to load funding queue.</p>
                  : overview?.fundingQueue.map((f) => {
                      const ss = statusStyle(f.status);
                      return (
                        <div key={f.businessName + f.date} className="flex flex-col gap-1.5 p-3 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.03)" }}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{f.businessName}</span>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{f.status}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs" style={{ color: BRAND.muted }}>
                            <span>{f.amountFormatted}</span>
                            <span>{f.date}</span>
                          </div>
                        </div>
                      );
                    })
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
