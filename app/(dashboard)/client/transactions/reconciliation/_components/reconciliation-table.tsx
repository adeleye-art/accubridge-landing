"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertOctagon, Clock, CheckCheck, Plus, Info } from "lucide-react";
import type { BankStatementLine, InternalTransaction } from "@/types/reconciliation";

const BRAND = { primary: "#0A2463", accent: "#3E92CC", gold: "#D4AF37", green: "#06D6A0", muted: "#6B7280" };

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BankStatementLine["status"] }) {
  const cfg = {
    matched:   { bg: `${BRAND.green}15`,      color: BRAND.green, border: `${BRAND.green}30`,      label: "Matched",   icon: <CheckCircle2 size={11} /> },
    unmatched: { bg: `${BRAND.gold}15`,        color: BRAND.gold,  border: `${BRAND.gold}30`,       label: "Unmatched", icon: <Clock size={11} /> },
    flagged:   { bg: "rgba(239,68,68,0.12)",   color: "#ef4444",   border: "rgba(239,68,68,0.25)",  label: "Flagged",   icon: <AlertOctagon size={11} /> },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border"
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Amount cell ───────────────────────────────────────────────────────────────

function AmountCell({ amount, rawType }: { amount: number; rawType: "credit" | "debit" }) {
  const isCredit = rawType === "credit";
  return (
    <span className="font-semibold text-sm tabular-nums" style={{ color: isCredit ? BRAND.green : "#ef4444" }}>
      {isCredit ? "+" : "−"}£{Math.abs(amount).toFixed(2)}
    </span>
  );
}

// ─── Confidence pill ───────────────────────────────────────────────────────────

function ConfidencePill({ score }: { score: number }) {
  const color = score >= 80 ? BRAND.green : score >= 50 ? BRAND.gold : "#ef4444";
  return (
    <span
      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {score}% match
    </span>
  );
}

// ─── Match action cell ─────────────────────────────────────────────────────────

function MatchActionCell({
  line,
  availableTxs,
  selectedMatch,
  onSelectMatch,
  onMatch,
  onFlag,
  onUnmatch,
  onAddAsNew,
}: {
  line: BankStatementLine;
  availableTxs: InternalTransaction[];
  selectedMatch: string;
  onSelectMatch: (id: string) => void;
  onMatch: () => void;
  onFlag: () => void;
  onUnmatch: () => void;
  onAddAsNew: () => void;
}) {
  if (line.status === "matched") {
    return (
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCheck size={14} style={{ color: BRAND.green }} />
          <span
            className="text-xs truncate max-w-[180px]"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            {line.matchedTransactionLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={onUnmatch}
          className="px-2.5 h-7 rounded-lg text-xs font-medium border transition-colors flex-shrink-0"
          style={{ borderColor: `${BRAND.gold}40`, color: BRAND.gold, backgroundColor: `${BRAND.gold}10` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.gold}22`; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.gold}10`; }}
        >
          Unmatch
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 items-end">
      {/* Dropdown */}
      <select
        value={selectedMatch}
        onChange={(e) => onSelectMatch(e.target.value)}
        className="w-full h-8 px-2 rounded-lg text-xs border outline-none"
        style={{
          backgroundColor: "rgba(255,255,255,0.07)",
          borderColor: "rgba(255,255,255,0.12)",
          color: selectedMatch ? "#fff" : BRAND.muted,
          appearance: "none",
          colorScheme: "dark",
        }}
        onFocus={(e) => { e.target.style.borderColor = `${BRAND.accent}60`; }}
        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
      >
        <option value="" style={{ backgroundColor: "#0f1e3a" }}>Select a transaction to match…</option>
        {availableTxs.map((tx) => (
          <option key={tx.id} value={tx.id} style={{ backgroundColor: "#0f1e3a" }}>
            {tx.date} — {tx.description} (£{tx.amount.toFixed(2)})
          </option>
        ))}
      </select>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        {line.status === "flagged" && line.flagReason && (
          <div className="flex items-center gap-1 mr-1" title={line.flagReason}>
            <Info size={12} style={{ color: "#ef4444" }} />
            <span className="text-[10px] max-w-[110px] truncate" style={{ color: "#ef4444" }}>
              {line.flagReason}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onAddAsNew}
          className="px-2.5 h-7 rounded-lg text-xs font-medium border transition-colors"
          style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,255,255,0.04)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          title="Add this as a new transaction record"
        >
          <Plus size={10} className="inline mr-0.5" />
          Add New
        </button>

        <button
          type="button"
          onClick={onFlag}
          className="px-3 h-7 rounded-lg text-xs font-bold transition-colors"
          style={{
            backgroundColor: line.status === "flagged" ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.12)",
            color: "#ef4444",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.28)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = line.status === "flagged" ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.12)"; }}
        >
          Flag
        </button>

        <button
          type="button"
          onClick={onMatch}
          disabled={!selectedMatch}
          className="px-3 h-7 rounded-lg text-xs font-bold transition-colors"
          style={{
            backgroundColor: selectedMatch ? BRAND.green : `${BRAND.green}30`,
            color: selectedMatch ? BRAND.primary : `${BRAND.green}60`,
            cursor: selectedMatch ? "pointer" : "not-allowed",
          }}
          onMouseEnter={(e) => { if (selectedMatch) e.currentTarget.style.backgroundColor = "#05c190"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = selectedMatch ? BRAND.green : `${BRAND.green}30`; }}
        >
          Match
        </button>
      </div>
    </div>
  );
}

// ─── Main table ────────────────────────────────────────────────────────────────

type FilterKey = "all" | "unmatched" | "matched" | "flagged";

interface Props {
  lines: BankStatementLine[];
  internalTransactions: InternalTransaction[];
  onMatch: (lineId: string, txId: string) => void;
  onUnmatch: (lineId: string) => void;
  onFlag: (lineId: string) => void;
  onAddAsNew: (line: BankStatementLine) => void;
  activeFilter: FilterKey;
  onFilterChange: (f: FilterKey) => void;
}

const PAGE_SIZE = 8;

export function ReconciliationTable({
  lines,
  internalTransactions,
  onMatch,
  onUnmatch,
  onFlag,
  onAddAsNew,
  activeFilter,
  onFilterChange,
}: Props) {
  const [selectedMatches, setSelectedMatches] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = lines.filter((l) => activeFilter === "all" ? true : l.status === activeFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const TABS: { key: FilterKey; label: string; color: string }[] = [
    { key: "all",       label: `All (${lines.length})`,                                          color: "rgba(255,255,255,0.7)" },
    { key: "unmatched", label: `Unmatched (${lines.filter((l) => l.status === "unmatched").length})`, color: BRAND.gold },
    { key: "matched",   label: `Matched (${lines.filter((l) => l.status === "matched").length})`,     color: BRAND.green },
    { key: "flagged",   label: `Flagged (${lines.filter((l) => l.status === "flagged").length})`,     color: "#ef4444" },
  ];

  const availableTxs = internalTransactions.filter((t) => t.status !== "reconciled");

  function handleFilterChange(key: FilterKey) {
    onFilterChange(key);
    setCurrentPage(1);
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {/* Filter tabs */}
      <div
        className="flex items-center gap-1 px-4 py-3 border-b overflow-x-auto"
        style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.03)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleFilterChange(tab.key)}
            className="px-3 h-7 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0"
            style={{
              backgroundColor: activeFilter === tab.key ? `${tab.color}15` : "transparent",
              color: activeFilter === tab.key ? tab.color : BRAND.muted,
              border: `1px solid ${activeFilter === tab.key ? `${tab.color}30` : "transparent"}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: "860px" }}>
          <thead>
            <tr style={{ backgroundColor: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                { label: "Date",           w: "110px" },
                { label: "Description",    w: "auto"  },
                { label: "Amount",         w: "120px" },
                { label: "Status",         w: "120px" },
                { label: "Match / Action", w: "300px" },
              ].map((col) => (
                <th key={col.label} className="px-4 py-3 text-left" style={{ width: col.w }}>
                  <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 size={28} style={{ color: BRAND.green }} />
                    <span className="text-sm" style={{ color: BRAND.muted }}>
                      {activeFilter === "matched"
                        ? "No matched lines yet — start matching transactions"
                        : activeFilter === "flagged"
                        ? "No flagged lines — everything looks good!"
                        : "Upload a bank statement to begin reconciliation"}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((line) => (
                <tr
                  key={line.id}
                  className="group transition-colors duration-150"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    borderLeft: `3px solid ${line.status === "matched" ? BRAND.green : line.status === "flagged" ? "#ef4444" : "transparent"}`,
                    backgroundColor:
                      line.status === "matched" ? `${BRAND.green}04`
                      : line.status === "flagged" ? "rgba(239,68,68,0.03)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (line.status !== "matched") e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      line.status === "matched" ? `${BRAND.green}04`
                      : line.status === "flagged" ? "rgba(239,68,68,0.03)"
                      : "transparent";
                  }}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {line.date}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-white font-medium">{line.description}</span>
                      {line.confidence !== undefined && line.confidence > 0 && line.status !== "matched" && (
                        <ConfidencePill score={line.confidence} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AmountCell amount={line.amount} rawType={line.rawType} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={line.status} />
                  </td>
                  <td className="px-4 py-3">
                    <MatchActionCell
                      line={line}
                      availableTxs={availableTxs}
                      selectedMatch={selectedMatches[line.id] ?? ""}
                      onSelectMatch={(txId) => setSelectedMatches((s) => ({ ...s, [line.id]: txId }))}
                      onMatch={() => {
                        const txId = selectedMatches[line.id];
                        if (txId) {
                          onMatch(line.id, txId);
                          setSelectedMatches((s) => { const n = { ...s }; delete n[line.id]; return n; });
                        }
                      }}
                      onFlag={() => onFlag(line.id)}
                      onUnmatch={() => onUnmatch(line.id)}
                      onAddAsNew={() => onAddAsNew(line)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span className="text-xs" style={{ color: BRAND.muted }}>
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className="min-w-[28px] h-7 px-1.5 rounded-lg flex items-center justify-center text-xs font-medium transition-colors"
                style={{
                  backgroundColor: p === currentPage ? BRAND.gold : "rgba(255,255,255,0.04)",
                  color: p === currentPage ? BRAND.primary : "rgba(255,255,255,0.6)",
                  border: `1px solid ${p === currentPage ? "transparent" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
