"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ArrowLeftRight, CheckCheck, Download, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AddTransactionSheet, type TransactionFormData } from "../../_components/add-transaction-sheet";
import { ReconciliationStatsCards, ReconciliationGauge } from "../_components/reconciliation-stats";
import { UploadStatement } from "../_components/upload-statement";
import { ReconciliationTable } from "../_components/reconciliation-table";
import { useToast } from "@/components/shared/toast";
import type { BankStatementLine, InternalTransaction, ReconciliationStats } from "@/types/reconciliation";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

// ─── Mock seed data ───────────────────────────────────────────────────────────

const MOCK_INTERNAL_TXS: InternalTransaction[] = [
  { id: "t1",  date: "2026-03-01", type: "income",  category: "Sales Revenue",     description: "March client invoice — Apex Foods",   amount: 4500,  status: "pending" },
  { id: "t2",  date: "2026-03-03", type: "expense", category: "Salaries & Wages",  description: "Staff payroll — March week 1",        amount: 2800,  status: "pending" },
  { id: "t3",  date: "2026-03-05", type: "income",  category: "Service Income",    description: "Consulting fee — GreenPath Ventures", amount: 1200,  status: "pending" },
  { id: "t4",  date: "2026-03-08", type: "expense", category: "Software & Tools",  description: "AccuBridge Standard Plan",            amount: 69,    status: "pending" },
  { id: "t5",  date: "2026-03-10", type: "expense", category: "Rent & Utilities",  description: "Office rent — March",                 amount: 1500,  status: "pending" },
  { id: "t6",  date: "2026-03-12", type: "income",  category: "Grant / Funding",   description: "Compliance-Based Grant",              amount: 5000,  status: "pending" },
  { id: "t7",  date: "2026-03-15", type: "expense", category: "Marketing",         description: "Google Ads — Q1 campaign",            amount: 350,   status: "pending" },
  { id: "t8",  date: "2026-03-18", type: "income",  category: "Sales Revenue",     description: "Product sales — online store",        amount: 890,   status: "reconciled" },
  { id: "t9",  date: "2026-03-20", type: "expense", category: "Professional Svcs", description: "Accountant review fee",               amount: 200,   status: "reconciled" },
  { id: "t10", date: "2026-03-22", type: "expense", category: "Travel",            description: "Flight to London — client meeting",   amount: 320,   status: "pending" },
];

const MOCK_BANK_LINES: BankStatementLine[] = [
  { id: "b1",  date: "2026-03-01", description: "APEX FOODS LTD PAYMENT",       amount: 4500,  rawType: "credit", status: "unmatched", confidence: 95 },
  { id: "b2",  date: "2026-03-03", description: "PAYROLL BACS PAYMENT",         amount: 2800,  rawType: "debit",  status: "unmatched", confidence: 88 },
  { id: "b3",  date: "2026-03-05", description: "GREENPATH VENTURES INV",       amount: 1200,  rawType: "credit", status: "unmatched", confidence: 82 },
  { id: "b4",  date: "2026-03-08", description: "ACCUBRIDGE LTD SUBSCRIPTION",  amount: 69,    rawType: "debit",  status: "unmatched", confidence: 97 },
  { id: "b5",  date: "2026-03-10", description: "LANDLORD RENT MARCH",          amount: 1500,  rawType: "debit",  status: "unmatched", confidence: 91 },
  { id: "b6",  date: "2026-03-11", description: "PAYMENT REF 2947XZAB",        amount: 5000,  rawType: "credit", status: "flagged",   flagReason: "Unrecognised reference — verify source", confidence: 45 },
  { id: "b7",  date: "2026-03-15", description: "GOOGLE IRELAND ADVERTISING",   amount: 350,   rawType: "debit",  status: "unmatched", confidence: 79 },
  { id: "b8",  date: "2026-03-19", description: "AMAZON PRIME MEMBERSHIP",      amount: 8.99,  rawType: "debit",  status: "unmatched", confidence: 0  },
  { id: "b9",  date: "2026-03-21", description: "STRIPE PAYOUT BATCH",          amount: 2340,  rawType: "credit", status: "unmatched", confidence: 0  },
  { id: "b10", date: "2026-03-22", description: "BRITISH AIRWAYS TRAVEL",       amount: 320,   rawType: "debit",  status: "unmatched", confidence: 71 },
  { id: "b11", date: "2026-03-18", description: "SHOPIFY SALES DEPOSIT",        amount: 890,   rawType: "credit", status: "matched",   matchedTransactionId: "t8", matchedTransactionLabel: "Product sales — online store", confidence: 94 },
  { id: "b12", date: "2026-03-20", description: "ACCOUNTANT FEE BACS",          amount: 200,   rawType: "debit",  status: "matched",   matchedTransactionId: "t9", matchedTransactionLabel: "Accountant review fee", confidence: 99 },
];

// ─── Auto-match helper ────────────────────────────────────────────────────────

function applyAutoMatch(lines: BankStatementLine[], txs: InternalTransaction[]): {
  lines: BankStatementLine[];
  matchedTxIds: string[];
} {
  const usedTxIds = new Set<string>();
  const next = lines.map((line) => {
    if (line.status === "matched") return line;
    if ((line.confidence ?? 0) < 85) return line;
    const match = txs.find(
      (tx) => tx.status !== "reconciled" && !usedTxIds.has(tx.id) && Math.abs(tx.amount - Math.abs(line.amount)) < 0.01
    );
    if (match) {
      usedTxIds.add(match.id);
      return { ...line, status: "matched" as const, matchedTransactionId: match.id, matchedTransactionLabel: match.description };
    }
    return line;
  });
  return { lines: next, matchedTxIds: Array.from(usedTxIds) };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReconciliationPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [isLoaded, setIsLoaded] = useState(true);
  const [lines, setLines] = useState<BankStatementLine[]>(MOCK_BANK_LINES);
  const [internalTxs, setInternalTxs] = useState<InternalTransaction[]>(MOCK_INTERNAL_TXS);
  const [activeFilter, setActiveFilter] = useState<"all" | "unmatched" | "matched" | "flagged">("all");

  // Sheet for adding new transaction from a bank line
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [prefillLine, setPrefillLine] = useState<BankStatementLine | null>(null);

  // Confirm dialogs
  const [confirmAutoMatch, setConfirmAutoMatch] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Derived stats
  const stats: ReconciliationStats = useMemo(() => {
    const matched   = lines.filter((l) => l.status === "matched");
    const unmatched = lines.filter((l) => l.status === "unmatched");
    const flagged   = lines.filter((l) => l.status === "flagged");
    return {
      total:           lines.length,
      matched:         matched.length,
      unmatched:       unmatched.length,
      flagged:         flagged.length,
      matchedAmount:   matched.reduce((s, l) => s + Math.abs(l.amount), 0),
      unmatchedAmount: unmatched.reduce((s, l) => s + Math.abs(l.amount), 0),
    };
  }, [lines]);

  const autoMatchCandidates = lines.filter(
    (l) => l.status !== "matched" && (l.confidence ?? 0) >= 85
  ).length;
  const canFinalize = isLoaded && stats.unmatched === 0 && stats.flagged === 0 && stats.matched > 0;

  // ── Handlers
  const handleParsed = useCallback((parsed: BankStatementLine[]) => {
    setLines(parsed);
    setIsLoaded(true);
    toast({ variant: "success", title: "Statement loaded", description: `${parsed.length} bank lines ready for matching` });
  }, [toast]);

  const handleClear = () => {
    setLines([]);
    setIsLoaded(false);
    setActiveFilter("all");
  };

  const handleMatch = (lineId: string, txId: string) => {
    const tx = internalTxs.find((t) => t.id === txId);
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? { ...l, status: "matched" as const, matchedTransactionId: txId, matchedTransactionLabel: tx?.description }
          : l
      )
    );
    setInternalTxs((prev) =>
      prev.map((t) => t.id === txId ? { ...t, status: "reconciled" as const } : t)
    );
    toast({ variant: "success", title: "Matched", description: tx?.description });
  };

  const handleUnmatch = (lineId: string) => {
    const line = lines.find((l) => l.id === lineId);
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? { ...l, status: "unmatched" as const, matchedTransactionId: undefined, matchedTransactionLabel: undefined }
          : l
      )
    );
    if (line?.matchedTransactionId) {
      setInternalTxs((prev) =>
        prev.map((t) =>
          t.id === line.matchedTransactionId ? { ...t, status: "pending" as const } : t
        )
      );
    }
  };

  const handleFlag = (lineId: string) => {
    setLines((prev) => prev.map((l) => l.id === lineId ? { ...l, status: "flagged" as const } : l));
    toast({ variant: "warning", title: "Line flagged for review" });
  };

  const handleAddAsNew = (line: BankStatementLine) => {
    setPrefillLine(line);
    setAddSheetOpen(true);
  };

  const handleSaveNewTx = (data: TransactionFormData) => {
    const newTx: InternalTransaction = {
      id: `tx-${Date.now()}`,
      date: data.date,
      type: data.type === "Income" ? "income" : "expense",
      category: data.category,
      description: data.description,
      amount: parseFloat(data.amount),
      status: "reconciled",
    };
    setInternalTxs((prev) => [newTx, ...prev]);
    // Auto-link the bank line to this new transaction
    if (prefillLine) {
      setLines((prev) =>
        prev.map((l) =>
          l.id === prefillLine.id
            ? { ...l, status: "matched" as const, matchedTransactionId: newTx.id, matchedTransactionLabel: newTx.description }
            : l
        )
      );
    }
    setAddSheetOpen(false);
    setPrefillLine(null);
    toast({ variant: "success", title: "Transaction created and matched" });
  };

  const handleAutoMatch = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const { lines: next, matchedTxIds } = applyAutoMatch(lines, internalTxs);
    setLines(next);
    setInternalTxs((prev) =>
      prev.map((t) => matchedTxIds.includes(t.id) ? { ...t, status: "reconciled" as const } : t)
    );
    const newlyMatched = next.filter((l) => l.status === "matched").length - stats.matched;
    setIsProcessing(false);
    setConfirmAutoMatch(false);
    toast({ variant: "success", title: `Auto-matched ${newlyMatched} line${newlyMatched !== 1 ? "s" : ""}` });
  };

  const handleFinalize = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsProcessing(false);
    setConfirmFinalize(false);
    toast({ variant: "success", title: "Reconciliation finalised", description: `${stats.matched} lines locked` });
    setTimeout(() => router.push("/client/transactions/reconciliation"), 1200);
  };

  // Pre-fill data for the Add Transaction sheet
  const sheetInitial: Partial<TransactionFormData> | null = prefillLine
    ? {
        date: prefillLine.date,
        type: prefillLine.rawType === "credit" ? "Income" : "Expense",
        description: prefillLine.description
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        amount: String(Math.abs(prefillLine.amount)),
        category: "",
        reference: "",
      }
    : null;

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">

        {/* Back nav */}
        <button
          type="button"
          onClick={() => router.push("/client/transactions/reconciliation")}
          className="flex items-center gap-2 mb-5 text-sm transition-opacity hover:opacity-70"
          style={{ color: "#6B7280" }}
        >
          <ArrowLeft size={15} />
          Back to Reconciliation History
        </button>

        {/* Header */}
        <PageHeader
          badge="Reconciliation"
          title="New Reconciliation"
          description="Upload a bank statement to match and reconcile transactions."
          actions={
            <div className="flex items-center gap-2">
              {isLoaded && autoMatchCandidates > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmAutoMatch(true)}
                  className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold border transition-colors"
                  style={{ borderColor: `${BRAND.accent}40`, color: BRAND.accent, backgroundColor: `${BRAND.accent}10` }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}10`; }}
                >
                  <RefreshCw size={14} />
                  Auto-Match ({autoMatchCandidates})
                </button>
              )}

              {isLoaded && (
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
                  style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                >
                  <Download size={14} />
                  Export
                </button>
              )}

              {isLoaded && (
                <button
                  type="button"
                  onClick={() => canFinalize && setConfirmFinalize(true)}
                  disabled={!canFinalize}
                  title={canFinalize ? "Finalise reconciliation" : "Resolve all unmatched and flagged lines first"}
                  className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold transition-colors"
                  style={{
                    backgroundColor: canFinalize ? BRAND.gold : "rgba(255,255,255,0.06)",
                    color: canFinalize ? BRAND.primary : "rgba(255,255,255,0.3)",
                    cursor: canFinalize ? "pointer" : "not-allowed",
                  }}
                >
                  <CheckCheck size={14} />
                  Finalise
                </button>
              )}
            </div>
          }
        />

        {/* Stats */}
        <ReconciliationStatsCards stats={stats} isLoaded={isLoaded} />

        {/* Gauge + Upload side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4 mb-5">
          <ReconciliationGauge stats={stats} isLoaded={isLoaded} />
          <UploadStatement
            onParsed={handleParsed}
            isLoaded={isLoaded}
            onClear={handleClear}
            mockData={MOCK_BANK_LINES}
          />
        </div>

        {/* Table or empty state */}
        {isLoaded ? (
          <ReconciliationTable
            lines={lines}
            internalTransactions={internalTxs}
            onMatch={handleMatch}
            onUnmatch={handleUnmatch}
            onFlag={handleFlag}
            onAddAsNew={handleAddAsNew}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        ) : (
          <div
            className="rounded-2xl border p-16 flex flex-col items-center gap-4 text-center"
            style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)", borderStyle: "dashed" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              <ArrowLeftRight size={28} style={{ color: BRAND.muted }} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base mb-1">No statement uploaded</h3>
              <p className="text-sm" style={{ color: BRAND.muted }}>
                Upload your bank statement above to begin matching transactions
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Add transaction sheet (pre-filled from bank line) */}
      <AddTransactionSheet
        open={addSheetOpen}
        onClose={() => { setAddSheetOpen(false); setPrefillLine(null); }}
        onSave={handleSaveNewTx}
        mode="add"
        initial={sheetInitial}
      />

      {/* Auto-match confirm */}
      <ConfirmDialog
        open={confirmAutoMatch}
        title="Auto-Match Transactions"
        description={`AccuBridge found ${autoMatchCandidates} high-confidence match${autoMatchCandidates !== 1 ? "es" : ""} (≥85% score). Automatically link these bank lines to their corresponding transactions?`}
        confirmLabel={isProcessing ? "Matching…" : "Auto-Match Now"}
        cancelLabel="Review Manually"
        variant="default"
        onConfirm={handleAutoMatch}
        onCancel={() => setConfirmAutoMatch(false)}
      />

      {/* Finalise confirm */}
      <ConfirmDialog
        open={confirmFinalize}
        title="Finalise Reconciliation"
        description={`All ${stats.matched} bank lines are matched. This will mark all matched transactions as reconciled and lock this statement. This action cannot be undone.`}
        confirmLabel={isProcessing ? "Finalising…" : "Finalise & Lock"}
        cancelLabel="Review Again"
        variant="warning"
        onConfirm={handleFinalize}
        onCancel={() => setConfirmFinalize(false)}
      />
    </div>
  );
}
