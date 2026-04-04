"use client";

import React, { useState } from "react";
import { TrendingUp, DollarSign, CreditCard, Download } from "lucide-react";
import { useToast } from "@/components/shared/toast";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const ASSIGNED_CLIENTS = [
  "Apex Solutions Ltd", "Nova Consulting UK", "Bright Path Ltd",
  "TechBridge NG Ltd", "Lagos First Capital",
];

const REPORT_TYPES = [
  { id: "pnl",      label: "Profit & Loss",  icon: <TrendingUp size={24} />, color: "#06D6A0", desc: "Income vs expenses summary"   },
  { id: "balance",  label: "Balance Sheet",  icon: <DollarSign size={24} />, color: "#D4AF37", desc: "Assets, liabilities, equity"  },
  { id: "cashflow", label: "Cash Flow",      icon: <CreditCard size={24} />, color: "#3E92CC", desc: "Operating, investing, financing" },
  { id: "download", label: "All Reports",    icon: <Download size={24} />,   color: "#a78bfa", desc: "Export a full report package"  },
];

const RECENT_REPORTS = [
  { client: "Apex Solutions Ltd", type: "Profit & Loss", date: "3 Apr 2026" },
  { client: "Bright Path Ltd",    type: "Balance Sheet", date: "2 Apr 2026" },
  { client: "Nova Consulting UK", type: "Cash Flow",     date: "1 Apr 2026" },
];

export default function StaffReportsPage() {
  const [selectedClient, setSelectedClient] = useState(ASSIGNED_CLIENTS[0]);
  const [generating, setGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = (type: string, label: string) => {
    setGenerating(type);
    setTimeout(() => {
      setGenerating(null);
      toast({ title: `${label} generated for ${selectedClient}`, variant: "success" });
    }, 1500);
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Generate financial reports for your assigned clients.</p>
        </div>

        {/* Client selector */}
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Generate for:</label>
          <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
            className="border rounded-xl px-3 py-2.5 text-sm text-white outline-none"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }}>
            {ASSIGNED_CLIENTS.map((c) => <option key={c} value={c} style={{ background: "#0A2463" }}>{c}</option>)}
          </select>
        </div>

        {/* Report type cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_TYPES.map((r) => (
            <div key={r.id} className="rounded-2xl p-5 border flex flex-col gap-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${r.color}18`, color: r.color }}>{r.icon}</div>
              <div>
                <div className="font-bold text-sm mb-1">{r.label}</div>
                <div className="text-xs" style={{ color: BRAND.muted }}>{r.desc}</div>
              </div>
              <button type="button" onClick={() => handleGenerate(r.id, r.label)} disabled={generating === r.id}
                className="w-full py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: r.color, color: BRAND.primary, opacity: generating === r.id ? 0.7 : 1 }}>
                {generating === r.id ? "Generating..." : "Generate"}
              </button>
            </div>
          ))}
        </div>

        {/* Recent reports */}
        <div>
          <h2 className="font-bold text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>RECENTLY GENERATED</h2>
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Client", "Report Type", "Date", "Download"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_REPORTS.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-5 py-3.5 font-medium">{r.client}</td>
                    <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.7)" }}>{r.type}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{r.date}</td>
                    <td className="px-5 py-3.5">
                      <button type="button" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: BRAND.accent }}>
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
