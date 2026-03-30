"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, DollarSign, BarChart3, Download, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

const BRAND = { gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

const REPORT_CARDS = [
  {
    href:        "/client/reports/pnl",
    icon:        <TrendingUp size={22} />,
    title:       "Profit & Loss",
    description: "Income vs expenses over a period. Shows gross profit, operating costs, and your net profit or loss.",
    color:       BRAND.green,
    features:    ["Revenue breakdown", "Expense categories", "Net profit / margin %"],
  },
  {
    href:        "/client/reports/balance",
    icon:        <DollarSign size={22} />,
    title:       "Balance Sheet",
    description: "Snapshot of your financial position. Assets, liabilities, and equity at a given date.",
    color:       BRAND.accent,
    features:    ["Current & non-current assets", "Liabilities breakdown", "Equity & balance check"],
  },
  {
    href:        "/client/reports/cashflow",
    icon:        <BarChart3 size={22} />,
    title:       "Cash Flow Statement",
    description: "How cash moved in and out of your business across operating, investing, and financing activities.",
    color:       BRAND.gold,
    features:    ["Operating cash flow", "Investing activities", "Opening & closing balance"],
  },
  {
    href:        "/client/reports/download",
    icon:        <Download size={22} />,
    title:       "Download Reports",
    description: "Export all three reports in PDF, CSV, or XLSX format for any period in one place.",
    color:       "rgba(255,255,255,0.5)",
    features:    ["PDF — branded A4", "CSV — spreadsheet", "XLSX — Excel workbook"],
  },
];

export default function ReportsIndexPage() {
  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto">

        <PageHeader
          badge="Client Dashboard"
          title="Financial Reports"
          description="Auto-generated financial statements from your reconciled transactions"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORT_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border p-6 flex flex-col gap-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.08)",
                textDecoration: "none",
                transition: "background-color 0.2s, border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "rgba(255,255,255,0.07)";
                el.style.borderColor = `${card.color}30`;
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "rgba(255,255,255,0.04)";
                el.style.borderColor = "rgba(255,255,255,0.08)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Icon + title */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${card.color}15`, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <h3 className="text-white font-bold text-base">{card.title}</h3>
                </div>
                <ArrowRight
                  size={16}
                  className="flex-shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-1"
                  style={{ color: BRAND.muted }}
                />
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {card.description}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2">
                {card.features.map((f) => (
                  <span
                    key={f}
                    className="text-[11px] px-2.5 py-1 rounded-full border"
                    style={{
                      backgroundColor: `${card.color}08`,
                      borderColor: `${card.color}20`,
                      color: `${card.color}cc`,
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* Info note */}
        <div
          className="mt-6 rounded-xl border p-4 flex items-start gap-3"
          style={{ backgroundColor: `${BRAND.accent}08`, borderColor: `${BRAND.accent}20` }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
            style={{ backgroundColor: `${BRAND.accent}20`, color: BRAND.accent }}
          >
            i
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Reports are generated from your reconciled transactions. For the most accurate results,
            ensure your bank reconciliation is up to date before generating reports.
            All reports are reviewed by your assigned AccuBridge accountant.
          </p>
        </div>

      </div>
    </div>
  );
}
