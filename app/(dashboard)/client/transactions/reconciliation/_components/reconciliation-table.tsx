"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertOctagon, Clock, CheckCheck, Plus, Info, Loader2 } from "lucide-react";
import {
  useGetCandidatesQuery,
  useMatchLineMutation,
  useFlagLineMutation,
} from "@/lib/api/reconciliationApi";
import type { ApiReconciliationLine, MatchCandidate } from "@/lib/api/reconciliationApi";

const BRAND = { primary: "#0A2463", accent: "#3E92CC", gold: "#D4AF37", green: "#06D6A0", muted: "#6B7280" };

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ApiReconciliationLine["matchStatus"] }) {
  const cfg = {
    Matched:   { bg: `${BRAND.green}15`,      color: BRAND.green, border: `${BRAND.green}30`,      label: "Matched",   icon: <CheckCircle2 size={11} /> },
    Unmatched: { bg: `${BRAND.gold}15`,        color: BRAND.gold,  border: `${BRAND.gold}30`,       label: "Unmatched", icon: <Clock size={11} /> },
    Flagged:   { bg: "rgba(239,68,68,0.12)",   color: "#ef4444",   border: "rgba(239,68,68,0.25)",  label: "Flagged",   icon: <AlertOctagon size={11} /> },
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

function AmountCell({ amount, isIncome }: { amount: number; isIncome: boolean }) {
  return (
    <span className="font-semibold text-sm tabular-nums" style={{ color: isIncome ? BRAND.green : "#ef4444" }}>
      {isIncome ? "+" : "−"}£{Math.abs(amount).toFixed(2)}
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
      {Math.round(score)}% match
    </span>
  );
}

// ─── Match action cell ─────────────────────────────────────────────────────────

function MatchActionCell({
  line,
  reconciliationId,
  onAddAsNew,
}: {
  line: ApiReconciliationLine;
  reconciliationId: number;
  onAddAsNew: () => void;
}) {
  const [fetchCandidates, setFetchCandidates] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState("");

  const { data: candidates, isFetching } = useGetCandidatesQuery(
    { id: reconciliationId, lineId: line.id },
    { skip: !fetchCandidates || line.matchStatus === "Matched" }
  );

  const [matchLine, { isLoading: isMatching }] = useMatchLineMutation();
  const [flagLine, { isLoading: isFlagging }] = useFlagLineMutation();

  if (line.matchStatus === "Matched") {
    return (
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCheck size={14} style={{ color: BRAND.green }} />
          <span className="text-xs truncate max-w-[180px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            Matched
          </span>
        </div>
      </div>
    );
  }

  async function handleMatch() {
    if (!selectedTxId) return;
    await matchLine({ id: reconciliationId, lineId: line.id, transactionId: Number(selectedTxId) });
    setSelectedTxId("");
  }

  async function handleFlag() {
    await flagLine({ id: reconciliationId, lineId: line.id });
  }

  const renderCandidateOptions = () => {
    if (isFetching) {
      return <option disabled style={{ backgroundColor: "#0f1e3a" }}>Loading candidates…</option>;
    }
    if (!candidates || candidates.length === 0) {
      return <option disabled style={{ backgroundColor: "#0f1e3a" }}>No candidates found</option>;
    }
    return candidates.map((c: MatchCandidate) => (
      <option key={c.transactionId} value={String(c.transactionId)} style={{ backgroundColor: "#0f1e3a" }}>
        {c.date} — {c.description} (£{c.amount.toFixed(2)}) {c.confidenceScore > 0 ? `· ${Math.round(c.confidenceScore)}%` : ""}
      </option>
    ));
  };

  return (
    <div className="flex flex-col gap-1.5 items-end">
      {/* Candidates dropdown */}
      <select
        value={selectedTxId}
        onChange={(e) => setSelectedTxId(e.target.value)}
        onFocus={() => setFetchCandidates(true)}
        className="w-full h-8 px-2 rounded-lg text-xs border outline-none"
        style={{
          backgroundColor: "rgba(255,255,255,0.07)",
          borderColor: "rgba(255,255,255,0.12)",
          color: selectedTxId ? "#fff" : BRAND.muted,
          appearance: "none",
          colorScheme: "dark",
        }}
      >
        <option value="" style={{ backgroundColor: "#0f1e3a" }}>
          {fetchCandidates ? "Select a transaction to match…" : "Click to load candidates…"}
        </option>
        {fetchCandidates && renderCandidateOptions()}
      </select>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        {line.matchStatus === "Flagged" && (
          <div className="flex items-center gap-1 mr-1">
            <Info size={12} style={{ color: "#ef4444" }} />
            <span className="text-[10px]" style={{ color: "#ef4444" }}>Flagged for review</span>
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
          onClick={handleFlag}
          disabled={isFlagging}
          className="px-3 h-7 rounded-lg text-xs font-bold transition-colors"
          style={{
            backgroundColor: line.matchStatus === "Flagged" ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.12)",
            color: "#ef4444",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.28)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = line.matchStatus === "Flagged" ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.12)"; }}
        >
          {isFlagging ? <Loader2 size={10} className="animate-spin inline" /> : "Flag"}
        </button>

        <button
          type="button"
          onClick={handleMatch}
          disabled={!selectedTxId || isMatching}
          className="px-3 h-7 rounded-lg text-xs font-bold transition-colors"
          style={{
            backgroundColor: selectedTxId ? BRAND.green : `${BRAND.green}30`,
            color: selectedTxId ? BRAND.primary : `${BRAND.green}60`,
            cursor: selectedTxId ? "pointer" : "not-allowed",
          }}
          onMouseEnter={(e) => { if (selectedTxId) e.currentTarget.style.backgroundColor = "#05c190"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = selectedTxId ? BRAND.green : `${BRAND.green}30`; }}
        >
          {isMatching ? <Loader2 size={10} className="animate-spin inline" /> : "Match"}
        </button>
      </div>
    </div>
  );
}

// ─── Main table ────────────────────────────────────────────────────────────────

type FilterKey = "all" | "unmatched" | "matched" | "flagged";

interface Props {
  lines: ApiReconciliationLine[];
  reconciliationId: number;
  onAddAsNew: (line: ApiReconciliationLine) => void;
  activeFilter: FilterKey;
  onFilterChange: (f: FilterKey) => void;
}

const PAGE_SIZE = 8;

export function ReconciliationTable({
  lines,
  reconciliationId,
  onAddAsNew,
  activeFilter,
  onFilterChange,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = lines.filter((l) => {
    if (activeFilter === "all") return true;
    return l.matchStatus.toLowerCase() === activeFilter;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const TABS: { key: FilterKey; label: string; color: string }[] = [
    { key: "all",       label: `All (${lines.length})`,                                                    color: "rgba(255,255,255,0.7)" },
    { key: "unmatched", label: `Unmatched (${lines.filter((l) => l.matchStatus === "Unmatched").length})`, color: BRAND.gold },
    { key: "matched",   label: `Matched (${lines.filter((l) => l.matchStatus === "Matched").length})`,     color: BRAND.green },
    { key: "flagged",   label: `Flagged (${lines.filter((l) => l.matchStatus === "Flagged").length})`,     color: "#ef4444" },
  ];

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
                        : "No lines found"}
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
                    borderLeft: `3px solid ${line.matchStatus === "Matched" ? BRAND.green : line.matchStatus === "Flagged" ? "#ef4444" : "transparent"}`,
                    backgroundColor:
                      line.matchStatus === "Matched" ? `${BRAND.green}04`
                      : line.matchStatus === "Flagged" ? "rgba(239,68,68,0.03)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (line.matchStatus !== "Matched") e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      line.matchStatus === "Matched" ? `${BRAND.green}04`
                      : line.matchStatus === "Flagged" ? "rgba(239,68,68,0.03)"
                      : "transparent";
                  }}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {line.dateFormatted}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-white font-medium">{line.description}</span>
                      {line.matchConfidence !== null && line.matchConfidence > 0 && line.matchStatus !== "Matched" && (
                        <ConfidencePill score={line.matchConfidence} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AmountCell amount={line.amount} isIncome={line.isIncome} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={line.matchStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <MatchActionCell
                      line={line}
                      reconciliationId={reconciliationId}
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
