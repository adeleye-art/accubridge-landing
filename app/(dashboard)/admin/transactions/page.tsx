"use client";

import React, { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { type SupportedCurrency, formatAmountRaw } from "@/lib/currency";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type TxType = "Income" | "Expense";
interface Transaction {
  id: string; date: string; client: string; type: TxType; category: string; amount: number; currency: SupportedCurrency;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t1", date: "3 Apr 2026",  client: "Apex Solutions Ltd",   type: "Expense", category: "Salaries & Wages",     amount: 8700,  currency: "GBP" },
  { id: "t2", date: "2 Apr 2026",  client: "Nova Consulting UK",   type: "Income",  category: "Consulting Fees",       amount: 12500, currency: "GBP" },
  { id: "t3", date: "1 Apr 2026",  client: "Bright Path Ltd",      type: "Expense", category: "Office Rent",           amount: 2200,  currency: "GBP" },
  { id: "t4", date: "1 Apr 2026",  client: "TechBridge NG Ltd",    type: "Income",  category: "Product Sales",         amount: 5400,  currency: "NGN" },
  { id: "t5", date: "31 Mar 2026", client: "Apex Solutions Ltd",   type: "Expense", category: "Software Subscriptions",amount: 890,   currency: "GBP" },
  { id: "t6", date: "30 Mar 2026", client: "Lagos First Capital",  type: "Expense", category: "Marketing",             amount: 3100,  currency: "NGN" },
];

const ALL_CLIENTS = ["All Clients", "Apex Solutions Ltd", "Nova Consulting UK", "Bright Path Ltd", "TechBridge NG Ltd", "Lagos First Capital"];

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const { toast } = useToast();

  const filtered = useMemo(() =>
    transactions.filter((t) => clientFilter === "All Clients" || t.client === clientFilter),
    [transactions, clientFilter]);

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Transaction deleted", variant: "success" });
    setDeleteDialog({ open: false, id: "" });
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

        {/* Client filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Client:</label>
          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm text-white outline-none"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }}>
            {ALL_CLIENTS.map((c) => <option key={c} value={c} style={{ background: "#0A2463" }}>{c}</option>)}
          </select>
          <span className="text-xs" style={{ color: BRAND.muted }}>{filtered.length} transactions</span>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Date", "Client", "Type", "Category", "Amount", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{t.date}</td>
                    <td className="px-5 py-3.5 font-medium">{t.client}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                        color: t.type === "Expense" ? "#ef4444" : "#06D6A0",
                        backgroundColor: t.type === "Expense" ? "rgba(239,68,68,0.1)" : "rgba(6,214,160,0.1)",
                      }}>{t.type}</span>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.7)" }}>{t.category}</td>
                    <td className="px-5 py-3.5 font-bold" style={{ color: t.type === "Expense" ? "#ef4444" : "#06D6A0" }}>{formatAmountRaw(t.amount, t.currency)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: BRAND.muted }} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <PermissionGuard permission="delete_transaction">
                          <button type="button" onClick={() => setDeleteDialog({ open: true, id: t.id })}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: "#ef4444" }} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Transaction"
        description="Are you sure you want to permanently delete this transaction?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => handleDelete(deleteDialog.id)}
        onCancel={() => setDeleteDialog({ open: false, id: "" })}
      />
    </div>
  );
}
