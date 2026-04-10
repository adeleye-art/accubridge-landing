"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp, DollarSign, BarChart3,
  FileText, Table, FileSpreadsheet, Loader2, RefreshCw,
  CheckCircle2, Calendar, AlertCircle, Download,
} from "lucide-react";
import { useGetClientsQuery } from "@/lib/api/clientApi";
import {
  useGetAdminReportsOverviewQuery,
  useGetPnLReportQuery,
  useGetBalanceSheetReportQuery,
  useGetCashFlowReportQuery,
  type ApiPnLReport,
  type ApiBalanceSheetReport,
  type ApiCashFlowReport,
} from "@/lib/api/reportApi";
import { exportPnLToPDF, exportBalanceSheetToPDF, exportCashFlowToPDF } from "@/lib/reports/generate-pdf";
import { exportPnLToCSV, exportPnLToXLSX, exportBalanceSheetToCSV, exportBalanceSheetToXLSX, exportCashFlowToCSV, exportCashFlowToXLSX } from "@/lib/reports/generate-excel";
import { getPeriodRange } from "@/lib/reports/report-calculations";
import { useCurrency } from "@/lib/currency-context";
import type { ReportPeriod, ReportDateRange, PnLReport, BalanceSheetReport, CashFlowReport } from "@/types/reports";
import type { SupportedCurrency } from "@/lib/currency";

const BRAND = { gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type ReportId    = "pnl" | "balance" | "cashflow";
type DownloadFmt = "pdf" | "csv" | "xlsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/[^0-9.-]/g, "")) || 0;
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

function adaptPnL(api: ApiPnLReport): PnLReport {
  return {
    income: {
      title: "Income", totalLabel: "Total Income",
      total: parseAmount(api.formattedTotalIncome),
      items: api.incomeLines.map((l) => ({ label: l.description, amount: parseAmount(l.formattedAmount) })),
    },
    expenses: {
      title: "Expenses", totalLabel: "Total Expenses",
      total: parseAmount(api.formattedTotalExpenses),
      items: api.expenseLines.map((l) => ({ label: l.description, amount: parseAmount(l.formattedAmount) })),
    },
    net_profit: parseAmount(api.formattedNetProfitOrLoss) * (api.isProfit ? 1 : -1),
    net_margin_percent: parseFloat(api.netMarginLabel) || 0,
    period_label: api.period,
  };
}

function adaptBalanceSheet(api: ApiBalanceSheetReport): BalanceSheetReport {
  const toItems = (entries: ApiBalanceSheetReport["currentAssets"]) =>
    [...entries].sort((a, b) => a.orderIndex - b.orderIndex)
      .map((e) => ({ label: e.description, amount: parseAmount(e.formattedAmount) }));
  return {
    assets: {
      current:     { title: "Current Assets",     totalLabel: "Total Current Assets",     total: parseAmount(api.formattedTotalCurrentAssets),    items: toItems(api.currentAssets)    },
      non_current: { title: "Non-Current Assets", totalLabel: "Total Non-Current Assets", total: parseAmount(api.formattedTotalNonCurrentAssets), items: toItems(api.nonCurrentAssets) },
      total_assets: parseAmount(api.formattedTotalAssets),
    },
    liabilities: {
      current:     { title: "Current Liabilities",     totalLabel: "Total Current Liabilities",     total: parseAmount(api.formattedTotalCurrentLiabilities),    items: toItems(api.currentLiabilities)    },
      non_current: { title: "Non-Current Liabilities", totalLabel: "Total Non-Current Liabilities", total: parseAmount(api.formattedTotalNonCurrentLiabilities), items: toItems(api.nonCurrentLiabilities) },
      total_liabilities: parseAmount(api.formattedTotalLiabilities),
    },
    equity:                       { items: toItems(api.equityLines), total_equity: parseAmount(api.formattedTotalEquity) },
    total_liabilities_and_equity: parseAmount(api.formattedTotalLiabilitiesAndEquity),
    is_balanced: api.isBalanced,
    as_of_date:  api.asAtDate,
  };
}

function adaptCashFlow(api: ApiCashFlowReport): CashFlowReport {
  const toItems = (entries: ApiCashFlowReport["operatingActivities"]) =>
    [...entries].sort((a, b) => a.orderIndex - b.orderIndex)
      .map((e) => ({ label: e.description, amount: parseAmount(e.formattedAmount) }));
  return {
    opening_balance: parseAmount(api.formattedOpeningCashBalance),
    operating:  { subtitle: "cash from core business",    totalLabel: api.operatingSubtotalLabel, total: parseAmount(api.formattedNetCashFromOperating), items: toItems(api.operatingActivities) },
    investing:  { subtitle: "asset purchases & proceeds", totalLabel: api.investingSubtotalLabel, total: parseAmount(api.formattedNetCashFromInvesting), items: toItems(api.investingActivities) },
    financing:  { subtitle: "loans, equity & dividends",  totalLabel: api.financingSubtotalLabel, total: parseAmount(api.formattedNetCashFromFinancing), items: toItems(api.financingActivities) },
    net_change:      parseAmount(api.formattedNetChangeInCash) * (api.isNetPositive ? 1 : -1),
    closing_balance: parseAmount(api.formattedClosingCashBalance),
    period_label:    api.period,
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const REPORT_META: Record<ReportId, { label: string; icon: React.ReactNode; color: string }> = {
  pnl:      { label: "Profit & Loss",       icon: <TrendingUp size={18} />, color: BRAND.green  },
  balance:  { label: "Balance Sheet",       icon: <DollarSign size={18} />, color: BRAND.accent },
  cashflow: { label: "Cash Flow Statement", icon: <BarChart3 size={18} />,  color: BRAND.gold   },
};

const FORMAT_META: Record<DownloadFmt, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  pdf:  { label: "PDF",  icon: <FileText size={13} />,        color: "#ef4444",   bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)"   },
  csv:  { label: "CSV",  icon: <Table size={13} />,           color: BRAND.green, bg: "rgba(6,214,160,0.12)",  border: "rgba(6,214,160,0.3)"   },
  xlsx: { label: "XLSX", icon: <FileSpreadsheet size={13} />, color: BRAND.accent,bg: "rgba(62,146,204,0.12)", border: "rgba(62,146,204,0.3)"  },
};

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: "this_month",   label: "This Month"   },
  { value: "last_month",   label: "Last Month"   },
  { value: "this_quarter", label: "This Quarter" },
  { value: "last_quarter", label: "Last Quarter" },
  { value: "this_year",    label: "This Year"    },
  { value: "last_year",    label: "Last Year"    },
  { value: "custom",       label: "Custom Range" },
];

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

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ""}`} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />;
}

// ─── Report Card Shell ────────────────────────────────────────────────────────

interface CardProps {
  meta: { label: string; icon: React.ReactNode; color: string };
  isLoading: boolean;
  isError: boolean;
  isReady: boolean;
  summary: { label: string; value: string; color: string }[];
  period?: string;
  dlLoading: DownloadFmt | null;
  onDownload: (fmt: DownloadFmt) => void;
}

function ReportCard({ meta, isLoading, isError, isReady, summary, period, dlLoading, onDownload }: CardProps) {
  return (
    <div className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: `${meta.color}20` }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
            {meta.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{meta.label}</p>
            {period && <p className="text-[11px]" style={{ color: BRAND.muted }}>{period}</p>}
          </div>
        </div>
        {isReady && (
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border"
            style={{ backgroundColor: `${BRAND.green}10`, borderColor: `${BRAND.green}25`, color: BRAND.green }}>
            <CheckCircle2 size={11} /> Ready to download
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-4 justify-center">
          <Loader2 size={18} className="animate-spin" style={{ color: meta.color }} />
          <span className="text-sm" style={{ color: BRAND.muted }}>Generating report…</span>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 py-4 justify-center">
          <AlertCircle size={18} style={{ color: "#ef4444" }} />
          <span className="text-sm" style={{ color: BRAND.muted }}>Failed to load. Please regenerate.</span>
        </div>
      )}

      {isReady && summary.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summary.map((s) => (
            <div key={s.label} className="rounded-xl border px-3 py-2.5"
              style={{ backgroundColor: `${s.color}08`, borderColor: `${s.color}18` }}>
              <p className="text-[10px] mb-1" style={{ color: BRAND.muted }}>{s.label}</p>
              <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {isReady && (
        <div className="flex items-center gap-2 pt-1 border-t flex-wrap" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <span className="text-xs mr-1" style={{ color: BRAND.muted }}>Download as:</span>
          {(["pdf", "csv", "xlsx"] as DownloadFmt[]).map((fmt) => {
            const fm = FORMAT_META[fmt];
            const loading = dlLoading === fmt;
            return (
              <button key={fmt} type="button" disabled={!!dlLoading} onClick={() => onDownload(fmt)}
                className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-bold border transition-opacity duration-150 disabled:opacity-50"
                style={{ backgroundColor: fm.bg, color: fm.color, borderColor: fm.border }}>
                {loading ? <Loader2 size={12} className="animate-spin" /> : fm.icon}
                {fm.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Download Cards ───────────────────────────────────────────────────────────

interface DownloadCardProps {
  activeRange: ReportDateRange;
  clientName: string;
  currency: SupportedCurrency;
}

function PnLDownloadCard({ activeRange, clientName, currency }: DownloadCardProps) {
  const [dlLoading, setDlLoading] = useState<DownloadFmt | null>(null);
  const { data, isLoading, isError } = useGetPnLReportQuery({
    Period: 7, CustomFrom: activeRange.from, CustomTo: activeRange.to,
  });

  const download = async (fmt: DownloadFmt) => {
    if (!data) return;
    const suffix = `${clientName.replace(/\s+/g, "-")}-${activeRange.from}-to-${activeRange.to}`;
    setDlLoading(fmt);
    const r = adaptPnL(data);
    if (fmt === "pdf")  await exportPnLToPDF(r, `pnl-${suffix}.pdf`, currency);
    if (fmt === "csv")  exportPnLToCSV(r, `pnl-${suffix}.csv`);
    if (fmt === "xlsx") exportPnLToXLSX(r, `pnl-${suffix}.xlsx`);
    setDlLoading(null);
  };

  return (
    <ReportCard meta={REPORT_META.pnl} isLoading={isLoading} isError={isError} isReady={!!data}
      summary={data ? [
        { label: "Total Income",   value: data.formattedTotalIncome,     color: BRAND.green  },
        { label: "Total Expenses", value: data.formattedTotalExpenses,   color: "#ef4444"    },
        { label: "Net Profit",     value: data.formattedNetProfitOrLoss, color: data.isProfit ? BRAND.green : "#ef4444" },
        { label: "Net Margin",     value: data.netMarginLabel,           color: BRAND.gold   },
      ] : []}
      period={data?.period} dlLoading={dlLoading} onDownload={download}
    />
  );
}

function BalanceDownloadCard({ activeRange, clientName, currency }: DownloadCardProps) {
  const [dlLoading, setDlLoading] = useState<DownloadFmt | null>(null);
  const { data, isLoading, isError } = useGetBalanceSheetReportQuery({
    Period: 7, CustomFrom: activeRange.from, CustomTo: activeRange.to,
  });

  const download = async (fmt: DownloadFmt) => {
    if (!data) return;
    const suffix = `${clientName.replace(/\s+/g, "-")}-${activeRange.to}`;
    setDlLoading(fmt);
    const r = adaptBalanceSheet(data);
    if (fmt === "pdf")  await exportBalanceSheetToPDF(r, `balance-sheet-${suffix}.pdf`, currency);
    if (fmt === "csv")  exportBalanceSheetToCSV(r, `balance-sheet-${suffix}.csv`);
    if (fmt === "xlsx") exportBalanceSheetToXLSX(r, `balance-sheet-${suffix}.xlsx`);
    setDlLoading(null);
  };

  return (
    <ReportCard meta={REPORT_META.balance} isLoading={isLoading} isError={isError} isReady={!!data}
      summary={data ? [
        { label: "Total Assets",      value: data.formattedTotalAssets,      color: BRAND.green  },
        { label: "Total Liabilities", value: data.formattedTotalLiabilities, color: "#ef4444"    },
        { label: "Total Equity",      value: data.formattedTotalEquity,      color: BRAND.accent },
        { label: "Balance",           value: data.balanceStatusLabel,        color: data.isBalanced ? BRAND.green : "#ef4444" },
      ] : []}
      period={data?.period} dlLoading={dlLoading} onDownload={download}
    />
  );
}

function CashFlowDownloadCard({ activeRange, clientName, currency }: DownloadCardProps) {
  const [dlLoading, setDlLoading] = useState<DownloadFmt | null>(null);
  const { data, isLoading, isError } = useGetCashFlowReportQuery({
    Period: 7, CustomFrom: activeRange.from, CustomTo: activeRange.to,
  });

  const download = async (fmt: DownloadFmt) => {
    if (!data) return;
    const suffix = `${clientName.replace(/\s+/g, "-")}-${activeRange.from}-to-${activeRange.to}`;
    setDlLoading(fmt);
    const r = adaptCashFlow(data);
    if (fmt === "pdf")  await exportCashFlowToPDF(r, `cash-flow-${suffix}.pdf`, currency);
    if (fmt === "csv")  exportCashFlowToCSV(r, `cash-flow-${suffix}.csv`);
    if (fmt === "xlsx") exportCashFlowToXLSX(r, `cash-flow-${suffix}.xlsx`);
    setDlLoading(null);
  };

  return (
    <ReportCard meta={REPORT_META.cashflow} isLoading={isLoading} isError={isError} isReady={!!data}
      summary={data ? [
        { label: "Opening Balance",    value: data.formattedOpeningCashBalance,   color: BRAND.accent },
        { label: "Net from Operating", value: data.formattedNetCashFromOperating, color: data.isNetPositive ? BRAND.green : "#ef4444" },
        { label: "Net Change",         value: data.formattedNetChangeInCash,      color: data.isNetPositive ? BRAND.green : "#ef4444" },
        { label: "Closing Balance",    value: data.formattedClosingCashBalance,   color: BRAND.gold   },
      ] : []}
      period={data?.period} dlLoading={dlLoading} onDownload={download}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ALL_REPORTS: ReportId[] = ["pnl", "balance", "cashflow"];

export default function AdminReportsPage() {
  const { currency } = useCurrency();
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery({ pageSize: 100 });
  const { data: overview, isLoading: overviewLoading } = useGetAdminReportsOverviewQuery();

  const clients = clientsData?.clients ?? [];
  const recentlyGenerated = overview?.recentlyGenerated ?? [];

  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [period, setPeriod] = useState<ReportPeriod>("this_month");
  const [customRange, setCustomRange] = useState<ReportDateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    to:   new Date().toISOString().split("T")[0],
  });
  const [selected, setSelected] = useState<Set<ReportId>>(new Set(ALL_REPORTS));
  const [activeRange, setActiveRange] = useState<ReportDateRange | null>(null);

  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(String(clients[0].id));
    }
  }, [clients, selectedClientId]);

  const selectedClient = clients.find((c) => String(c.id) === selectedClientId);

  const toggleReport = (id: ReportId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleGenerate = () => {
    if (!selectedClientId) return;
    const range = period === "custom" ? customRange : getPeriodRange(period);
    setActiveRange(range);
  };

  const canGenerate = selected.size > 0 && !!selectedClientId;

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Generate and download financial reports for any client account.</p>
        </div>

        {/* ── Step 1: Configure ── */}
        <div className="rounded-2xl border p-5 flex flex-col gap-5"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>
            Step 1 — Configure
          </p>

          {/* Client selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs font-semibold uppercase tracking-wide flex-shrink-0" style={{ color: BRAND.muted }}>Client</label>
            {clientsLoading
              ? <Skeleton className="h-10 w-52" />
              : (
                <select value={selectedClientId} onChange={(e) => { setSelectedClientId(e.target.value); setActiveRange(null); }}
                  style={inputStyle}>
                  {clients.map((c) => (
                    <option key={c.id} value={String(c.id)} style={{ backgroundColor: BRAND.primary }}>{c.businessName}</option>
                  ))}
                </select>
              )
            }
          </div>

          {/* Report toggles */}
          <div className="flex flex-col gap-2">
            <p className="text-xs" style={{ color: BRAND.muted }}>Select reports to generate</p>
            <div className="flex flex-wrap gap-2">
              {ALL_REPORTS.map((id) => {
                const m = REPORT_META[id];
                const on = selected.has(id);
                return (
                  <button key={id} type="button" onClick={() => toggleReport(id)}
                    className="flex items-center gap-2 px-4 h-9 rounded-xl border text-xs font-semibold transition-all duration-150"
                    style={{
                      backgroundColor: on ? `${m.color}18` : "rgba(255,255,255,0.04)",
                      borderColor:     on ? `${m.color}40` : "rgba(255,255,255,0.1)",
                      color:           on ? m.color        : "rgba(255,255,255,0.4)",
                    }}>
                    {on && <CheckCircle2 size={13} />}
                    {m.icon}
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Period selector + Generate */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Calendar size={14} style={{ color: BRAND.muted }} />
              <select value={period} onChange={(e) => setPeriod(e.target.value as ReportPeriod)} style={inputStyle}>
                {PERIOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} style={{ backgroundColor: BRAND.primary }}>{o.label}</option>
                ))}
              </select>
            </div>

            {period === "custom" && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: BRAND.muted }}>From</span>
                <input type="date" value={customRange.from} style={inputStyle}
                  onChange={(e) => setCustomRange((r) => ({ ...r, from: e.target.value }))} />
                <span className="text-xs" style={{ color: BRAND.muted }}>To</span>
                <input type="date" value={customRange.to} style={inputStyle}
                  onChange={(e) => setCustomRange((r) => ({ ...r, to: e.target.value }))} />
              </div>
            )}

            <button type="button" disabled={!canGenerate} onClick={handleGenerate}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-opacity duration-150 disabled:opacity-40 ml-auto"
              style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
              <RefreshCw size={14} />
              {activeRange ? "Regenerate" : "Generate Reports"}
            </button>
          </div>
        </div>

        {/* ── Step 2: Download ── */}
        {!activeRange && (
          <div className="rounded-2xl border p-8 flex flex-col items-center gap-3 text-center"
            style={{ borderColor: "rgba(255,255,255,0.07)", borderStyle: "dashed", backgroundColor: "rgba(255,255,255,0.02)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${BRAND.gold}12` }}>
              <Download size={22} style={{ color: BRAND.gold }} />
            </div>
            <p className="text-sm font-semibold text-white">No reports generated yet</p>
            <p className="text-xs max-w-xs" style={{ color: BRAND.muted }}>
              Select a client, choose report types and a period, then click{" "}
              <strong style={{ color: BRAND.gold }}>Generate Reports</strong>.
            </p>
          </div>
        )}

        {activeRange && selectedClient && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>Step 2 — Download</p>
              <p className="text-xs" style={{ color: BRAND.muted }}>for <span style={{ color: "rgba(255,255,255,0.7)" }}>{selectedClient.businessName}</span></p>
            </div>
            {selected.has("pnl")      && <PnLDownloadCard      activeRange={activeRange} clientName={selectedClient.businessName} currency={currency} />}
            {selected.has("balance")  && <BalanceDownloadCard   activeRange={activeRange} clientName={selectedClient.businessName} currency={currency} />}
            {selected.has("cashflow") && <CashFlowDownloadCard  activeRange={activeRange} clientName={selectedClient.businessName} currency={currency} />}
          </div>
        )}

        {/* Recently generated */}
        <div>
          <h2 className="font-bold text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>RECENTLY GENERATED</h2>
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Client", "Report Type", "Generated By", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overviewLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        {Array.from({ length: 4 }).map((__, j) => (
                          <td key={j} className="px-5 py-4"><div className="animate-pulse rounded h-4 w-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} /></td>
                        ))}
                      </tr>
                    ))
                  : recentlyGenerated.map((r, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className="px-5 py-3.5 font-medium">{r.clientName}</td>
                        <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.7)" }}>{r.reportType}</td>
                        <td className="px-5 py-3.5" style={{ color: BRAND.muted }}>{r.generatedBy}</td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{r.dateFormatted}</td>
                      </tr>
                    ))
                }
                {!overviewLoading && recentlyGenerated.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: BRAND.muted }}>No reports generated yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
