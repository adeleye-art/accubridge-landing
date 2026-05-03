"use client";

import {
  Users, ClipboardList, BarChart3, AlertTriangle,
  ArrowLeftRight, ShieldCheck, StickyNote, FileText, ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useGetClientsQuery } from "@/lib/accubridge/api/clientApi";
import { useGetComplianceCasesQuery } from "@/lib/accubridge/api/complianceApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const QUICK_ACTIONS = [
  { label: "My Clients",          href: "/accubridge/staff/clients",      icon: <Users size={20} />,            color: "#3E92CC" },
  { label: "Transactions",        href: "/accubridge/staff/transactions", icon: <ArrowLeftRight size={20} />,   color: "#D4AF37" },
  { label: "Generate Reports",    href: "/accubridge/staff/reports",      icon: <BarChart3 size={20} />,         color: "#06D6A0" },
  { label: "Compliance",          href: "/accubridge/staff/compliance",   icon: <ShieldCheck size={20} />,      color: "#a78bfa" },
  { label: "Add Notes",           href: "/accubridge/staff/notes",        icon: <StickyNote size={20} />,       color: "#fb923c" },
  { label: "Request Documents",   href: "/accubridge/staff/documents",    icon: <FileText size={20} />,          color: "#6B7280" },
];

function scoreColor(s: number) {
  if (s >= 70) return "#06D6A0";
  if (s >= 40) return "#D4AF37";
  return "#ef4444";
}

function statusStyle(statusValue: number) {
  if (statusValue === 1) return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)",   label: "Active"    };
  if (statusValue === 0) return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)",  label: "Pending"   };
  return                        { color: "#6B7280", bg: "rgba(107,114,128,0.1)", label: "Suspended" };
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ""}`} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />;
}

export default function StaffDashboard() {
  const { data: clientData, isLoading: clientsLoading } = useGetClientsQuery({ pageSize: 10 });
  const { data: complianceData, isLoading: complianceLoading } = useGetComplianceCasesQuery({ status: 0, pageSize: 1 });

  const totalClients  = clientData?.totalCount ?? 0;
  const pendingCount  = clientData?.summary?.pendingCount ?? 0;
  const alertCount    = complianceData?.totalCount ?? 0;
  const clients       = clientData?.clients ?? [];

  const STATS = [
    { label: "Assigned Clients",  value: String(totalClients), sub: "Under your care",   iconBg: "#1e3a6e", valueColor: "#3E92CC", icon: <Users size={20} className="text-white" />,        trend: `${clientData?.summary?.activeCount ?? 0} active`,  trendUp: true  },
    { label: "Pending Reviews",   value: String(pendingCount), sub: "Awaiting action",   iconBg: "#78350f", valueColor: "#D4AF37", icon: <ClipboardList size={20} className="text-white" />, trend: pendingCount > 0 ? "Action required" : "All up to date", trendUp: pendingCount === 0 },
    { label: "Reports Generated", value: "—",                  sub: "This month",        iconBg: "#064e3b", valueColor: "#06D6A0", icon: <BarChart3 size={20} className="text-white" />,     trend: "View reports",     trendUp: true  },
    { label: "Compliance Alerts", value: String(alertCount),   sub: "Require attention", iconBg: "#7f1d1d", valueColor: "#ef4444", icon: <AlertTriangle size={20} className="text-white" />, trend: alertCount > 0 ? "Review now" : "All clear",         trendUp: alertCount === 0 },
  ];

  const isLoading = clientsLoading || complianceLoading;

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff Dashboard</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-0.5">My Workspace</h1>
          <p className="text-sm" style={{ color: BRAND.muted }}>Review and manage your assigned client accounts.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl p-5 flex flex-col gap-3 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm mb-1" style={{ color: BRAND.muted }}>{s.label}</div>
                  {isLoading
                    ? <Skeleton className="h-7 w-12 mt-1" />
                    : <div className="text-2xl font-bold" style={{ color: s.valueColor }}>{s.value}</div>
                  }
                  <div className="text-xs mt-1" style={{ color: BRAND.muted }}>{s.sub}</div>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.iconBg }}>{s.icon}</div>
              </div>
              <div className="text-xs px-2 py-1 rounded-lg w-fit" style={{
                backgroundColor: s.trendUp ? "rgba(6,214,160,0.1)" : "rgba(239,68,68,0.1)",
                color: s.trendUp ? "#06D6A0" : "#ef4444",
              }}>{s.trend}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-bold text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>QUICK ACTIONS</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <a key={action.label} href={action.href} className="rounded-2xl p-4 flex flex-col items-center gap-3 border text-center group transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${action.color}18`, color: action.color }}>{action.icon}</div>
                <span className="text-xs font-medium leading-tight group-hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Assigned clients table */}
        <div className="rounded-2xl border flex flex-col" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="font-bold text-base">Assigned Clients</h2>
            <a href="/accubridge/staff/clients" className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: BRAND.gold }}>
              View All <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-12">
                <Loader2 size={16} className="animate-spin" style={{ color: BRAND.accent }} />
                <span className="text-sm" style={{ color: BRAND.muted }}>Loading clients…</span>
              </div>
            ) : clients.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: BRAND.muted }}>No clients assigned yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Business", "Owner", "Score", "Status", "Staff"].map((h) => (
                      <th key={h} className="px-5 py-2.5 text-left text-xs font-medium" style={{ color: BRAND.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => {
                    const ss = statusStyle(c.statusValue);
                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className="px-5 py-3 font-medium">{c.businessName}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{c.ownerName}</td>
                        <td className="px-5 py-3 font-bold" style={{ color: scoreColor(c.score) }}>{c.score}</td>
                        <td className="px-5 py-3"><span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{ss.label}</span></td>
                        <td className="px-5 py-3 text-xs" style={{ color: BRAND.muted }}>
                          {c.assignedStaffName ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
