"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCheck,
  Download,
  RefreshCw,
  Loader2,
  AlertOctagon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AddTransactionSheet, type TransactionFormData } from "../../_components/add-transaction-sheet";
import { ReconciliationStatsCards, ReconciliationGauge } from "../_components/reconciliation-stats";
import { ReconciliationTable } from "../_components/reconciliation-table";
import { useToast } from "@/components/shared/toast";
import {
  useGetReconciliationDetailQuery,
  useAutoMatchMutation,
  useFinaliseReconciliationMutation,
  useAddNewTransactionMutation,
} from "@/lib/api/reconciliationApi";
import type { ApiReconciliationLine } from "@/lib/api/reconciliationApi";
import type { ReconciliationStats } from "@/types/reconciliation";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280", red: "#ef4444" };

export default function ReconciliationDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { toast } = useToast();

  const { data: detail, isLoading, isError } = useGetReconciliationDetailQuery({ id });
  const [autoMatch, { isLoading: isAutoMatching }] = useAutoMatchMutation();
  const [finalise, { isLoading: isFinalising }] = useFinaliseReconciliationMutation();
  const [addNew] = useAddNewTransactionMutation();

  const [confirmAutoMatch, setConfirmAutoMatch] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unmatched" | "matched" | "flagged">("all");
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [prefillLine, setPrefillLine] = useState<ApiReconciliationLine | null>(null);

  // Derive display stats from detail
  const stats: ReconciliationStats = useMemo(() => {
    if (!detail) return { total: 0, matched: 0, unmatched: 0, flagged: 0, matchedAmount: 0, unmatchedAmount: 0 };
    const lines = detail.lines ?? [];
    const matchedLines   = lines.filter((l) => l.matchStatus === "Matched");
    const unmatchedLines = lines.filter((l) => l.matchStatus === "Unmatched");
    return {
      total:           detail.totalLines,
      matched:         detail.matchedCount,
      unmatched:       detail.unmatchedCount,
      flagged:         detail.flaggedCount,
      matchedAmount:   matchedLines.reduce((s, l) => s + Math.abs(l.amount), 0),
      unmatchedAmount: unmatchedLines.reduce((s, l) => s + Math.abs(l.amount), 0),
    };
  }, [detail]);

  const autoMatchCandidates = detail?.autoMatchCount ?? 0;
  const canFinalize = !!(detail && detail.unmatchedCount === 0 && detail.matchedCount > 0);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  async function handleAutoMatch() {
    const result = await autoMatch(id);
    if ("data" in result) {
      toast({ variant: "success", title: `Auto-matched ${result.data.MatchedCount} line${result.data.MatchedCount !== 1 ? "s" : ""}` });
    } else {
      toast({ variant: "error", title: "Auto-match failed" });
    }
    setConfirmAutoMatch(false);
  }

  async function handleFinalize() {
    const result = await finalise(id);
    if ("data" in result && result.data.success) {
      toast({ variant: "success", title: "Reconciliation finalised", description: `${stats.matched} lines locked` });
      setTimeout(() => router.push("/client/transactions/reconciliation"), 1000);
    } else {
      toast({ variant: "error", title: "Finalisation failed", description: "Ensure all unmatched lines are resolved." });
    }
    setConfirmFinalize(false);
  }

  function handleAddAsNew(line: ApiReconciliationLine) {
    setPrefillLine(line);
    setAddSheetOpen(true);
  }

  async function handleSaveNewTx(data: TransactionFormData) {
    if (!prefillLine) return;
    const result = await addNew({
      id,
      lineId: prefillLine.id,
      category: data.category,
      description: data.description || undefined,
      referenceNo: data.reference || undefined,
    });
    if ("data" in result) {
      toast({ variant: "success", title: "Transaction created and matched" });
    } else {
      toast({ variant: "error", title: "Failed to create transaction" });
    }
    setAddSheetOpen(false);
    setPrefillLine(null);
  }

  function handleExport() {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const base = "https://verifybridge.runasp.net/api";
    fetch(`${base}/reconciliation/${id}/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reconciliation-${id}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => toast({ variant: "error", title: "Export failed" }));
  }

  // Pre-fill sheet
  const sheetInitial: Partial<TransactionFormData> | null = prefillLine
    ? {
        date: prefillLine.dateFormatted,
        type: prefillLine.isIncome ? "Income" : "Expense",
        description: prefillLine.description
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        amount: String(Math.abs(prefillLine.amount)),
        category: "",
        reference: "",
      }
    : null;

  // ── Render ────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center gap-3 text-white">
        <Loader2 size={20} className="animate-spin" style={{ color: BRAND.muted }} />
        <span style={{ color: BRAND.muted }}>Loading reconciliation…</span>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="p-8 flex flex-col items-center gap-3 text-white">
        <AlertOctagon size={24} style={{ color: BRAND.red }} />
        <p style={{ color: BRAND.muted }}>Failed to load reconciliation. Please try again.</p>
        <button
          type="button"
          onClick={() => router.push("/client/transactions/reconciliation")}
          style={{ color: BRAND.accent, fontSize: "14px" }}
        >
          Back to history
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">

        {/* Back nav */}
        <button
          type="button"
          onClick={() => router.push("/client/transactions/reconciliation")}
          className="flex items-center gap-2 mb-5 text-sm transition-opacity hover:opacity-70"
          style={{ color: BRAND.muted }}
        >
          <ArrowLeft size={15} />
          Back to Reconciliation History
        </button>

        {/* Header */}
        <PageHeader
          badge="Reconciliation"
          title={detail.period}
          description={`${detail.bankName} · ${detail.fileName} · ${detail.progressLabel}`}
          actions={
            <div className="flex items-center gap-2">
              {autoMatchCandidates > 0 && (
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

              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
              >
                <Download size={14} />
                Export
              </button>

              <button
                type="button"
                onClick={() => canFinalize && setConfirmFinalize(true)}
                disabled={!canFinalize}
                title={canFinalize ? "Finalise reconciliation" : "Resolve all unmatched lines first"}
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
            </div>
          }
        />

        {/* Stats */}
        <ReconciliationStatsCards stats={stats} isLoaded />

        {/* Gauge */}
        <div className="mb-5">
          <ReconciliationGauge stats={stats} isLoaded />
        </div>

        {/* Table */}
        <ReconciliationTable
          lines={detail.lines}
          reconciliationId={id}
          onAddAsNew={handleAddAsNew}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

      </div>

      {/* Add transaction sheet */}
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
        confirmLabel={isAutoMatching ? "Matching…" : "Auto-Match Now"}
        cancelLabel="Review Manually"
        variant="default"
        onConfirm={handleAutoMatch}
        onCancel={() => setConfirmAutoMatch(false)}
      />

      {/* Finalise confirm */}
      <ConfirmDialog
        open={confirmFinalize}
        title="Finalise Reconciliation"
        description={`All ${stats.matched} bank lines are matched. This will lock this statement. This action cannot be undone.`}
        confirmLabel={isFinalising ? "Finalising…" : "Finalise & Lock"}
        cancelLabel="Review Again"
        variant="warning"
        onConfirm={handleFinalize}
        onCancel={() => setConfirmFinalize(false)}
      />
    </div>
  );
}
