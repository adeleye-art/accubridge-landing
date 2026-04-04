"use client";

import React, { useState, useMemo } from "react";
import { Search, Eye } from "lucide-react";
import { useToast } from "@/components/shared/toast";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

interface AssignedClient {
  id: string; business: string; owner: string; email: string; score: number; status: string; since: string;
}

const ASSIGNED_CLIENTS: AssignedClient[] = [
  { id: "1", business: "Apex Solutions Ltd", owner: "Jane Okonkwo",   email: "jane@apex.co.uk",       score: 92, status: "Active",  since: "10 Jan 2026" },
  { id: "2", business: "Nova Consulting UK", owner: "Daniel Obi",     email: "d@nova.co.uk",           score: 78, status: "Active",  since: "20 Feb 2026" },
  { id: "3", business: "Bright Path Ltd",    owner: "Chidi Eze",      email: "c@brightpath.co.uk",     score: 65, status: "Active",  since: "1 Mar 2026"  },
  { id: "4", business: "TechBridge NG Ltd",  owner: "Ade Adeyemi",    email: "ade@techbridge.ng",      score: 45, status: "Pending", since: "15 Jan 2026" },
  { id: "5", business: "Lagos First Capital",owner: "Emeka Nwosu",    email: "e@lagosfirst.ng",        score: 30, status: "Pending", since: "10 Mar 2026" },
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

export default function StaffClientsPage() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filtered = useMemo(() =>
    ASSIGNED_CLIENTS.filter((c) =>
      c.business.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
          <h1 className="text-2xl font-bold tracking-tight">My Clients</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Businesses assigned to your portfolio.</p>
        </div>

        {/* Search + count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border max-w-xs flex-1" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color: BRAND.muted }} />
            <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] flex-1" />
          </div>
          <span className="text-xs" style={{ color: BRAND.muted }}>{filtered.length} assigned</span>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Business", "Owner", "Email", "Score", "Status", "Assigned Since", ""].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const ss = statusStyle(c.status);
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td className="px-5 py-3.5 font-medium">{c.business}</td>
                      <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.8)" }}>{c.owner}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{c.email}</td>
                      <td className="px-5 py-3.5 font-bold" style={{ color: scoreColor(c.score) }}>{c.score}</td>
                      <td className="px-5 py-3.5"><span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span></td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{c.since}</td>
                      <td className="px-5 py-3.5">
                        <button type="button" onClick={() => toast({ title: `Viewing ${c.business} — detail view coming soon`, variant: "success" })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white/10"
                          style={{ borderColor: `${BRAND.accent}40`, color: BRAND.accent }}>
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No clients match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
