"use client";

import React from "react";
import { type SupportedCurrency, CURRENCY_CONFIG, formatAmountRaw } from "@/lib/currency";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280" };

export interface ReportRow {
  label: string;
  value?: number;
  indent?: 1 | 2;
  isSectionHeader?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isGrandTotal?: boolean;
  valueColor?: string;
  noBorder?: boolean;
}

function Row({ row, fmt }: { row: ReportRow; fmt: (v: number) => string }) {
  if (!row.label && row.noBorder) {
    return <tr><td colSpan={2} style={{ padding: "4px 0" }} /></tr>;
  }

  if (row.isSectionHeader) {
    return (
      <tr>
        <td
          colSpan={2}
          style={{
            padding: "8px 16px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: BRAND.accent,
            backgroundColor: `rgba(10,36,99,0.5)`,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {row.label}
        </td>
      </tr>
    );
  }

  const isGrand    = row.isGrandTotal;
  const isTotal    = row.isTotal && !isGrand;
  const isSubtotal = row.isSubtotal && !isTotal && !isGrand;

  let rowBg = "transparent";
  let borderTop = "none";
  let borderTopWidth = "1px";
  let fontWeight: React.CSSProperties["fontWeight"] = 400;
  let fontSize = "13px";

  if (isGrand) {
    rowBg        = "rgba(212,175,55,0.08)";
    borderTop    = "2px solid rgba(212,175,55,0.4)";
    fontWeight   = 800;
    fontSize     = "14px";
  } else if (isTotal) {
    rowBg        = "rgba(212,175,55,0.06)";
    borderTop    = "1px solid rgba(212,175,55,0.25)";
    fontWeight   = 700;
  } else if (isSubtotal) {
    rowBg        = "rgba(255,255,255,0.03)";
    borderTop    = "1px solid rgba(255,255,255,0.06)";
    fontWeight   = 600;
  }

  const indent = row.indent ?? 0;
  const paddingLeft = 16 + indent * 16;

  return (
    <tr style={{ backgroundColor: rowBg, borderTop }}>
      <td
        style={{
          padding: `6px ${paddingLeft}px`,
          paddingLeft: `${paddingLeft}px`,
          fontSize,
          fontWeight,
          color: isGrand || isTotal ? BRAND.gold : "rgba(255,255,255,0.85)",
          borderBottom: row.noBorder ? "none" : "1px solid rgba(255,255,255,0.04)",
          width: "65%",
        }}
      >
        {row.label}
      </td>
      <td
        style={{
          padding: `6px 16px`,
          textAlign: "right",
          fontSize,
          fontWeight,
          color: row.valueColor ?? (isGrand || isTotal ? BRAND.gold : "rgba(255,255,255,0.8)"),
          borderBottom: row.noBorder ? "none" : "1px solid rgba(255,255,255,0.04)",
          whiteSpace: "nowrap",
        }}
      >
        {row.value !== undefined ? fmt(row.value) : ""}
      </td>
    </tr>
  );
}

export function ReportTable({ rows, currency = "GBP" }: { rows: ReportRow[]; currency?: SupportedCurrency }) {
  const fmt = (v: number) => formatAmountRaw(v, currency, { parens: true });
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "420px" }}>
        <thead>
          <tr style={{ backgroundColor: `rgba(10,36,99,0.6)` }}>
            <th
              style={{
                padding: "10px 16px",
                textAlign: "left",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Description
            </th>
            <th
              style={{
                padding: "10px 16px",
                textAlign: "right",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                whiteSpace: "nowrap",
              }}
            >
              {`Amount (${CURRENCY_CONFIG[currency].symbol})`}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <Row key={i} row={row} fmt={fmt} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
