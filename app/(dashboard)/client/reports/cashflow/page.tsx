"use client";

import React from "react";
import { Wallet, ArrowUpRight, TrendingUp, Banknote } from "lucide-react";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportTable } from "@/components/reports/report-table";
import type { ReportRow } from "@/components/reports/report-table";
import { SummaryStatCards } from "@/components/reports/summary-stat-cards";
import { calculateCashFlow } from "@/lib/reports/report-calculations";
import { exportCashFlowToPDF } from "@/lib/reports/generate-pdf";
import { exportCashFlowToCSV, exportCashFlowToXLSX } from "@/lib/reports/generate-excel";
import type { ReportDateRange } from "@/types/reports";
import { useCurrency } from "@/lib/currency-context";

const BRAND = { green: "#06D6A0", gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280" };

function buildCashFlowRows(report: ReturnType<typeof calculateCashFlow>): ReportRow[] {
  return [
    { label: "Opening Cash Balance", value: report.opening_balance, isSubtotal: true, valueColor: BRAND.accent },
    { label: "", noBorder: true },

    { label: `OPERATING ACTIVITIES — ${report.operating.subtitle}`, isSectionHeader: true },
    ...report.operating.items.map((i) => ({
      label: i.label, value: i.amount, indent: 1 as const,
      valueColor: i.amount >= 0 ? BRAND.green : "#ef4444",
    })),
    { label: report.operating.totalLabel, value: report.operating.total, isTotal: true, valueColor: report.operating.total >= 0 ? BRAND.green : "#ef4444" },
    { label: "", noBorder: true },

    { label: `INVESTING ACTIVITIES — ${report.investing.subtitle}`, isSectionHeader: true },
    ...report.investing.items.map((i) => ({
      label: i.label, value: i.amount, indent: 1 as const,
      valueColor: i.amount >= 0 ? BRAND.green : "#ef4444",
    })),
    { label: report.investing.totalLabel, value: report.investing.total, isTotal: true, valueColor: report.investing.total >= 0 ? BRAND.green : "#ef4444" },
    { label: "", noBorder: true },

    { label: `FINANCING ACTIVITIES — ${report.financing.subtitle}`, isSectionHeader: true },
    ...report.financing.items.map((i) => ({
      label: i.label, value: i.amount, indent: 1 as const,
      valueColor: i.amount >= 0 ? BRAND.green : "#ef4444",
    })),
    { label: report.financing.totalLabel, value: report.financing.total, isTotal: true, valueColor: report.financing.total >= 0 ? BRAND.green : "#ef4444" },
    { label: "", noBorder: true },

    { label: "NET CHANGE IN CASH", value: report.net_change, isTotal: true, valueColor: report.net_change >= 0 ? BRAND.green : "#ef4444" },
    { label: "CLOSING CASH BALANCE", value: report.closing_balance, isGrandTotal: true, valueColor: BRAND.gold },
  ];
}

export default function CashFlowPage() {
  const { currency, fmt } = useCurrency();

  return (
    <ReportPageShell
      label="Reports"
      title="Cash Flow Statement"
      subtitle="Track how cash moved through your business — operating, investing, and financing activities"
      downloadLabel="Download Cash Flow"
      reviewedBy="Sarah Merchant, ACCA"
      onDownloadPDF={(range) => exportCashFlowToPDF(calculateCashFlow(range), `cash-flow-${range.from}-to-${range.to}.pdf`, currency)}
      onDownloadCSV={(range) => exportCashFlowToCSV(calculateCashFlow(range), `cash-flow-${range.from}-to-${range.to}.csv`)}
      onDownloadXLSX={(range) => exportCashFlowToXLSX(calculateCashFlow(range), `cash-flow-${range.from}-to-${range.to}.xlsx`)}
    >
      {(range: ReportDateRange) => {
        const report = calculateCashFlow(range);
        return (
          <div className="flex flex-col gap-5">
            <SummaryStatCards
              stats={[
                { label: "Opening Balance",    value: fmt(report.opening_balance),    color: BRAND.accent,                                    icon: <Wallet size={16} />      },
                { label: "Net from Operating", value: fmt(report.operating.total),    color: report.operating.total >= 0 ? BRAND.green : "#ef4444", icon: <ArrowUpRight size={16} /> },
                { label: "Net Change",         value: fmt(report.net_change),         color: report.net_change >= 0 ? BRAND.green : "#ef4444",     icon: <TrendingUp size={16} />  },
                { label: "Closing Balance",    value: fmt(report.closing_balance),    color: BRAND.gold,                                      icon: <Banknote size={16} />    },
              ]}
            />
            <ReportTable rows={buildCashFlowRows(report)} currency={currency} />
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
