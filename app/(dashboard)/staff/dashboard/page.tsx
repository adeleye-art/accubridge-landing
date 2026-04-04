"use client";

import {
  Users, ClipboardList, BarChart3, AlertTriangle,
  ArrowLeftRight, ShieldCheck, StickyNote, FileText, ArrowUpRight,
} from "lucide-react";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const STATS = [
  { label: "Assigned Clients",  value: "12", sub: "Under your care",   iconBg: "#1e3a6e", valueColor: "#3E92CC", icon: <Users size={20} className="text-white" />,        trend: "+2 this month",    trendUp: true  },
  { label: "Pending Reviews",   value: "5",  sub: "Awaiting action",   iconBg: "#78350f", valueColor: "#D4AF37", icon: <ClipboardList size={20} className="text-white" />, trend: "3 overdue",        trendUp: false },
  { label: "Reports Generated", value: "31", sub: "This month",        iconBg: "#064e3b", valueColor: "#06D6A0", icon: <BarChart3 size={20} className="text-white" />,     trend: "+8 vs last month", trendUp: true  },
  { label: "Compliance Alerts", value: "2",  sub: "Require attention", iconBg: "#7f1d1d", valueColor: "#ef4444", icon: <AlertTriangle size={20} className="text-white" />, trend: "1 critical",       trendUp: false },
];

const QUICK_ACTIONS = [
  { label: "My Clients",          href: "/staff/clients",      icon: <Users size={20} />,            color: "#3E92CC" },
  { label: "Transactions",        href: "/staff/transactions", icon: <ArrowLeftRight size={20} />,   color: "#D4AF37" },
  { label: "Generate Reports",    href: "/staff/reports",      icon: <BarChart3 size={20} />,         color: "#06D6A0" },
  { label: "Compliance",          href: "/staff/compliance",   icon: <ShieldCheck size={20} />,      color: "#a78bfa" },
  { label: "Add Notes",           href: "/staff/notes",        icon: <StickyNote size={20} />,       color: "#fb923c" },
  { label: "Request Documents",   href: "/staff/documents",    icon: <FileText size={20} />,          color: "#6B7280" },
];

const ASSIGNED_CLIENTS = [
  { name: "Apex Solutions Ltd", owner: "Jane Okonkwo",  score: 92, status: "Active",  pending: 0 },
  { name: "Nova Consulting UK", owner: "Daniel Obi",    score: 78, status: "Active",  pending: 2 },
  { name: "Bright Path Ltd",    owner: "Chidi Eze",     score: 65, status: "Active",  pending: 3 },
  { name: "TechBridge NG Ltd",  owner: "Ade Adeyemi",   score: 45, status: "Pending", pending: 0 },
];

function scoreColor(s: number) {
  if (s >= 70) return "#06D6A0";
  if (s >= 40) return "#D4AF37";
  return "#ef4444";
}

function statusStyle(status: string) {
  if (status === "Active")  return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"  };
  if (status === "Pending") return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)" };
  return { color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
}

export default function StaffDashboard() {
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
                  <div className="text-2xl font-bold" style={{ color: s.valueColor }}>{s.value}</div>
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
            <a href="/staff/clients" className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: BRAND.gold }}>
              View All <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Business", "Owner", "Score", "Status", "Pending Actions"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-xs font-medium" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ASSIGNED_CLIENTS.map((c) => {
                  const ss = statusStyle(c.status);
                  return (
                    <tr key={c.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td className="px-5 py-3 font-medium">{c.name}</td>
                      <td className="px-5 py-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{c.owner}</td>
                      <td className="px-5 py-3 font-bold" style={{ color: scoreColor(c.score) }}>{c.score}</td>
                      <td className="px-5 py-3"><span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span></td>
                      <td className="px-5 py-3">
                        {c.pending > 0
                          ? <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: "#D4AF37", backgroundColor: "rgba(212,175,55,0.1)" }}>{c.pending} pending</span>
                          : <span className="text-xs" style={{ color: BRAND.muted }}>—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
