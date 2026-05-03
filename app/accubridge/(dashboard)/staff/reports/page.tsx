"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, DollarSign, CreditCard, Download, ChevronDown } from "lucide-react";
import { useToast } from "@/components/accubridge/shared/toast";
import { useGetClientsQuery } from "@/lib/accubridge/api/clientApi";
import {
  useLazyGetPnLReportQuery,
  useLazyGetBalanceSheetReportQuery,
  useLazyGetCashFlowReportQuery,
  ApiPnLReport,
  ApiBalanceSheetReport,
  ApiCashFlowReport,
  ReportPeriodParams,
} from "@/lib/accubridge/api/reportApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "13px",
  padding: "8px 12px",
  outline: "none",
  colorScheme: "dark",
};

const PERIODS = [
  { label: "Today",          value: 1 },
  { label: "This Week",      value: 2 },
  { label: "This Month",     value: 3 },
  { label: "This Quarter",   value: 4 },
  { label: "This Year",      value: 5 },
  { label: "Last Month",     value: 6 },
];

const REPORT_TYPES = [
  { id: "pnl",      label: "Profit & Loss",  icon: <TrendingUp size={24} />, color: "#06D6A0", desc: "Income vs expenses summary"    },
  { id: "balance",  label: "Balance Sheet",  icon: <DollarSign size={24} />, color: "#D4AF37", desc: "Assets, liabilities, equity"   },
  { id: "cashflow", label: "Cash Flow",      icon: <CreditCard size={24} />, color: "#3E92CC", desc: "Operating, investing, financing" },
  { id: "all",      label: "All Reports",    icon: <Download size={24} />,   color: "#a78bfa", desc: "Generate all three reports"    },
];

function ReportSection({ title, rows }: { title: string; rows: { description: string; formattedAmount: string; isTotal?: boolean }[] }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: BRAND.muted }}>{title}</div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center justify-between py-2 text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", fontWeight: r.isTotal ? 700 : 400, color: r.isTotal ? "white" : "rgba(255,255,255,0.75)" }}>
          <span>{r.description}</span>
          <span>{r.formattedAmount}</span>
        </div>
      ))}
    </div>
  );
}

function PnLView({ data, clientName }: { data: ApiPnLReport; clientName?: string }) {
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">Profit & Loss {clientName ? `— ${clientName}` : ""} — {data.period}</h3>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: data.isProfit ? "#06D6A0" : "#ef4444", backgroundColor: data.isProfit ? "rgba(6,214,160,0.1)" : "rgba(239,68,68,0.1)" }}>
          {data.netMarginLabel}
        </span>
      </div>
      <ReportSection title="Income" rows={[...data.incomeLines, data.totalIncomeLine]} />
      <ReportSection title="Expenses" rows={[...data.expenseLines, data.totalExpensesLine]} />
      <div className="flex items-center justify-between py-3 text-sm font-bold border-t" style={{ borderColor: "rgba(255,255,255,0.1)", color: data.isProfit ? "#06D6A0" : "#ef4444" }}>
        <span>{data.netProfitLine.description}</span>
        <span>{data.netProfitLine.formattedAmount}</span>
      </div>
    </div>
  );
}

function BalanceView({ data, clientName }: { data: ApiBalanceSheetReport; clientName?: string }) {
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">Balance Sheet {clientName ? `— ${clientName}` : ""} — {data.period}</h3>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: data.isBalanced ? "#06D6A0" : "#ef4444", backgroundColor: data.isBalanced ? "rgba(6,214,160,0.1)" : "rgba(239,68,68,0.1)" }}>
          {data.balanceStatusLabel}
        </span>
      </div>
      <ReportSection title="Current Assets"          rows={[...data.currentAssets,    { description: "Total Current Assets",           formattedAmount: data.formattedTotalCurrentAssets,          isTotal: true }]} />
      <ReportSection title="Non-Current Assets"      rows={[...data.nonCurrentAssets, { description: "Total Non-Current Assets",         formattedAmount: data.formattedTotalNonCurrentAssets,       isTotal: true }]} />
      <ReportSection title="Current Liabilities"     rows={[...data.currentLiabilities,    { description: "Total Current Liabilities",      formattedAmount: data.formattedTotalCurrentLiabilities,    isTotal: true }]} />
      <ReportSection title="Non-Current Liabilities" rows={[...data.nonCurrentLiabilities, { description: "Total Non-Current Liabilities",  formattedAmount: data.formattedTotalNonCurrentLiabilities, isTotal: true }]} />
      <ReportSection title="Equity"                  rows={[...data.equityLines, { description: "Total Equity", formattedAmount: data.formattedTotalEquityGrandTotal, isTotal: true }]} />
    </div>
  );
}

function CashFlowView({ data, clientName }: { data: ApiCashFlowReport; clientName?: string }) {
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">Cash Flow {clientName ? `— ${clientName}` : ""} — {data.period}</h3>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: data.isNetPositive ? "#06D6A0" : "#ef4444", backgroundColor: data.isNetPositive ? "rgba(6,214,160,0.1)" : "rgba(239,68,68,0.1)" }}>
          {data.isNetPositive ? "Net Positive" : "Net Negative"}
        </span>
      </div>
      <ReportSection title={data.operatingHeading}  rows={[...data.operatingActivities,  { description: data.operatingSubtotalLabel,  formattedAmount: data.formattedNetCashFromOperating,  isTotal: true }]} />
      <ReportSection title={data.investingHeading}  rows={[...data.investingActivities,  { description: data.investingSubtotalLabel,  formattedAmount: data.formattedNetCashFromInvesting,  isTotal: true }]} />
      <ReportSection title={data.financingHeading}  rows={[...data.financingActivities,  { description: data.financingSubtotalLabel,  formattedAmount: data.formattedNetCashFromFinancing,  isTotal: true }]} />
      <div className="mt-4 pt-3 border-t flex flex-col gap-1" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        {[
          { label: "Opening Balance", value: data.formattedOpeningCashBalance },
          { label: "Net Change",      value: data.formattedNetChangeInCash     },
          { label: "Closing Balance", value: data.formattedClosingCashBalance  },
        ].map((row) => (
          <div key={row.label} className="flex justify-between text-sm font-bold text-white py-1">
            <span>{row.label}</span><span>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StaffReportsPage() {
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery({ pageSize: 100 });
  const clients = clientsData?.clients ?? [];
  
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedType, setSelectedType] = useState("pnl");
  const [period, setPeriod]             = useState(3); // This Month
  const [generated, setGenerated]       = useState(false);

  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(String(clients[0].id));
    }
  }, [clients, selectedClientId]);

  const [triggerPnL,      { data: pnlData,      isFetching: pnlFetching }]     = useLazyGetPnLReportQuery();
  const [triggerBalance,  { data: balanceData,  isFetching: balanceFetching }]  = useLazyGetBalanceSheetReportQuery();
  const [triggerCashFlow, { data: cashFlowData, isFetching: cashFlowFetching }] = useLazyGetCashFlowReportQuery();

  const { toast } = useToast();

  const isGenerating = pnlFetching || balanceFetching || cashFlowFetching;
  const selectedClient = clients.find((c) => String(c.id) === selectedClientId);

  const handleGenerate = async () => {
    const params: ReportPeriodParams = { Period: period };
    setGenerated(false);
    try {
      if (selectedType === "pnl" || selectedType === "all") await triggerPnL(params);
      if (selectedType === "balance" || selectedType === "all") await triggerBalance(params);
      if (selectedType === "cashflow" || selectedType === "all") await triggerCashFlow(params);
      setGenerated(true);
      toast({ title: "Report generated", variant: "success" });
    } catch {
      toast({ title: "Failed to generate report", variant: "error" });
    }
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Generate financial reports for your clients.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Client selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide flex-shrink-0" style={{ color: BRAND.muted }}>Client</label>
            {clientsLoading
              ? <div className="h-10 w-52 animate-pulse rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
              : (
                <select value={selectedClientId} onChange={(e) => { setSelectedClientId(e.target.value); setGenerated(false); }}
                  style={inputStyle}>
                  {clients.map((c) => (
                    <option key={c.id} value={String(c.id)} style={{ backgroundColor: BRAND.primary }}>{c.businessName}</option>
                  ))}
                </select>
              )
            }
          </div>

          {/* Period selector */}
          <div className="relative">
            <select value={period} onChange={(e) => { setPeriod(Number(e.target.value)); setGenerated(false); }}
              className="border rounded-xl pl-3 pr-8 py-2.5 text-sm text-white outline-none appearance-none"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }}>
              {PERIODS.map((p) => <option key={p.value} value={p.value} style={{ background: "#0A2463" }}>{p.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: BRAND.muted }} />
          </div>
        </div>

        {/* Report type cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_TYPES.map((r) => {
            const active = selectedType === r.id;
            return (
              <button key={r.id} type="button" onClick={() => { setSelectedType(r.id); setGenerated(false); }}
                className="rounded-2xl p-5 border flex flex-col gap-4 text-left transition-all"
                style={{
                  backgroundColor: active ? `${r.color}12` : "rgba(255,255,255,0.04)",
                  borderColor:     active ? `${r.color}50` : "rgba(255,255,255,0.08)",
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${r.color}18`, color: r.color }}>{r.icon}</div>
                <div>
                  <div className="font-bold text-sm mb-1 text-white">{r.label}</div>
                  <div className="text-xs" style={{ color: BRAND.muted }}>{r.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Generate button */}
        <div>
          <button type="button" onClick={handleGenerate} disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
            {isGenerating ? "Generating…" : `Generate ${REPORT_TYPES.find((r) => r.id === selectedType)?.label}`}
          </button>
        </div>

        {/* Report results */}
        {generated && (
          <div className="flex flex-col gap-5">
            {(selectedType === "pnl" || selectedType === "all") && pnlData && <PnLView data={pnlData} clientName={selectedClient?.businessName} />}
            {(selectedType === "balance" || selectedType === "all") && balanceData && <BalanceView data={balanceData} clientName={selectedClient?.businessName} />}
            {(selectedType === "cashflow" || selectedType === "all") && cashFlowData && <CashFlowView data={cashFlowData} clientName={selectedClient?.businessName} />}
          </div>
        )}

      </div>
    </div>
  );
}
