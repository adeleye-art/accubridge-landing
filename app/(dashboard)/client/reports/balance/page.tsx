"use client";

import React from "react";
import { Building2, Landmark, Users, CheckCircle2 } from "lucide-react";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportTable } from "@/components/reports/report-table";
import type { ReportRow } from "@/components/reports/report-table";
import { SummaryStatCards } from "@/components/reports/summary-stat-cards";
import { calculateBalanceSheet } from "@/lib/reports/report-calculations";
import { exportBalanceSheetToPDF } from "@/lib/reports/generate-pdf";
import { exportBalanceSheetToCSV, exportBalanceSheetToXLSX } from "@/lib/reports/generate-excel";
import type { ReportDateRange } from "@/types/reports";
import { useCurrency } from "@/lib/currency-context";

const BRAND = { green: "#06D6A0", gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280" };

function buildBalanceRows(report: ReturnType<typeof calculateBalanceSheet>): ReportRow[] {
  return [
    { label: "ASSETS", isSectionHeader: true },

    { label: report.assets.current.title, isSectionHeader: true },
    ...report.assets.current.items.map((i) => ({
      label: i.label, value: i.amount, indent: 2 as const,
      valueColor: i.amount >= 0 ? BRAND.green : "#ef4444",
    })),
    { label: report.assets.current.totalLabel, value: report.assets.current.total, isSubtotal: true, valueColor: BRAND.green },
    { label: "", noBorder: true },

    { label: report.assets.non_current.title, isSectionHeader: true },
    ...report.assets.non_current.items.map((i) => ({
      label: i.label, value: i.amount, indent: 2 as const, valueColor: BRAND.green,
    })),
    { label: report.assets.non_current.totalLabel, value: report.assets.non_current.total, isSubtotal: true, valueColor: BRAND.green },
    { label: "", noBorder: true },

    { label: "TOTAL ASSETS", value: report.assets.total_assets, isGrandTotal: true, valueColor: BRAND.gold },
    { label: "", noBorder: true },

    { label: "LIABILITIES", isSectionHeader: true },

    { label: report.liabilities.current.title, isSectionHeader: true },
    ...report.liabilities.current.items.map((i) => ({
      label: i.label, value: i.amount, indent: 2 as const, valueColor: "#ef4444",
    })),
    { label: report.liabilities.current.totalLabel, value: report.liabilities.current.total, isSubtotal: true, valueColor: "#ef4444" },
    { label: "", noBorder: true },

    { label: report.liabilities.non_current.title, isSectionHeader: true },
    ...report.liabilities.non_current.items.map((i) => ({
      label: i.label, value: i.amount, indent: 2 as const, valueColor: "#ef4444",
    })),
    { label: report.liabilities.non_current.totalLabel, value: report.liabilities.non_current.total, isSubtotal: true, valueColor: "#ef4444" },
    { label: "", noBorder: true },

    { label: "TOTAL LIABILITIES", value: report.liabilities.total_liabilities, isTotal: true, valueColor: "#ef4444" },
    { label: "", noBorder: true },

    { label: "EQUITY", isSectionHeader: true },
    ...report.equity.items.map((i) => ({ label: i.label, value: i.amount, indent: 2 as const })),
    { label: "TOTAL EQUITY", value: report.equity.total_equity, isTotal: true },
    { label: "", noBorder: true },

    {
      label: "TOTAL LIABILITIES & EQUITY",
      value: report.total_liabilities_and_equity,
      isGrandTotal: true,
      valueColor: report.is_balanced ? BRAND.gold : "#ef4444",
    },
  ];
}

export default function BalanceSheetPage() {
  const { currency, fmt } = useCurrency();

  return (
    <ReportPageShell
      label="Reports"
      title="Balance Sheet"
      subtitle="Snapshot of your financial position — assets, liabilities, and equity at a point in time"
      downloadLabel="Download Balance Sheet"
      reviewedBy="Sarah Merchant, ACCA"
      onDownloadPDF={(range) => exportBalanceSheetToPDF(calculateBalanceSheet(range.to), `balance-sheet-${range.to}.pdf`, currency)}
      onDownloadCSV={(range) => exportBalanceSheetToCSV(calculateBalanceSheet(range.to), `balance-sheet-${range.to}.csv`)}
      onDownloadXLSX={(range) => exportBalanceSheetToXLSX(calculateBalanceSheet(range.to), `balance-sheet-${range.to}.xlsx`)}
    >
      {(range: ReportDateRange) => {
        const report = calculateBalanceSheet(range.to);
        return (
          <div className="flex flex-col gap-5">
            <SummaryStatCards
              stats={[
                { label: "Total Assets",      value: fmt(report.assets.total_assets),             color: BRAND.green,                                icon: <Building2 size={16} />   },
                { label: "Total Liabilities", value: fmt(report.liabilities.total_liabilities),   color: "#ef4444",                                  icon: <Landmark size={16} />    },
                { label: "Total Equity",      value: fmt(report.equity.total_equity),             color: BRAND.accent,                               icon: <Users size={16} />       },
                { label: "Balance Check",     value: report.is_balanced ? "✓ Balanced" : "✗ Imbalanced", color: report.is_balanced ? BRAND.green : "#ef4444", icon: <CheckCircle2 size={16} /> },
              ]}
            />
            <ReportTable rows={buildBalanceRows(report)} currency={currency} />
            <p className="text-xs text-center" style={{ color: BRAND.muted }}>
              As of: {report.as_of_date}
              {report.reviewed_by && ` · Reviewed by ${report.reviewed_by}`}
            </p>
          </div>
        );
      }}
    </ReportPageShell>
  );
}
