"use client";

import React, { useState } from "react";
import { Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { useGetTransactionsQuery, useDeleteTransactionMutation, useGetTransactionSummaryQuery } from "@/lib/api/transactionApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const TYPE_TABS = [
  { label: "All",     value: undefined },
  { label: "Income",  value: 1 },
  { label: "Expense", value: 2 },
];

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ""}`} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />;
}

export default function AdminTransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number }>({ open: false, id: 0 });
  const { toast } = useToast();

  const { data, isLoading, isFetching } = useGetTransactionsQuery({
    search: search || undefined,
    type: typeFilter,
    page,
    pageSize: 20,
    sortDesc: true,
  });

  const { data: summary } = useGetTransactionSummaryQuery();
  const [deleteTransaction, { isLoading: deleting }] = useDeleteTransactionMutation();

  const transactions = data?.transactions ?? [];

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
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
          <h1 className="text-2xl font-bold tracking-tight">All Transactions</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>View and manage transactions across all client accounts.</p>
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
                          <PermissionGuard permission="delete_transaction">
                            <button type="button" onClick={() => setDeleteDialog({ open: true, id: t.id })}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: "#ef4444" }} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </PermissionGuard>
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
