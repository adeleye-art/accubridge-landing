"use client";

import React, { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, DollarSign, Percent, RefreshCw, AlertCircle } from "lucide-react";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportTable } from "@/components/reports/report-table";
import type { ReportRow } from "@/components/reports/report-table";
import { SummaryStatCards } from "@/components/reports/summary-stat-cards";
import { exportPnLToPDF } from "@/lib/reports/generate-pdf";
import { exportPnLToCSV, exportPnLToXLSX } from "@/lib/reports/generate-excel";
import type { ReportDateRange, PnLReport } from "@/types/reports";
import { useCurrency } from "@/lib/currency-context";
import { type SupportedCurrency } from "@/lib/currency";
import { useGetPnLReportQuery, type ApiPnLReport } from "@/lib/api/reportApi";

const BRAND = { green: "#06D6A0", gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip currency symbols/commas and parse to float */
function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/[^0-9.-]/g, "")) || 0;
}

// ─── Adapter (API → internal type used for downloads) ────────────────────────

function adaptPnL(api: ApiPnLReport): PnLReport {
  return {
    income: {
      title: "Income",
      totalLabel: "Total Income",
      total: parseAmount(api.formattedTotalIncome),
      items: api.incomeLines.map((l) => ({ label: l.description, amount: parseAmount(l.formattedAmount) })),
    },
    expenses: {
      title: "Expenses",
      totalLabel: "Total Expenses",
      total: parseAmount(api.formattedTotalExpenses),
      items: api.expenseLines.map((l) => ({ label: l.description, amount: parseAmount(l.formattedAmount) })),
    },
    net_profit: parseAmount(api.formattedNetProfitOrLoss) * (api.isProfit ? 1 : -1),
    net_margin_percent: parseFloat(api.netMarginLabel) || 0,
    period_label: api.period,
  };
}

// ─── Row builder ─────────────────────────────────────────────────────────────

function buildRows(api: ApiPnLReport): ReportRow[] {
  return [
    { label: "INCOME", isSectionHeader: true },
    ...api.incomeLines.map((l) => ({
      label: l.description,
      value: parseAmount(l.formattedAmount),
      indent: 1 as const,
      valueColor: BRAND.green,
    })),
    { label: "Total Income", value: parseAmount(api.formattedTotalIncome), isTotal: true, valueColor: BRAND.green },
    { label: "", noBorder: true },

    { label: "EXPENSES", isSectionHeader: true },
    ...api.expenseLines.map((l) => ({
      label: l.description,
      value: parseAmount(l.formattedAmount),
      indent: 1 as const,
      valueColor: "#ef4444",
    })),
    { label: "Total Expenses", value: parseAmount(api.formattedTotalExpenses), isTotal: true, valueColor: "#ef4444" },
    { label: "", noBorder: true },

    {
      label: "NET PROFIT / (LOSS)",
      value: parseAmount(api.formattedNetProfitOrLoss) * (api.isProfit ? 1 : -1),
      isGrandTotal: true,
      valueColor: api.isProfit ? BRAND.green : "#ef4444",
    },
  ];
}

// ─── Inner content ────────────────────────────────────────────────────────────

interface PnLContentProps {
  range: ReportDateRange;
  currency: SupportedCurrency;
  onReportReady: (r: PnLReport) => void;
}

function PnLContent({ range, currency, onReportReady }: PnLContentProps) {
  const { data, isLoading, isError } = useGetPnLReportQuery({
    Period: 7,
    CustomFrom: range.from,
    CustomTo: range.to,
  });

  useEffect(() => {
    if (data) onReportReady(adaptPnL(data));
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
          { label: "Total Income",      value: data.formattedTotalIncome,    color: BRAND.green,                          icon: <TrendingUp size={16} />   },
          { label: "Total Expenses",    value: data.formattedTotalExpenses,  color: "#ef4444",                            icon: <TrendingDown size={16} />  },
          { label: "Net Profit / Loss", value: data.formattedNetProfitOrLoss, color: data.isProfit ? BRAND.green : "#ef4444", icon: <DollarSign size={16} /> },
          { label: "Net Margin",        value: data.netMarginLabel,          color: BRAND.gold,                           icon: <Percent size={16} />      },
        ]}
      />
      <ReportTable rows={buildRows(data)} currency={currency} />
      <p className="text-xs text-center" style={{ color: BRAND.muted }}>Period: {data.period}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfitLossPage() {
  const { currency } = useCurrency();
  const latestReport = useRef<PnLReport | null>(null);

  return (
    <ReportPageShell
      label="Reports"
      title="Profit & Loss"
      subtitle="Income vs expenses — see exactly what your business earned and spent over a period"
      downloadLabel="Download P&L"
      reviewedBy="Sarah Merchant, ACCA"
      onDownloadPDF={(range) => {
        if (latestReport.current)
          exportPnLToPDF(latestReport.current, `pnl-${range.from}-to-${range.to}.pdf`, currency);
      }}
      onDownloadCSV={(range) => {
        if (latestReport.current)
          exportPnLToCSV(latestReport.current, `pnl-${range.from}-to-${range.to}.csv`);
      }}
      onDownloadXLSX={(range) => {
        if (latestReport.current)
          exportPnLToXLSX(latestReport.current, `pnl-${range.from}-to-${range.to}.xlsx`);
      }}
    >
      {(range: ReportDateRange) => (
        <PnLContent
          range={range}
          currency={currency}
          onReportReady={(r) => { latestReport.current = r; }}
        />
      )}
    </ReportPageShell>
  );
}
