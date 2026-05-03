"use client";

import React from "react";
import { FileText, Table, FileSpreadsheet, Printer } from "lucide-react";

const BRAND = { muted: "#6B7280" };

interface Props {
  label?: string;
  onDownloadPDF:  () => void;
  onDownloadCSV:  () => void;
  onDownloadXLSX: () => void;
  onPrint:        () => void;
}

const BUTTONS = [
  {
    key:   "pdf",
    label: "PDF",
    icon:  <FileText size={13} />,
    bg:    "rgba(239,68,68,0.12)",
    color: "#ef4444",
    border:"rgba(239,68,68,0.25)",
    hover: "rgba(239,68,68,0.22)",
  },
  {
    key:   "csv",
    label: "CSV",
    icon:  <Table size={13} />,
    bg:    "rgba(6,214,160,0.12)",
    color: "#06D6A0",
    border:"rgba(6,214,160,0.25)",
    hover: "rgba(6,214,160,0.22)",
  },
  {
    key:   "xlsx",
    label: "XLSX",
    icon:  <FileSpreadsheet size={13} />,
    bg:    "rgba(62,146,204,0.12)",
    color: "#3E92CC",
    border:"rgba(62,146,204,0.25)",
    hover: "rgba(62,146,204,0.22)",
  },
  {
    key:   "print",
    label: "Print",
    icon:  <Printer size={13} />,
    bg:    "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.6)",
    border:"rgba(255,255,255,0.12)",
    hover: "rgba(255,255,255,0.12)",
  },
] as const;

export function DownloadButtons({ label, onDownloadPDF, onDownloadCSV, onDownloadXLSX, onPrint }: Props) {
  const handlers: Record<string, () => void> = {
    pdf:   onDownloadPDF,
    csv:   onDownloadCSV,
    xlsx:  onDownloadXLSX,
    print: onPrint,
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && (
        <span className="text-xs font-medium mr-1" style={{ color: BRAND.muted }}>
          {label}:
        </span>
      )}
      {BUTTONS.map((btn) => (
        <button
          key={btn.key}
          type="button"
          onClick={handlers[btn.key]}
          className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-bold border transition-all duration-200"
          style={{ backgroundColor: btn.bg, color: btn.color, borderColor: btn.border }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = btn.hover; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = btn.bg; }}
        >
          {btn.icon}
          {btn.label}
        </button>
      ))}
    </div>
  );
}
