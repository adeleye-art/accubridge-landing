"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, FileText, Table, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ReportToolbar } from "@/components/reports/report-toolbar";
import type { ReportPeriod, ReportDateRange } from "@/types/reports";
import { getPeriodRange, calculatePnL, calculateBalanceSheet, calculateCashFlow } from "@/lib/reports/report-calculations";
import { exportPnLToPDF, exportBalanceSheetToPDF, exportCashFlowToPDF } from "@/lib/reports/generate-pdf";
import { exportPnLToCSV, exportPnLToXLSX, exportBalanceSheetToCSV, exportBalanceSheetToXLSX, exportCashFlowToCSV, exportCashFlowToXLSX } from "@/lib/reports/generate-excel";

const BRAND = { gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type DownloadFormat = "pdf" | "csv" | "xlsx";

const FORMAT_CONFIG: Record<DownloadFormat, {
  label: string; icon: React.ReactNode;
  bg: string; color: string; border: string; hover: string; desc: string;
}> = {
  pdf:  { label: "PDF",  icon: <FileText size={14} />,       bg: "rgba(239,68,68,0.12)",   color: "#ef4444",  border: "rgba(239,68,68,0.25)",   hover: "rgba(239,68,68,0.22)",   desc: "Branded A4 with AccuBridge header & accountant stamp" },
  csv:  { label: "CSV",  icon: <Table size={14} />,          bg: "rgba(6,214,160,0.12)",   color: BRAND.green,border: "rgba(6,214,160,0.25)",   hover: "rgba(6,214,160,0.22)",   desc: "Plain text — opens in any spreadsheet or text editor" },
  xlsx: { label: "XLSX", icon: <FileSpreadsheet size={14} />,bg: "rgba(62,146,204,0.12)",  color: BRAND.accent,border:"rgba(62,146,204,0.25)",  hover: "rgba(62,146,204,0.22)",  desc: "Microsoft Excel workbook with formatted columns" },
};

const REPORT_ITEMS = [
  { id: "pnl",      label: "Profit & Loss",       href: "/client/reports/pnl"      },
  { id: "balance",  label: "Balance Sheet",        href: "/client/reports/balance"  },
  { id: "cashflow", label: "Cash Flow Statement",  href: "/client/reports/cashflow" },
];

async function runDownload(reportId: string, format: DownloadFormat, range: ReportDateRange) {
  const suffix = `${range.from}-to-${range.to}`;
  if (reportId === "pnl") {
    const r = calculatePnL(range);
    if (format === "pdf")  return exportPnLToPDF(r,  `pnl-${suffix}.pdf`);
    if (format === "csv")  return exportPnLToCSV(r,  `pnl-${suffix}.csv`);
    if (format === "xlsx") return exportPnLToXLSX(r, `pnl-${suffix}.xlsx`);
  }
  if (reportId === "balance") {
    const r = calculateBalanceSheet(range.to);
    if (format === "pdf")  return exportBalanceSheetToPDF(r,  `balance-sheet-${range.to}.pdf`);
    if (format === "csv")  return exportBalanceSheetToCSV(r,  `balance-sheet-${range.to}.csv`);
    if (format === "xlsx") return exportBalanceSheetToXLSX(r, `balance-sheet-${range.to}.xlsx`);
  }
  if (reportId === "cashflow") {
    const r = calculateCashFlow(range);
    if (format === "pdf")  return exportCashFlowToPDF(r,  `cash-flow-${suffix}.pdf`);
    if (format === "csv")  return exportCashFlowToCSV(r,  `cash-flow-${suffix}.csv`);
    if (format === "xlsx") return exportCashFlowToXLSX(r, `cash-flow-${suffix}.xlsx`);
  }
}

export default function DownloadReportsPage() {
  const [period, setPeriod]           = useState<ReportPeriod>("this_month");
  const [customRange, setCustomRange] = useState<ReportDateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    to:   new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading]     = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());

  const getRange = (): ReportDateRange =>
    period === "custom" ? customRange : getPeriodRange(period);

  const handleDownload = async (reportId: string, format: DownloadFormat) => {
    const key = `${reportId}-${format}`;
    setLoading(key);
    try {
      await runDownload(reportId, format, getRange());
      setDownloaded((prev) => new Set(prev).add(key));
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadAll = async (format: DownloadFormat) => {
    setLoading(`all-${format}`);
    for (const item of REPORT_ITEMS) {
      await runDownload(item.id, format, getRange());
      setDownloaded((prev) => new Set(prev).add(`${item.id}-${format}`));
      await new Promise((res) => setTimeout(res, 200));
    }
    setLoading(null);
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-4xl mx-auto">

        {/* Back link */}
        <div className="mb-4">
          <Link
            href="/client/reports"
            className="inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
            style={{ color: BRAND.accent }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = BRAND.accent; }}
          >
            <ChevronLeft size={15} />
            Back to Reports
          </Link>
        </div>

        <PageHeader
          badge="Reports"
          title="Download Reports"
          description="Export all financial reports for a selected period in your preferred format"
        />

        <ReportToolbar
          period={period}
          customRange={customRange}
          reviewedBy="Sarah Merchant, ACCA"
          hideGenerateButton
          onPeriodChange={setPeriod}
          onCustomRangeChange={setCustomRange}
          onGenerate={() => {}}
        />

        {/* Download all row */}
        <div
          className="rounded-2xl border p-4 mb-5 flex flex-wrap items-center gap-3"
          style={{ backgroundColor: `${BRAND.gold}08`, borderColor: `${BRAND.gold}25` }}
        >
          <div className="flex items-center gap-2 flex-shrink-0">
            <Download size={15} style={{ color: BRAND.gold }} />
            <span className="text-sm font-semibold" style={{ color: BRAND.gold }}>Download All</span>
          </div>
          <div className="flex gap-2 ml-auto flex-wrap">
            {(["pdf", "csv", "xlsx"] as DownloadFormat[]).map((f) => {
              const cfg = FORMAT_CONFIG[f];
              const key = `all-${f}`;
              return (
                <button key={f} type="button" onClick={() => handleDownloadAll(f)}
                  disabled={!!loading}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-bold border transition-all duration-200"
                  style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = cfg.hover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = cfg.bg; }}
                >
                  {loading === key ? <Loader2 size={12} className="animate-spin" /> : cfg.icon}
                  All as {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Individual rows */}
        <div className="flex flex-col gap-3">
          {REPORT_ITEMS.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{report.label}</span>
                <Link
                  href={report.href}
                  className="text-[11px] underline transition-colors duration-200"
                  style={{ color: BRAND.accent }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = BRAND.accent; }}
                >
                  View →
                </Link>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(["pdf", "csv", "xlsx"] as DownloadFormat[]).map((f) => {
                  const cfg  = FORMAT_CONFIG[f];
                  const key  = `${report.id}-${f}`;
                  const done = downloaded.has(key);
                  return (
                    <button key={f} type="button" onClick={() => handleDownload(report.id, f)}
                      disabled={!!loading}
                      className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold border transition-all duration-200"
                      style={{
                        backgroundColor: done ? `${BRAND.green}12` : cfg.bg,
                        color:           done ? BRAND.green         : cfg.color,
                        borderColor:     done ? `${BRAND.green}30`  : cfg.border,
                      }}
                      onMouseEnter={(e) => { if (!done) e.currentTarget.style.backgroundColor = cfg.hover; }}
                      onMouseLeave={(e) => { if (!done) e.currentTarget.style.backgroundColor = done ? `${BRAND.green}12` : cfg.bg; }}
                    >
                      {loading === key ? <Loader2 size={11} className="animate-spin" /> : done ? <CheckCircle2 size={11} /> : cfg.icon}
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Format guide */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["pdf", "csv", "xlsx"] as DownloadFormat[]).map((f) => {
            const cfg = FORMAT_CONFIG[f];
            return (
              <div key={f} className="rounded-xl border p-3 flex items-start gap-2"
                style={{ backgroundColor: `${cfg.color}06`, borderColor: `${cfg.color}15` }}>
                <span className="flex-shrink-0 mt-0.5" style={{ color: cfg.color }}>{cfg.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{cfg.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
