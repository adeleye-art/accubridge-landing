"use client";

import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportTable } from "@/components/reports/report-table";
import type { ReportRow } from "@/components/reports/report-table";
import { SummaryStatCards } from "@/components/reports/summary-stat-cards";
import { calculatePnL } from "@/lib/reports/report-calculations";
import { exportPnLToPDF } from "@/lib/reports/generate-pdf";
import { exportPnLToCSV, exportPnLToXLSX } from "@/lib/reports/generate-excel";
import type { ReportDateRange } from "@/types/reports";

const BRAND = { green: "#06D6A0", gold: "#D4AF37", muted: "#6B7280" };

function fmt(v: number) {
  return `£${Math.abs(v).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
}

function buildPnLRows(report: ReturnType<typeof calculatePnL>): ReportRow[] {
  const isProfit = report.net_profit >= 0;
  return [
    { label: "INCOME", isSectionHeader: true },
    ...report.income.items.map((i) => ({ label: i.label, value: i.amount, indent: 1 as const, valueColor: BRAND.green })),
    { label: report.income.totalLabel, value: report.income.total, isTotal: true, valueColor: BRAND.green },
    { label: "", noBorder: true },

    { label: "EXPENSES", isSectionHeader: true },
    ...report.expenses.items.map((i) => ({ label: i.label, value: i.amount, indent: 1 as const, valueColor: "#ef4444" })),
    { label: report.expenses.totalLabel, value: report.expenses.total, isTotal: true, valueColor: "#ef4444" },
    { label: "", noBorder: true },

    {
      label: "NET PROFIT / (LOSS)",
      value: report.net_profit,
      isGrandTotal: true,
      valueColor: isProfit ? BRAND.green : "#ef4444",
    },
  ];
}

export default function ProfitLossPage() {
  return (
    <ReportPageShell
      label="Reports"
      title="Profit & Loss"
      subtitle="Income vs expenses — see exactly what your business earned and spent over a period"
      downloadLabel="Download P&L"
      reviewedBy="Sarah Merchant, ACCA"
      onDownloadPDF={(range) => exportPnLToPDF(calculatePnL(range), `pnl-${range.from}-to-${range.to}.pdf`)}
      onDownloadCSV={(range) => exportPnLToCSV(calculatePnL(range), `pnl-${range.from}-to-${range.to}.csv`)}
      onDownloadXLSX={(range) => exportPnLToXLSX(calculatePnL(range), `pnl-${range.from}-to-${range.to}.xlsx`)}
    >
      {(range: ReportDateRange) => {
        const report   = calculatePnL(range);
        const isProfit = report.net_profit >= 0;

        return (
          <div className="flex flex-col gap-5">
            <SummaryStatCards
              stats={[
                { label: "Total Income",      value: fmt(report.income.total),    color: BRAND.green,                          icon: <TrendingUp size={16} />   },
                { label: "Total Expenses",    value: fmt(report.expenses.total),  color: "#ef4444",                            icon: <TrendingDown size={16} />  },
                { label: "Net Profit / Loss", value: fmt(report.net_profit),      color: isProfit ? BRAND.green : "#ef4444",   icon: <DollarSign size={16} />   },
                { label: "Net Margin",        value: `${report.net_margin_percent}%`, color: BRAND.gold,                       icon: <Percent size={16} />      },
              ]}
            />
            <ReportTable rows={buildPnLRows(report)} />
            <p className="text-xs text-center" style={{ color: BRAND.muted }}>
              Period: {report.period_label}
              {report.reviewed_by && ` · Reviewed by ${report.reviewed_by}`}
            </p>
          </div>
        );
      }}
    </ReportPageShell>
  );
}
