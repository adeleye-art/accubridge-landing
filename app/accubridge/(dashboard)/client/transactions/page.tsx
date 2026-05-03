"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/accubridge/shared/page-header";
import { ConfirmDialog } from "@/components/accubridge/shared/confirm-dialog";
import { useToast } from "@/components/accubridge/shared/toast";
import { AddTransactionSheet, type TransactionFormData } from "./_components/add-transaction-sheet";
import {
  useGetTransactionsQuery,
  useGetTransactionSummaryQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  ApiTransaction,
} from "@/lib/accubridge/api/transactionApi";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TxType = "All" | "Income" | "Expense";
type SortField = "date" | "type" | "category" | "amount";
type SortDir = "asc" | "desc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Skeleton({ w = "100%" }: { w?: string }) {
  return <div style={{ width: w, height: "16px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.08)", animation: "pulse 1.5s infinite" }} />;
}

function TypePill({ isIncome }: { isIncome: boolean }) {
  return (
    <span style={{
      fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px",
      border: `1px solid ${isIncome ? "rgba(6,214,160,0.35)" : "rgba(239,68,68,0.35)"}`,
      color: isIncome ? "#06D6A0" : "#ef4444",
      backgroundColor: isIncome ? "rgba(6,214,160,0.08)" : "rgba(239,68,68,0.08)",
      whiteSpace: "nowrap",
    }}>
      {isIncome ? "Income" : "Expense"}
    </span>
  );
}

function SortIcon({ field, active, dir }: { field: SortField; active: SortField; dir: SortDir }) {
  if (field !== active) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
  return dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const { toast } = useToast();

  // ── Filters / sort / page state
  const [search, setSearch]         = useState("");
  const [debSearch, setDebSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState<TxType>("All");
  const [sortField, setSortField]   = useState<SortField>("date");
  const [sortDir, setSortDir]       = useState<SortDir>("desc");
  const [page, setPage]             = useState(1);

  // ── Sheet state
  const [sheetOpen, setSheetOpen]   = useState(false);
  const [sheetMode, setSheetMode]   = useState<"add" | "edit">("add");
  const [editTarget, setEditTarget] = useState<ApiTransaction | null>(null);

  // ── Confirm delete state
  const [deleteTarget, setDeleteTarget] = useState<ApiTransaction | null>(null);

  // ── Debounce search
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebSearch(val); setPage(1); }, 300);
  }

  const typeNum = typeFilter === "Income" ? 1 : typeFilter === "Expense" ? 2 : undefined;

  const { data, isLoading, isFetching } = useGetTransactionsQuery({
    search: debSearch || undefined,
    type: typeNum,
    sortBy: sortField,
    sortDesc: sortDir === "desc",
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: summary } = useGetTransactionSummaryQuery();

  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const [deleteTransaction, { isLoading: deleting }] = useDeleteTransactionMutation();

  const transactions = data?.transactions ?? [];
  const totalCount   = data?.totalCount ?? 0;
  const totalPages   = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ── Handlers

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  }

  function openAdd() {
    setSheetMode("add");
    setEditTarget(null);
    setSheetOpen(true);
  }

  function openEdit(tx: ApiTransaction) {
    setSheetMode("edit");
    setEditTarget(tx);
    setSheetOpen(true);
  }

  async function handleSave(formData: TransactionFormData) {
    const body = {
      type: formData.type === "Income" ? 1 : 2,
      date: new Date(formData.date).toISOString(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description || "",
      referenceNo: formData.reference || null,
    };
    try {
      if (sheetMode === "add") {
        await createTransaction(body).unwrap();
        toast({ variant: "success", title: "Transaction added" });
      } else if (editTarget) {
        await updateTransaction({ id: editTarget.id, body }).unwrap();
        toast({ variant: "success", title: "Transaction updated" });
      }
      setSheetOpen(false);
      setPage(1);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to save transaction";
      toast({ variant: "error", title: msg });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteTransaction(deleteTarget.id).unwrap();
      toast({ variant: "error", title: "Transaction deleted", description: deleteTarget.category });
      setDeleteTarget(null);
      if (transactions.length === 1 && page > 1) setPage((p) => p - 1);
    } catch {
      toast({ variant: "error", title: "Failed to delete transaction" });
    }
  }

  const cardStyle: React.CSSProperties = {
    borderRadius: "16px", padding: "18px 20px",
    border: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    display: "flex", flexDirection: "column", gap: "6px",
  };

  const colBtnStyle = (field: SortField): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: "5px",
    background: "none", border: "none",
    color: sortField === field ? "rgba(255,255,255,0.9)" : "#6B7280",
    cursor: "pointer", fontSize: "11px", fontWeight: 600,
    letterSpacing: "0.06em", padding: 0,
    textTransform: "uppercase" as const,
  });

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <PageHeader
          badge="Finances"
          title="Transactions"
          description="Track your income and expenses."
          actions={
            <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", background: "#D4AF37", color: "#0A2463", fontWeight: 700, fontSize: "14px", border: "none", cursor: "pointer" }}>
              <Plus size={16} /> Add Transaction
            </button>
          }
        />

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={16} style={{ color: "#06D6A0" }} />
              </div>
              <span style={{ color: "#6B7280", fontSize: "12px", fontWeight: 600 }}>Total Income</span>
            </div>
            <div style={{ color: "#06D6A0", fontSize: "22px", fontWeight: 700 }}>
              {summary ? `£${(summary.totalIncome ?? 0).toLocaleString()}` : <Skeleton />}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingDown size={16} style={{ color: "#ef4444" }} />
              </div>
              <span style={{ color: "#6B7280", fontSize: "12px", fontWeight: 600 }}>Total Expenses</span>
            </div>
            <div style={{ color: "#ef4444", fontSize: "22px", fontWeight: 700 }}>
              {summary ? `£${(summary.totalExpenses ?? 0).toLocaleString()}` : <Skeleton />}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(62,146,204,0.12)", border: "1px solid rgba(62,146,204,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DollarSign size={16} style={{ color: "#3E92CC" }} />
              </div>
              <span style={{ color: "#6B7280", fontSize: "12px", fontWeight: 600 }}>Net Profit</span>
            </div>
            <div style={{ color: (summary?.netProfit ?? 0) >= 0 ? "#06D6A0" : "#ef4444", fontSize: "22px", fontWeight: 700 }}>
              {summary ? `£${(summary.netProfit ?? 0).toLocaleString()}` : <Skeleton />}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: "180px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6B7280" }} />
            <input type="text" placeholder="Search transactions…" value={search} onChange={(e) => handleSearch(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", fontSize: "13px", padding: "9px 12px 9px 34px", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "4px", border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["All", "Income", "Expense"] as const).map((t) => (
              <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }}
                style={{ padding: "6px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.15s", background: typeFilter === t ? "rgba(212,175,55,0.15)" : "transparent", color: typeFilter === t ? "#D4AF37" : "#6B7280" }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", color: "#6B7280", fontSize: "12px" }}>
            {totalCount} result{totalCount !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table */}
        <div style={{ borderRadius: "18px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
          {/* Col headers */}
          <div style={{ display: "grid", gridTemplateColumns: "110px 90px 1fr 130px 100px", gap: "8px", padding: "12px 20px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <button style={colBtnStyle("date")}     onClick={() => handleSort("date")}>     Date    <SortIcon field="date"     active={sortField} dir={sortDir} /></button>
            <button style={colBtnStyle("type")}     onClick={() => handleSort("type")}>     Type    <SortIcon field="type"     active={sortField} dir={sortDir} /></button>
            <button style={colBtnStyle("category")} onClick={() => handleSort("category")}> Category<SortIcon field="category" active={sortField} dir={sortDir} /></button>
            <button style={colBtnStyle("amount")}   onClick={() => handleSort("amount")}>   Amount  <SortIcon field="amount"   active={sortField} dir={sortDir} /></button>
            <span style={{ color: "#6B7280", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "right" }}>Actions</span>
          </div>

          {/* Rows */}
          {isLoading || isFetching
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 90px 1fr 130px 100px", gap: "8px", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {Array.from({ length: 5 }).map((__, j) => <Skeleton key={j} />)}
                </div>
              ))
            : transactions.length === 0
              ? (
                  <div style={{ padding: "48px", textAlign: "center", color: "#6B7280" }}>
                    <Filter size={28} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                    <div style={{ fontSize: "14px" }}>No transactions match your filters.</div>
                  </div>
                )
              : transactions.map((tx, i) => (
                  <div key={tx.id}
                    style={{ display: "grid", gridTemplateColumns: "110px 90px 1fr 130px 100px", gap: "8px", alignItems: "center", padding: "14px 20px", borderBottom: i < transactions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.12s" }}
                    className="hover:bg-white/[0.02]">
                    <span style={{ color: "#6B7280", fontSize: "13px" }}>{tx.dateFormatted}</span>
                    <TypePill isIncome={tx.isIncome} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.category}</div>
                      {tx.description && (
                        <div style={{ color: "#6B7280", fontSize: "11px", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.description}</div>
                      )}
                    </div>
                    <span style={{ color: tx.isIncome ? "#06D6A0" : "#ef4444", fontWeight: 700, fontSize: "14px", textAlign: "right" }}>{tx.formattedAmount}</span>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button onClick={() => openEdit(tx)} title="Edit" style={{ width: 30, height: 30, borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteTarget(tx)} title="Delete" style={{ width: 30, height: 30, borderRadius: "8px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 32, height: 32, borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: page === 1 ? "#3B4052" : "rgba(255,255,255,0.7)", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width: 32, height: 32, borderRadius: "9px", background: p === page ? "#D4AF37" : "rgba(255,255,255,0.05)", border: `1px solid ${p === page ? "#D4AF37" : "rgba(255,255,255,0.09)"}`, color: p === page ? "#0A2463" : "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: p === page ? 700 : 400, fontSize: "13px" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 32, height: 32, borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: page === totalPages ? "#3B4052" : "rgba(255,255,255,0.7)", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>

      {/* Add/Edit Sheet */}
      <AddTransactionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
        mode={sheetMode}
        initial={
          editTarget
            ? {
                date: editTarget.date.split("T")[0],
                type: editTarget.isIncome ? "Income" : "Expense",
                category: editTarget.category,
                description: editTarget.description,
                amount: String(editTarget.amount),
                reference: editTarget.referenceNo ?? "",
              }
            : null
        }
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Transaction"
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.category}" (${deleteTarget.formattedAmount})? This action cannot be undone.` : ""}
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
