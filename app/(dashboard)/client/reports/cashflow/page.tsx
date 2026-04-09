"use client";

import React, { useEffect, useRef } from "react";
import { Wallet, ArrowUpRight, TrendingUp, Banknote, RefreshCw, AlertCircle } from "lucide-react";
import { ReportPageShell } from "@/components/reports/report-page-shell";
import { ReportTable } from "@/components/reports/report-table";
import type { ReportRow } from "@/components/reports/report-table";
import { SummaryStatCards } from "@/components/reports/summary-stat-cards";
import { exportCashFlowToPDF } from "@/lib/reports/generate-pdf";
import { exportCashFlowToCSV, exportCashFlowToXLSX } from "@/lib/reports/generate-excel";
import type { ReportDateRange, CashFlowReport } from "@/types/reports";
import { useCurrency } from "@/lib/currency-context";
import { useGetCashFlowReportQuery, type ApiCashFlowReport, type ApiCashFlowEntry } from "@/lib/api/reportApi";

const BRAND = { green: "#06D6A0", gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/[^0-9.-]/g, "")) || 0;
}

function entriesToItems(entries: ApiCashFlowEntry[]) {
  return [...entries]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((e) => ({ label: e.description, amount: parseAmount(e.formattedAmount) }));
}

// ─── Adapter (for downloads) ──────────────────────────────────────────────────

function adaptCashFlow(api: ApiCashFlowReport): CashFlowReport {
  const netChange = parseAmount(api.formattedNetChangeInCash) * (api.isNetPositive ? 1 : -1);
  return {
    opening_balance: parseAmount(api.formattedOpeningCashBalance),
    operating: {
      subtitle: "cash from core business",
      totalLabel: api.operatingSubtotalLabel,
      total: parseAmount(api.formattedNetCashFromOperating),
      items: entriesToItems(api.operatingActivities),
    },
    investing: {
      subtitle: "asset purchases & proceeds",
      totalLabel: api.investingSubtotalLabel,
      total: parseAmount(api.formattedNetCashFromInvesting),
      items: entriesToItems(api.investingActivities),
    },
    financing: {
      subtitle: "loans, equity & dividends",
      totalLabel: api.financingSubtotalLabel,
      total: parseAmount(api.formattedNetCashFromFinancing),
      items: entriesToItems(api.financingActivities),
    },
    net_change: netChange,
    closing_balance: parseAmount(api.formattedClosingCashBalance),
    period_label: api.period,
  };
}

// ─── Row builder ─────────────────────────────────────────────────────────────

function entryRows(entries: ApiCashFlowEntry[]): ReportRow[] {
  return [...entries]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((e) => {
      const val = parseAmount(e.formattedAmount);
      return { label: e.description, value: val, indent: 1 as const, valueColor: val >= 0 ? BRAND.green : "#ef4444" };
    });
}

function buildRows(api: ApiCashFlowReport): ReportRow[] {
  const operatingTotal  = parseAmount(api.formattedNetCashFromOperating);
  const investingTotal  = parseAmount(api.formattedNetCashFromInvesting);
  const financingTotal  = parseAmount(api.formattedNetCashFromFinancing);
  const netChange       = parseAmount(api.formattedNetChangeInCash) * (api.isNetPositive ? 1 : -1);
  const closingBalance  = parseAmount(api.formattedClosingCashBalance);

  return [
    { label: "Opening Cash Balance", value: parseAmount(api.formattedOpeningCashBalance), isSubtotal: true, valueColor: BRAND.accent },
    { label: "", noBorder: true },

    { label: api.operatingHeading, isSectionHeader: true },
    ...entryRows(api.operatingActivities),
    { label: api.operatingSubtotalLabel, value: operatingTotal, isTotal: true, valueColor: operatingTotal >= 0 ? BRAND.green : "#ef4444" },
    { label: "", noBorder: true },

    { label: api.investingHeading, isSectionHeader: true },
    ...entryRows(api.investingActivities),
    { label: api.investingSubtotalLabel, value: investingTotal, isTotal: true, valueColor: investingTotal >= 0 ? BRAND.green : "#ef4444" },
    { label: "", noBorder: true },

    { label: api.financingHeading, isSectionHeader: true },
    ...entryRows(api.financingActivities),
    { label: api.financingSubtotalLabel, value: financingTotal, isTotal: true, valueColor: financingTotal >= 0 ? BRAND.green : "#ef4444" },
    { label: "", noBorder: true },

    { label: "NET CHANGE IN CASH", value: netChange, isTotal: true, valueColor: netChange >= 0 ? BRAND.green : "#ef4444" },
    { label: "CLOSING CASH BALANCE", value: closingBalance, isGrandTotal: true, valueColor: BRAND.gold },
  ];
}

// ─── Inner content ────────────────────────────────────────────────────────────

interface CashFlowContentProps {
  range: ReportDateRange;
  currency: string;
  onReportReady: (r: CashFlowReport) => void;
}

function CashFlowContent({ range, currency, onReportReady }: CashFlowContentProps) {
  const { data, isLoading, isError } = useGetCashFlowReportQuery({
    Period: 7,
    CustomFrom: range.from,
    CustomTo: range.to,
  });

  useEffect(() => {
    if (data) onReportReady(adaptCashFlow(data));
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
          { label: "Opening Balance",    value: data.formattedOpeningCashBalance,    color: BRAND.accent,                                      icon: <Wallet size={16} />      },
          { label: "Net from Operating", value: data.formattedNetCashFromOperating,  color: data.isNetPositive ? BRAND.green : "#ef4444",       icon: <ArrowUpRight size={16} /> },
          { label: "Net Change",         value: data.formattedNetChangeInCash,       color: data.isNetPositive ? BRAND.green : "#ef4444",       icon: <TrendingUp size={16} />  },
          { label: "Closing Balance",    value: data.formattedClosingCashBalance,    color: BRAND.gold,                                         icon: <Banknote size={16} />    },
        ]}
      />
      <ReportTable rows={buildRows(data)} currency={currency} />
      <p className="text-xs text-center" style={{ color: BRAND.muted }}>Period: {data.period}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CashFlowPage() {
  const { currency } = useCurrency();
  const latestReport = useRef<CashFlowReport | null>(null);

  return (
    <ReportPageShell
      label="Reports"
      title="Cash Flow Statement"
      subtitle="Track how cash moved through your business — operating, investing, and financing activities"
      downloadLabel="Download Cash Flow"
      reviewedBy="Sarah Merchant, ACCA"
      onDownloadPDF={(range) => {
        if (latestReport.current)
          exportCashFlowToPDF(latestReport.current, `cash-flow-${range.from}-to-${range.to}.pdf`, currency);
      }}
      onDownloadCSV={(range) => {
        if (latestReport.current)
          exportCashFlowToCSV(latestReport.current, `cash-flow-${range.from}-to-${range.to}.csv`);
      }}
      onDownloadXLSX={(range) => {
        if (latestReport.current)
          exportCashFlowToXLSX(latestReport.current, `cash-flow-${range.from}-to-${range.to}.xlsx`);
      }}
    >
      {(range: ReportDateRange) => (
        <CashFlowContent
          range={range}
          currency={currency}
          onReportReady={(r) => { latestReport.current = r; }}
        />
      )}
    </ReportPageShell>
  );
}
