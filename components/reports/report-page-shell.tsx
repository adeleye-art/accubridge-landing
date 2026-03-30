"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ReportToolbar } from "./report-toolbar";
import { DownloadButtons } from "./download-buttons";
import type { ReportPeriod, ReportDateRange } from "@/types/reports";
import { getPeriodRange } from "@/lib/reports/report-calculations";

const BRAND = { accent: "#3E92CC", gold: "#D4AF37", muted: "#6B7280" };

interface Props {
  label: string;
  title: string;
  subtitle: string;
  onDownloadPDF:  (range: ReportDateRange) => Promise<void> | void;
  onDownloadCSV:  (range: ReportDateRange) => Promise<void> | void;
  onDownloadXLSX: (range: ReportDateRange) => Promise<void> | void;
  downloadLabel?: string;
  reviewedBy?: string;
  children: (range: ReportDateRange) => React.ReactNode;
}

export function ReportPageShell({
  label, title, subtitle,
  onDownloadPDF, onDownloadCSV, onDownloadXLSX,
  downloadLabel, reviewedBy, children,
}: Props) {
  const [period, setPeriod]           = useState<ReportPeriod>("this_month");
  const [customRange, setCustomRange] = useState<ReportDateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    to:   new Date().toISOString().split("T")[0],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRange, setActiveRange]   = useState<ReportDateRange>(() => getPeriodRange("this_month"));

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    const range = period === "custom" ? customRange : getPeriodRange(period);
    await new Promise((res) => setTimeout(res, 600));
    setActiveRange(range);
    setIsGenerating(false);
  }, [period, customRange]);

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
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

        {/* Page header — uses badge + description per existing PageHeader API */}
        <PageHeader badge={label} title={title} description={subtitle} />

        {/* Toolbar */}
        <ReportToolbar
          period={period}
          customRange={customRange}
          reviewedBy={reviewedBy}
          onPeriodChange={setPeriod}
          onCustomRangeChange={setCustomRange}
          onGenerate={handleGenerate}
        />

        {/* Download bar */}
        <div className="mb-5">
          <DownloadButtons
            label={downloadLabel}
            onDownloadPDF={() => onDownloadPDF(activeRange)}
            onDownloadCSV={() => onDownloadCSV(activeRange)}
            onDownloadXLSX={() => onDownloadXLSX(activeRange)}
            onPrint={() => window.print()}
          />
        </div>

        {/* Loading */}
        {isGenerating ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={28} className="animate-spin" style={{ color: BRAND.accent }} />
              <span className="text-sm" style={{ color: BRAND.muted }}>Generating report…</span>
            </div>
          </div>
        ) : (
          children(activeRange)
        )}
      </div>
    </div>
  );
}
