"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Pencil, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PermissionGuard } from "@/components/accubridge/auth/permission-guard";
import { ConfirmDialog } from "@/components/accubridge/shared/confirm-dialog";
import { SystemSheet } from "@/components/accubridge/shared/system-sheet";
import { useToast } from "@/components/accubridge/shared/toast";
import {
  useGetTransactionsQuery,
  useGetTransactionSummaryQuery,
  useGetTransactionCategoriesQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  ApiTransaction,
} from "@/lib/accubridge/api/transactionApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const TYPE_TABS = [
  { label: "All",     value: undefined },
  { label: "Income",  value: 1 },
  { label: "Expense", value: 2 },
];

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ""}`} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />;
}

// ─── Shared form types & component ───────────────────────────────────────────

interface TxFormState {
  type: number;
  date: string;
  category: string;
  amount: string;
  description: string;
  referenceNo: string;
}

const EMPTY_FORM: TxFormState = { type: 2, date: "", category: "", amount: "", description: "", referenceNo: "" };

const inputStyle = { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)", color: "white" };
const labelStyle = { color: "rgba(255,255,255,0.7)" };

function TransactionForm({
  form,
  setForm,
  categories,
}: {
  form: TxFormState;
  setForm: React.Dispatch<React.SetStateAction<TxFormState>>;
  categories: string[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={labelStyle}>Type</label>
        <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: Number(e.target.value), category: "" }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
          <option value={1} style={{ background: "#0A2463" }}>Income</option>
          <option value={2} style={{ background: "#0A2463" }}>Expense</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={labelStyle}>Date</label>
        <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={labelStyle}>Category</label>
        <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
          <option value="" style={{ background: "#0A2463" }}>Select category…</option>
          {categories.map((c) => <option key={c} value={c} style={{ background: "#0A2463" }}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={labelStyle}>Amount</label>
        <input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none placeholder-[#6B7280]" style={inputStyle} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={labelStyle}>Description</label>
        <input type="text" placeholder="e.g. March payroll" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none placeholder-[#6B7280]" style={inputStyle} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={labelStyle}>Reference No. <span style={{ color: BRAND.muted }}>(optional)</span></label>
        <input type="text" placeholder="e.g. INV-0042" value={form.referenceNo} onChange={(e) => setForm((f) => ({ ...f, referenceNo: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none placeholder-[#6B7280]" style={inputStyle} />
      </div>
    </div>
  );
}

// ─── Add sheet ────────────────────────────────────────────────────────────────

function AddTransactionSheet({ open, onClose, categories }: { open: boolean; onClose: () => void; categories: string[] }) {
  const [form, setForm] = useState<TxFormState>(EMPTY_FORM);
  const [createTransaction, { isLoading }] = useCreateTransactionMutation();
  const { toast } = useToast();

  useEffect(() => { if (!open) setForm(EMPTY_FORM); }, [open]);

  const handleSubmit = async () => {
    if (!form.date || !form.category || !form.amount || !form.description) {
      toast({ title: "Please fill in all required fields", variant: "error" });
      return;
    }
    try {
      await createTransaction({
        type: form.type,
        date: new Date(form.date).toISOString(),
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description,
        referenceNo: form.referenceNo || null,
      }).unwrap();
      toast({ title: "Transaction added", variant: "success" });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to add transaction";
      toast({ title: msg, variant: "error" });
    }
  };

  return (
    <SystemSheet open={open} title="New Transaction" description="Add a transaction to the platform." onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={isLoading} className="px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-60" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
            {isLoading ? "Saving…" : "Add Transaction"}
          </button>
        </div>
      }>
      <TransactionForm form={form} setForm={setForm} categories={categories} />
    </SystemSheet>
  );
}

// ─── Edit sheet ───────────────────────────────────────────────────────────────

function EditTransactionSheet({ tx, onClose, categories }: { tx: ApiTransaction | null; onClose: () => void; categories: string[] }) {
  const [form, setForm] = useState<TxFormState>(EMPTY_FORM);
  const [updateTransaction, { isLoading }] = useUpdateTransactionMutation();
  const { toast } = useToast();

  useEffect(() => {
    if (tx) {
      setForm({
        type: tx.typeValue,
        date: tx.date.split("T")[0],
        category: tx.category,
        amount: String(tx.amount),
        description: tx.description,
        referenceNo: tx.referenceNo ?? "",
      });
    }
  }, [tx]);

  const handleSave = async () => {
    if (!tx || !form.date || !form.category || !form.amount || !form.description) {
      toast({ title: "Please fill in all required fields", variant: "error" });
      return;
    }
    try {
      await updateTransaction({
        id: tx.id,
        body: {
          type: form.type,
          date: new Date(form.date).toISOString(),
          category: form.category,
          amount: parseFloat(form.amount),
          description: form.description,
          referenceNo: form.referenceNo || null,
        },
      }).unwrap();
      toast({ title: "Transaction updated", variant: "success" });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to update transaction";
      toast({ title: msg, variant: "error" });
    }
  };

  return (
    <SystemSheet open={!!tx} title="Edit Transaction" description="Update this transaction." onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSave} disabled={isLoading} className="px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-60" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
            {isLoading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      }>
      <TransactionForm form={form} setForm={setForm} categories={categories} />
    </SystemSheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTransactionsPage() {
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined);
  const [page, setPage]           = useState(1);
  const [addOpen, setAddOpen]     = useState(false);
  const [editTx, setEditTx]       = useState<ApiTransaction | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number }>({ open: false, id: 0 });
  const { toast } = useToast();

  const { data, isLoading, isFetching } = useGetTransactionsQuery({
    search: search || undefined,
    type: typeFilter,
    page,
    pageSize: 20,
    sortDesc: true,
  });

  const { data: summary }        = useGetTransactionSummaryQuery();
  const { data: catData }        = useGetTransactionCategoriesQuery();
  const [deleteTransaction, { isLoading: deleting }] = useDeleteTransactionMutation();

  const transactions = data?.transactions ?? [];
  const allCategories = catData?.all ?? [];

  const handleDelete = async () => {
    try {
      await deleteTransaction(deleteDialog.id).unwrap();
      toast({ title: "Transaction deleted", variant: "success" });
      setDeleteDialog({ open: false, id: 0 });
    } catch {
      toast({ title: "Failed to delete transaction", variant: "error" });
    }
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
            <h1 className="text-2xl font-bold tracking-tight">All Transactions</h1>
            <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>View and manage transactions across all client accounts.</p>
          </div>
          <PermissionGuard permission="add_transaction">
            <button type="button" onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
              <Plus size={16} /> New Transaction
            </button>
          </PermissionGuard>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Income",   value: summary.totalIncome   ?? 0, color: "#06D6A0", prefix: "+" },
              { label: "Total Expenses", value: summary.totalExpenses ?? 0, color: "#ef4444", prefix: "-" },
              { label: "Net Profit",     value: summary.netProfit     ?? 0, color: (summary.netProfit ?? 0) >= 0 ? "#06D6A0" : "#ef4444", prefix: "" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="text-xs mb-1" style={{ color: BRAND.muted }}>{s.label}</div>
                <div className="text-lg font-bold" style={{ color: s.color }}>
                  {s.prefix}£{s.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 max-w-xs" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color: BRAND.muted }} />
            <input type="text" placeholder="Search transactions…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] flex-1" />
          </div>
          <div className="flex gap-1.5">
            {TYPE_TABS.map((tab) => (
              <button key={tab.label} type="button" onClick={() => { setTypeFilter(tab.value); setPage(1); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{ backgroundColor: typeFilter === tab.value ? BRAND.gold : "rgba(255,255,255,0.06)", color: typeFilter === tab.value ? BRAND.primary : "rgba(255,255,255,0.6)" }}>
                {tab.label}
              </button>
            ))}
          </div>
          {data && (
            <span className="text-xs ml-auto" style={{ color: BRAND.muted }}>{data.totalCount} transactions</span>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Date", "Type", "Category", "Description", "Ref", "Amount", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading || isFetching
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: BRAND.muted }}>{t.dateFormatted}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                            color: t.isIncome ? "#06D6A0" : "#ef4444",
                            backgroundColor: t.isIncome ? "rgba(6,214,160,0.1)" : "rgba(239,68,68,0.1)",
                          }}>{t.type}</span>
                        </td>
                        <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.7)" }}>{t.category}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{t.description}</td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{t.referenceNo ?? "—"}</td>
                        <td className="px-5 py-3.5 font-bold" style={{ color: t.isIncome ? "#06D6A0" : "#ef4444" }}>{t.formattedAmount}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <PermissionGuard permission="edit_transaction">
                              <button type="button" onClick={() => setEditTx(t)}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: BRAND.muted }} title="Edit">
                                <Pencil size={14} />
                              </button>
                            </PermissionGuard>
                            <PermissionGuard permission="delete_transaction">
                              <button type="button" onClick={() => setDeleteDialog({ open: true, id: t.id })}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: "#ef4444" }} title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </PermissionGuard>
                          </div>
                        </td>
                      </tr>
                    ))
                }
                {!isLoading && !isFetching && transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalCount > 20 && (
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="text-xs" style={{ color: BRAND.muted }}>Page {page} · {data.totalCount} total</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={() => setPage((p) => p + 1)} disabled={transactions.length < 20}
                  className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <AddTransactionSheet open={addOpen} onClose={() => setAddOpen(false)} categories={allCategories} />
      <EditTransactionSheet tx={editTx} onClose={() => setEditTx(null)} categories={allCategories} />
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Transaction"
        description="Are you sure you want to permanently delete this transaction?"
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: 0 })}
      />
    </div>
  );
}
