"use client";

import {
  Users, ClipboardList, AlertTriangle, Landmark,
  UserCog, ShieldCheck, ScrollText, Settings, ArrowUpRight,
} from "lucide-react";
import { type SupportedCurrency, formatAmountRaw } from "@/lib/currency";

// ─── Brand ────────────────────────────────────────────────────────────────────
const BRAND = { primary: "#0A2463", accent: "#3E92CC", gold: "#D4AF37", muted: "#6B7280" };

// ─── Mock data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Total Clients",         value: "142", sub: "Registered businesses",  iconBg: "#1e3a6e", valueColor: "#3E92CC", icon: <Users size={20} className="text-white" />,          trend: "+8 this month",         trendUp: true  },
  { label: "Active Onboardings",    value: "23",  sub: "In progress",            iconBg: "#78350f", valueColor: "#D4AF37", icon: <ClipboardList size={20} className="text-white" />,   trend: "5 stalled",             trendUp: null  },
  { label: "Compliance Alerts",     value: "7",   sub: "Require attention",      iconBg: "#7f1d1d", valueColor: "#ef4444", icon: <AlertTriangle size={20} className="text-white" />,   trend: "2 critical",            trendUp: false },
  { label: "Funding Applications",  value: "18",  sub: "Awaiting review",        iconBg: "#064e3b", valueColor: "#06D6A0", icon: <Landmark size={20} className="text-white" />,        trend: "+4 since yesterday",    trendUp: true  },
];

const QUICK_ACTIONS = [
  { label: "View All Clients",    href: "/admin/clients",    icon: <Users size={20} />,       color: "#3E92CC" },
  { label: "Funding Queue",       href: "/admin/funding",    icon: <Landmark size={20} />,     color: "#D4AF37" },
  { label: "Manage Staff",        href: "/admin/staff",      icon: <UserCog size={20} />,      color: "#06D6A0" },
  { label: "Compliance Overview", href: "/admin/compliance", icon: <ShieldCheck size={20} />, color: "#a78bfa" },
  { label: "Activity Logs",       href: "/admin/logs",       icon: <ScrollText size={20} />,   color: "#fb923c" },
  { label: "Platform Settings",   href: "/admin/settings",   icon: <Settings size={20} />,     color: BRAND.muted },
];

const RECENT_CLIENTS = [
  { name: "Apex Solutions Ltd",   owner: "Jane Okonkwo",    status: "Active",    score: 92, staff: "Mark Chen"    },
  { name: "TechBridge NG Ltd",    owner: "Ade Adeyemi",     status: "Pending",   score: 45, staff: "Unassigned"   },
  { name: "Greenfield Ventures",  owner: "Sarah Williams",  status: "Suspended", score: 12, staff: "Priya Sharma" },
  { name: "Nova Consulting UK",   owner: "Daniel Obi",      status: "Active",    score: 78, staff: "Mark Chen"    },
  { name: "Bright Path Ltd",      owner: "Chidi Eze",       status: "Active",    score: 65, staff: "Priya Sharma" },
];

const RECENT_FUNDING: { business: string; type: string; amount: number; currency: SupportedCurrency; suffix?: string; status: string; submitted: string }[] = [
  { business: "Apex Solutions Ltd", type: "Raffle",     amount: 25,    currency: "GBP", suffix: " fee", status: "Pending",      submitted: "2 Apr 2026" },
  { business: "Nova Consulting UK", type: "Compliance", amount: 5000,  currency: "GBP",               status: "Approved",     submitted: "1 Apr 2026" },
  { business: "TechBridge NG Ltd",  type: "Investor",   amount: 50000, currency: "NGN",               status: "Under Review", submitted: "30 Mar 2026" },
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

function typeBadgeStyle(type: string) {
  switch (type) {
    case "Raffle":     return { color: "#D4AF37", bg: "rgba(212,175,55,0.12)" };
    case "Compliance": return { color: "#06D6A0", bg: "rgba(6,214,160,0.12)" };
    case "Investor":   return { color: "#3E92CC", bg: "rgba(62,146,204,0.12)" };
    default:           return { color: "#6B7280", bg: "rgba(107,114,128,0.12)" };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
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
                backgroundColor: s.trendUp === true ? "rgba(6,214,160,0.1)" : s.trendUp === false ? "rgba(239,68,68,0.1)" : "rgba(62,146,204,0.1)",
                color: s.trendUp === true ? "#06D6A0" : s.trendUp === false ? "#ef4444" : "#3E92CC",
              }}>
                {s.trend}
              </div>
            </div>
          ))}
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
              <a href="/admin/clients" className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: BRAND.gold }}>
                View All <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Business", "Owner", "Staff", "Score", "Status"].map((h) => (
                      <th key={h} className="px-5 py-2.5 text-left text-xs font-medium" style={{ color: BRAND.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_CLIENTS.map((c) => {
                    const ss = statusStyle(c.status);
                    return (
                      <tr key={c.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className="px-5 py-3 font-medium text-sm">{c.name}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{c.owner}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: BRAND.muted }}>{c.staff}</td>
                        <td className="px-5 py-3 text-sm font-bold" style={{ color: scoreColor(c.score) }}>{c.score}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent funding */}
          <div className="lg:col-span-2 rounded-2xl border flex flex-col" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="font-bold text-base">Funding Queue</h2>
              <a href="/admin/funding" className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: BRAND.gold }}>
                View All <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="flex flex-col px-3 pb-3 gap-2">
              {RECENT_FUNDING.map((f) => {
                const ss = statusStyle(f.status);
                const ts = typeBadgeStyle(f.type);
                return (
                  <div key={f.business} className="flex flex-col gap-1.5 p-3 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: ts.color, backgroundColor: ts.bg }}>{f.type}</span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{f.status}</span>
                    </div>
                    <div className="text-sm font-medium">{f.business}</div>
                    <div className="flex items-center justify-between text-xs" style={{ color: BRAND.muted }}>
                      <span>{formatAmountRaw(f.amount, f.currency)}{f.suffix ?? ""}</span>
                      <span>{f.submitted}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
