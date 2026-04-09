"use client";

import React, { useEffect, useRef } from "react";
import { Building2, Landmark, Users, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportTable } from "@/components/reports/report-table";
import type { ReportRow } from "@/components/reports/report-table";
import { SummaryStatCards } from "@/components/reports/summary-stat-cards";
import { exportBalanceSheetToPDF } from "@/lib/reports/generate-pdf";
import { exportBalanceSheetToCSV, exportBalanceSheetToXLSX } from "@/lib/reports/generate-excel";
import type { ReportDateRange, BalanceSheetReport } from "@/types/reports";
import { useCurrency } from "@/lib/currency-context";
import { type SupportedCurrency } from "@/lib/currency";
import { useGetBalanceSheetReportQuery, type ApiBalanceSheetReport, type ApiBalanceSheetEntry } from "@/lib/api/reportApi";

const BRAND = { green: "#06D6A0", gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/[^0-9.-]/g, "")) || 0;
}

function entriesToItems(entries: ApiBalanceSheetEntry[]) {
  return [...entries]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((e) => ({ label: e.description, amount: parseAmount(e.formattedAmount) }));
}

// ─── Adapter (for downloads) ──────────────────────────────────────────────────

function adaptBalanceSheet(api: ApiBalanceSheetReport): BalanceSheetReport {
  return {
    assets: {
      current: {
        title: "Current Assets",
        totalLabel: "Total Current Assets",
        total: parseAmount(api.formattedTotalCurrentAssets),
        items: entriesToItems(api.currentAssets),
      },
      non_current: {
        title: "Non-Current Assets",
        totalLabel: "Total Non-Current Assets",
        total: parseAmount(api.formattedTotalNonCurrentAssets),
        items: entriesToItems(api.nonCurrentAssets),
      },
      total_assets: parseAmount(api.formattedTotalAssets),
    },
    liabilities: {
      current: {
        title: "Current Liabilities",
        totalLabel: "Total Current Liabilities",
        total: parseAmount(api.formattedTotalCurrentLiabilities),
        items: entriesToItems(api.currentLiabilities),
      },
      non_current: {
        title: "Non-Current Liabilities",
        totalLabel: "Total Non-Current Liabilities",
        total: parseAmount(api.formattedTotalNonCurrentLiabilities),
        items: entriesToItems(api.nonCurrentLiabilities),
      },
      total_liabilities: parseAmount(api.formattedTotalLiabilities),
    },
    equity: {
      items: entriesToItems(api.equityLines),
      total_equity: parseAmount(api.formattedTotalEquity),
    },
    total_liabilities_and_equity: parseAmount(api.formattedTotalLiabilitiesAndEquity),
    is_balanced: api.isBalanced,
    as_of_date: api.asAtDate,
  };
}

// ─── Row builder ─────────────────────────────────────────────────────────────

function buildRows(api: ApiBalanceSheetReport): ReportRow[] {
  const toRows = (entries: ApiBalanceSheetEntry[]): ReportRow[] =>
    [...entries]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((e) => ({
        label: e.description,
        value: parseAmount(e.formattedAmount),
        indent: 2 as const,
        valueColor: BRAND.green,
      }));

  const toLiabilityRows = (entries: ApiBalanceSheetEntry[]): ReportRow[] =>
    [...entries]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((e) => ({
        label: e.description,
        value: parseAmount(e.formattedAmount),
        indent: 2 as const,
        valueColor: "#ef4444",
      }));

  return [
    { label: "ASSETS", isSectionHeader: true },

    { label: "Current Assets", isSectionHeader: true },
    ...toRows(api.currentAssets),
    { label: "Total Current Assets", value: parseAmount(api.formattedTotalCurrentAssets), isSubtotal: true, valueColor: BRAND.green },
    { label: "", noBorder: true },

    { label: "Non-Current Assets", isSectionHeader: true },
    ...toRows(api.nonCurrentAssets),
    { label: "Total Non-Current Assets", value: parseAmount(api.formattedTotalNonCurrentAssets), isSubtotal: true, valueColor: BRAND.green },
    { label: "", noBorder: true },

    { label: "TOTAL ASSETS", value: parseAmount(api.formattedTotalAssetsGrandTotal), isGrandTotal: true, valueColor: BRAND.gold },
    { label: "", noBorder: true },

    { label: "LIABILITIES", isSectionHeader: true },

    { label: "Current Liabilities", isSectionHeader: true },
    ...toLiabilityRows(api.currentLiabilities),
    { label: "Total Current Liabilities", value: parseAmount(api.formattedTotalCurrentLiabilities), isSubtotal: true, valueColor: "#ef4444" },
    { label: "", noBorder: true },

    { label: "Non-Current Liabilities", isSectionHeader: true },
    ...toLiabilityRows(api.nonCurrentLiabilities),
    { label: "Total Non-Current Liabilities", value: parseAmount(api.formattedTotalNonCurrentLiabilities), isSubtotal: true, valueColor: "#ef4444" },
    { label: "", noBorder: true },

    { label: "TOTAL LIABILITIES", value: parseAmount(api.formattedTotalLiabilitiesGrandTotal), isTotal: true, valueColor: "#ef4444" },
    { label: "", noBorder: true },

    { label: "EQUITY", isSectionHeader: true },
    ...[...api.equityLines]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((e) => ({ label: e.description, value: parseAmount(e.formattedAmount), indent: 2 as const })),
    { label: "TOTAL EQUITY", value: parseAmount(api.formattedTotalEquityGrandTotal), isTotal: true },
    { label: "", noBorder: true },

    {
      label: "TOTAL LIABILITIES & EQUITY",
      value: parseAmount(api.formattedTotalLiabilitiesAndEquity),
      isGrandTotal: true,
      valueColor: api.isBalanced ? BRAND.gold : "#ef4444",
    },
  ];
}

// ─── Inner content ────────────────────────────────────────────────────────────

interface BalanceContentProps {
  range: ReportDateRange;
  currency: SupportedCurrency;
  onReportReady: (r: BalanceSheetReport) => void;
}

function BalanceContent({ range, currency, onReportReady }: BalanceContentProps) {
  const { data, isLoading, isError } = useGetBalanceSheetReportQuery({
    Period: 7,
    CustomFrom: range.from,
    CustomTo: range.to,
  });

  useEffect(() => {
    if (data) onReportReady(adaptBalanceSheet(data));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="animate-spin" style={{ color: BRAND.accent }} />
          <span className="text-sm" style={{ color: BRAND.muted }}>Loading report…</span>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle size={28} style={{ color: "#ef4444" }} />
          <span className="text-sm" style={{ color: BRAND.muted }}>Failed to load report. Please try again.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <SummaryStatCards
        stats={[
          { label: "Total Assets",      value: data.formattedTotalAssets,      color: BRAND.green,                                icon: <Building2 size={16} />   },
          { label: "Total Liabilities", value: data.formattedTotalLiabilities, color: "#ef4444",                                  icon: <Landmark size={16} />    },
          { label: "Total Equity",      value: data.formattedTotalEquity,      color: BRAND.accent,                               icon: <Users size={16} />       },
          { label: "Balance Check",     value: data.balanceStatusLabel,        color: data.isBalanced ? BRAND.green : "#ef4444",  icon: <CheckCircle2 size={16} /> },
        ]}
      />
      <ReportTable rows={buildRows(data)} currency={currency} />
      <p className="text-xs text-center" style={{ color: BRAND.muted }}>
        As of: {data.asAtDate}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BalanceSheetPage() {
  const { currency } = useCurrency();
  const latestReport = useRef<BalanceSheetReport | null>(null);

  return (
    <ReportPageShell
      label="Reports"
      title="Balance Sheet"
      subtitle="Snapshot of your financial position — assets, liabilities, and equity at a point in time"
      downloadLabel="Download Balance Sheet"
      reviewedBy="Sarah Merchant, ACCA"
      onDownloadPDF={(range) => {
        if (latestReport.current)
          exportBalanceSheetToPDF(latestReport.current, `balance-sheet-${range.to}.pdf`, currency);
      }}
      onDownloadCSV={(range) => {
        if (latestReport.current)
          exportBalanceSheetToCSV(latestReport.current, `balance-sheet-${range.to}.csv`);
      }}
      onDownloadXLSX={(range) => {
        if (latestReport.current)
          exportBalanceSheetToXLSX(latestReport.current, `balance-sheet-${range.to}.xlsx`);
      }}
    >
      {(range: ReportDateRange) => (
        <BalanceContent
          range={range}
          currency={currency}
          onReportReady={(r) => { latestReport.current = r; }}
        />
      )}
    </ReportPageShell>
  );
}
