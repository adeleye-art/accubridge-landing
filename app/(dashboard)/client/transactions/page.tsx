"use client";

import React, { useState, useMemo } from "react";
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
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { AddTransactionSheet, type TransactionFormData } from "./_components/add-transaction-sheet";
import { useCurrency } from "@/lib/currency-context";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TxType = "Income" | "Expense";
type SortField = "date" | "type" | "category" | "amount";
type SortDir = "asc" | "desc";

interface Transaction {
  id: string;
  date: string;        // ISO date string
  type: TxType;
  category: string;
  description: string;
  amount: number;      // positive number in £
  reference: string;
}

// ─── Mock seed data ────────────────────────────────────────────────────────────

const SEED: Transaction[] = [
  { id: "1", date: "2026-03-08", type: "Expense", category: "Salaries & Wages",  description: "March payroll",          amount: 8700,  reference: "PAY-032026" },
  { id: "2", date: "2026-03-05", type: "Income",  category: "Sales Revenue",     description: "Client A invoice",       amount: 14200, reference: "INV-0041" },
  { id: "3", date: "2026-03-03", type: "Expense", category: "Office Rent",       description: "March office rent",      amount: 2400,  reference: "RENT-03" },
  { id: "4", date: "2026-02-28", type: "Income",  category: "Consulting",        description: "Strategy session",       amount: 3500,  reference: "INV-0040" },
  { id: "5", date: "2026-02-20", type: "Expense", category: "Software & Tools",  description: "SaaS subscriptions",     amount: 420,   reference: "" },
  { id: "6", date: "2026-02-15", type: "Income",  category: "Service Fees",      description: "Ongoing retainer",       amount: 6000,  reference: "INV-0039" },
  { id: "7", date: "2026-02-10", type: "Expense", category: "Marketing & Ads",   description: "Google Ads budget",      amount: 1200,  reference: "" },
  { id: "8", date: "2026-01-31", type: "Expense", category: "Professional Services", description: "Legal review",       amount: 850,   reference: "LEGAL-02" },
  { id: "9", date: "2026-01-20", type: "Income",  category: "Grants & Funding",  description: "Innovate UK grant",      amount: 25000, reference: "GRANT-001" },
  { id: "10",date: "2026-01-15", type: "Expense", category: "Equipment",         description: "Laptop replacement",     amount: 1350,  reference: "PO-005" },
  { id: "11",date: "2026-01-10", type: "Income",  category: "Sales Revenue",     description: "Client B invoice",       amount: 9800,  reference: "INV-0038" },
  { id: "12",date: "2025-12-31", type: "Expense", category: "Insurance",         description: "Annual premium",         amount: 1800,  reference: "INS-2025" },
];

const PAGE_SIZE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypePill({ type }: { type: TxType }) {
  const isIncome = type === "Income";
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: "999px",
        border: `1px solid ${isIncome ? "rgba(6,214,160,0.35)" : "rgba(239,68,68,0.35)"}`,
        color: isIncome ? "#06D6A0" : "#ef4444",
        backgroundColor: isIncome ? "rgba(6,214,160,0.08)" : "rgba(239,68,68,0.08)",
        whiteSpace: "nowrap",
      }}
    >
      {type}
    </span>
  );
}

function SortIcon({ field, active, dir }: { field: SortField; active: SortField; dir: SortDir }) {
  if (field !== active) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
  return dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { fmt } = useCurrency();
  const { toast } = useToast();

  // ── Data state
  const [txns, setTxns] = useState<Transaction[]>(SEED);

  // ── Filters
  const [search, setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | TxType>("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir]   = useState<SortDir>("desc");
  const [page, setPage]         = useState(1);

  // ── Sheet state
  const [sheetOpen, setSheetOpen]   = useState(false);
  const [sheetMode, setSheetMode]   = useState<"add" | "edit">("add");
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  // ── Confirm delete state
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  // ── Derived: filtered + sorted + paginated
  const filtered = useMemo(() => {
    let list = txns;
    if (typeFilter !== "All") list = list.filter((t) => t.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let diff = 0;
      if (sortField === "date")     diff = a.date.localeCompare(b.date);
      if (sortField === "type")     diff = a.type.localeCompare(b.type);
      if (sortField === "category") diff = a.category.localeCompare(b.category);
      if (sortField === "amount")   diff = a.amount - b.amount;
      return sortDir === "asc" ? diff : -diff;
    });
    return list;
  }, [txns, typeFilter, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Summary stats
  const totalIncome  = txns.filter((t) => t.type === "Income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = txns.filter((t) => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
  const netProfit    = totalIncome - totalExpense;

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

  function openEdit(tx: Transaction) {
    setSheetMode("edit");
    setEditTarget(tx);
    setSheetOpen(true);
  }

  function handleSave(data: TransactionFormData) {
    const amount = parseFloat(data.amount);
    if (sheetMode === "add") {
      const newTx: Transaction = {
        id: newId(),
        date: data.date,
        type: data.type,
        category: data.category,
        description: data.description,
        amount,
        reference: data.reference,
      };
      setTxns((prev) => [newTx, ...prev]);
      toast({ variant: "success", title: "Transaction added", description: `${data.type}: ${fmt(amount)}` });
    } else if (editTarget) {
      setTxns((prev) =>
        prev.map((t) =>
          t.id === editTarget.id
            ? { ...t, date: data.date, type: data.type, category: data.category, description: data.description, amount, reference: data.reference }
            : t
        )
      );
      toast({ variant: "success", title: "Transaction updated" });
    }
    setSheetOpen(false);
    setPage(1);
  }

  function confirmDelete(tx: Transaction) {
    setDeleteTarget(tx);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setTxns((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    toast({ variant: "error", title: "Transaction deleted", description: deleteTarget.category });
    setDeleteTarget(null);
    setPage(1);
  }

  const cardStyle: React.CSSProperties = {
    borderRadius: "16px",
    padding: "18px 20px",
    border: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  };

  const colBtnStyle = (field: SortField): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "none",
    border: "none",
    color: sortField === field ? "rgba(255,255,255,0.9)" : "#6B7280",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    padding: 0,
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
            <button
              onClick={openAdd}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "12px",
                background: "#D4AF37",
                color: "#0A2463",
                fontWeight: 700,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Plus size={16} />
              Add Transaction
            </button>
          }
        />

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Income */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={16} style={{ color: "#06D6A0" }} />
              </div>
              <span style={{ color: "#6B7280", fontSize: "12px", fontWeight: 600 }}>Total Income</span>
            </div>
            <div style={{ color: "#06D6A0", fontSize: "22px", fontWeight: 700 }}>{fmt(totalIncome)}</div>
          </div>
          {/* Expenses */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingDown size={16} style={{ color: "#ef4444" }} />
              </div>
              <span style={{ color: "#6B7280", fontSize: "12px", fontWeight: 600 }}>Total Expenses</span>
            </div>
            <div style={{ color: "#ef4444", fontSize: "22px", fontWeight: 700 }}>{fmt(totalExpense)}</div>
          </div>
          {/* Net */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(62,146,204,0.12)", border: "1px solid rgba(62,146,204,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DollarSign size={16} style={{ color: "#3E92CC" }} />
              </div>
              <span style={{ color: "#6B7280", fontSize: "12px", fontWeight: 600 }}>Net Profit</span>
            </div>
            <div style={{ color: netProfit >= 0 ? "#06D6A0" : "#ef4444", fontSize: "22px", fontWeight: 700 }}>
              {fmt(netProfit)}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: "180px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6B7280" }} />
            <input
              type="text"
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "white",
                fontSize: "13px",
                padding: "9px 12px 9px 34px",
                outline: "none",
              }}
            />
          </div>

          {/* Type filter tabs */}
          <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "4px", border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["All", "Income", "Expense"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.15s",
                  background: typeFilter === t ? "rgba(212,175,55,0.15)" : "transparent",
                  color: typeFilter === t ? "#D4AF37" : "#6B7280",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", color: "#6B7280", fontSize: "12px" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table */}
        <div style={{ borderRadius: "18px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
          {/* Col headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "110px 90px 1fr 130px 100px",
              gap: "8px",
              padding: "12px 20px",
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <button style={colBtnStyle("date")}    onClick={() => handleSort("date")}>    Date    <SortIcon field="date"     active={sortField} dir={sortDir} /></button>
            <button style={colBtnStyle("type")}    onClick={() => handleSort("type")}>    Type    <SortIcon field="type"     active={sortField} dir={sortDir} /></button>
            <button style={colBtnStyle("category")}onClick={() => handleSort("category")}>Category<SortIcon field="category" active={sortField} dir={sortDir} /></button>
            <button style={colBtnStyle("amount")}  onClick={() => handleSort("amount")}>  Amount  <SortIcon field="amount"   active={sortField} dir={sortDir} /></button>
            <span style={{ color: "#6B7280", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "right" }}>Actions</span>
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#6B7280" }}>
              <Filter size={28} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div style={{ fontSize: "14px" }}>No transactions match your filters.</div>
            </div>
          ) : (
            paginated.map((tx, i) => (
              <div
                key={tx.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 90px 1fr 130px 100px",
                  gap: "8px",
                  alignItems: "center",
                  padding: "14px 20px",
                  borderBottom: i < paginated.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  transition: "background 0.12s",
                }}
                className="hover:bg-white/[0.02]"
              >
                {/* Date */}
                <span style={{ color: "#6B7280", fontSize: "13px" }}>{fmtDate(tx.date)}</span>

                {/* Type */}
                <TypePill type={tx.type} />

                {/* Category + description */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tx.category}
                  </div>
                  {tx.description && (
                    <div style={{ color: "#6B7280", fontSize: "11px", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {tx.description}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <span style={{ color: tx.type === "Income" ? "#06D6A0" : "#ef4444", fontWeight: 700, fontSize: "14px", textAlign: "right" }}>
                  {tx.type === "Income" ? "+" : "-"}{fmt(tx.amount)}
                </span>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => openEdit(tx)}
                    title="Edit"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      color: "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => confirmDelete(tx)}
                    title="Delete"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "8px",
                      background: "rgba(239,68,68,0.07)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "#ef4444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: 32,
                height: 32,
                borderRadius: "9px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: page === 1 ? "#3B4052" : "rgba(255,255,255,0.7)",
                cursor: page === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "9px",
                  background: p === page ? "#D4AF37" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${p === page ? "#D4AF37" : "rgba(255,255,255,0.09)"}`,
                  color: p === page ? "#0A2463" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  fontWeight: p === page ? 700 : 400,
                  fontSize: "13px",
                }}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                width: 32,
                height: 32,
                borderRadius: "9px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: page === totalPages ? "#3B4052" : "rgba(255,255,255,0.7)",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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
                date: editTarget.date,
                type: editTarget.type,
                category: editTarget.category,
                description: editTarget.description,
                amount: editTarget.amount.toString(),
                reference: editTarget.reference,
              }
            : null
        }
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Transaction"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.category}" (${fmt(deleteTarget.amount)})? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
