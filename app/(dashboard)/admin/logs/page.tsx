"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type LogType = "staff" | "compliance" | "funding" | "client" | "report" | "document" | "note";

interface LogEntry {
  id: string; actor: string; action: string; target: string; time: string; type: LogType;
}

const MOCK_LOGS: LogEntry[] = [
  { id: "l1",  actor: "Admin",         action: "Created staff account",        target: "Tom Walsh",           time: "2026-04-03 09:15", type: "staff"      },
  { id: "l2",  actor: "Mark Chen",     action: "Updated compliance score",     target: "Apex Solutions Ltd",  time: "2026-04-03 08:50", type: "compliance" },
  { id: "l3",  actor: "Admin",         action: "Approved funding application", target: "Nova Consulting UK",  time: "2026-04-02 17:30", type: "funding"    },
  { id: "l4",  actor: "Priya Sharma",  action: "Added internal note",          target: "Bright Path Ltd",     time: "2026-04-02 14:10", type: "note"       },
  { id: "l5",  actor: "Admin",         action: "Suspended client account",     target: "Greenfield Ventures", time: "2026-04-02 11:00", type: "client"     },
  { id: "l6",  actor: "Mark Chen",     action: "Generated P&L report",         target: "Apex Solutions Ltd",  time: "2026-04-01 16:45", type: "report"     },
  { id: "l7",  actor: "Admin",         action: "Rejected funding application", target: "Greenfield Ventures", time: "2026-04-01 10:20", type: "funding"    },
  { id: "l8",  actor: "Priya Sharma",  action: "Requested missing document",   target: "Lagos First Capital", time: "2026-03-31 15:00", type: "document"   },
  { id: "l9",  actor: "Admin",         action: "Assigned Mark Chen to client", target: "TechBridge NG Ltd",   time: "2026-03-31 10:30", type: "client"     },
  { id: "l10", actor: "Mark Chen",     action: "Updated compliance status",    target: "TechBridge NG Ltd",   time: "2026-03-30 14:00", type: "compliance" },
  { id: "l11", actor: "Priya Sharma",  action: "Generated Balance Sheet",      target: "Bright Path Ltd",     time: "2026-03-29 11:15", type: "report"     },
  { id: "l12", actor: "Admin",         action: "Activated client account",     target: "Apex Solutions Ltd",  time: "2026-03-28 09:00", type: "client"     },
];

const TYPE_TABS: (LogType | "All")[] = ["All", "client", "compliance", "funding", "staff", "report", "document"];

function typeBadge(type: LogType) {
  const map: Record<LogType, { color: string; bg: string; label: string }> = {
    staff:      { color: "#3E92CC", bg: "rgba(62,146,204,0.12)",   label: "Staff"      },
    compliance: { color: "#D4AF37", bg: "rgba(212,175,55,0.12)",   label: "Compliance" },
    funding:    { color: "#06D6A0", bg: "rgba(6,214,160,0.12)",    label: "Funding"    },
    client:     { color: "#a78bfa", bg: "rgba(167,139,250,0.12)",  label: "Client"     },
    report:     { color: "#fb923c", bg: "rgba(251,146,60,0.12)",   label: "Report"     },
    document:   { color: "#6B7280", bg: "rgba(107,114,128,0.12)",  label: "Document"   },
    note:       { color: "#f472b6", bg: "rgba(244,114,182,0.12)",  label: "Note"       },
  };
  return map[type];
}

export default function AdminLogsPage() {
  const [search, setSearch]       = useState("");
  const [activeTab, setActiveTab] = useState<LogType | "All">("All");

  const filtered = useMemo(() =>
    MOCK_LOGS.filter((l) => {
      const matchTab    = activeTab === "All" || l.type === activeTab;
      const matchSearch = l.actor.toLowerCase().includes(search.toLowerCase())
        || l.action.toLowerCase().includes(search.toLowerCase())
        || l.target.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    }), [search, activeTab]);

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Chronological record of all platform actions.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border max-w-xs flex-1" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color: BRAND.muted }} />
            <input type="text" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] flex-1" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {TYPE_TABS.map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize"
                style={{ backgroundColor: activeTab === tab ? BRAND.gold : "rgba(255,255,255,0.06)", color: activeTab === tab ? BRAND.primary : "rgba(255,255,255,0.6)" }}>
                {tab}
              </button>
            ))}
          </div>
          <span className="text-xs ml-auto" style={{ color: BRAND.muted }}>{filtered.length} entries</span>
        </div>

        {/* Log table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Time", "Actor", "Action", "Target", "Type"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const badge = typeBadge(l.type);
                  return (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: BRAND.muted }}>{l.time}</td>
                      <td className="px-5 py-3.5 font-medium text-sm">{l.actor}</td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>{l.action}</td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{l.target}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize" style={{ color: badge.color, backgroundColor: badge.bg }}>{badge.label}</span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No log entries match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
