"use client";

import React, { useState, useMemo } from "react";
import { Pencil, Plus } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { useToast } from "@/components/shared/toast";
import { type SupportedCurrency, formatAmountRaw } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-context";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type TxType = "Income" | "Expense";
interface Transaction { id: string; date: string; client: string; type: TxType; category: string; amount: number; currency: SupportedCurrency; }

const ASSIGNED_CLIENTS = ["All Clients", "Apex Solutions Ltd", "Nova Consulting UK", "Bright Path Ltd", "TechBridge NG Ltd", "Lagos First Capital"];
const CLIENT_LIST      = ASSIGNED_CLIENTS.slice(1);

const INIT_TRANSACTIONS: Transaction[] = [
  { id: "t1", date: "3 Apr 2026",  client: "Apex Solutions Ltd", type: "Expense", category: "Salaries & Wages",     amount: 8700,  currency: "GBP" },
  { id: "t2", date: "2 Apr 2026",  client: "Nova Consulting UK", type: "Income",  category: "Consulting Fees",      amount: 12500, currency: "GBP" },
  { id: "t3", date: "1 Apr 2026",  client: "Bright Path Ltd",    type: "Expense", category: "Office Rent",           amount: 2200,  currency: "GBP" },
  { id: "t4", date: "1 Apr 2026",  client: "TechBridge NG Ltd",  type: "Income",  category: "Product Sales",         amount: 5400,  currency: "NGN" },
  { id: "t5", date: "31 Mar 2026", client: "Apex Solutions Ltd", type: "Expense", category: "Software Subscriptions",amount: 890,   currency: "GBP" },
];

const CATEGORIES = ["Salaries & Wages", "Office Rent", "Consulting Fees", "Product Sales", "Software Subscriptions", "Marketing", "Other"];

function AddTransactionSheet({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (tx: Omit<Transaction, "id">) => void }) {
  const { currency, symbol } = useCurrency();
  const [form, setForm] = useState({ date: "", client: CLIENT_LIST[0], type: "Expense" as TxType, category: CATEGORIES[0], amount: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!form.date || !form.amount) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAdd({ date: form.date, client: form.client, type: form.type, category: form.category, amount: parseFloat(form.amount) || 0, currency });
      toast({ title: "Transaction added", variant: "success" });
      setForm({ date: "", client: CLIENT_LIST[0], type: "Expense", category: CATEGORIES[0], amount: "" });
      onClose();
    }, 800);
  };

  const inputStyle = { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)", color: "white" };
  const labelStyle = { color: "rgba(255,255,255,0.7)" };

  return (
    <SystemSheet open={open} title="Add Transaction" onClose={onClose}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Adding..." : "Add Transaction"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Client</label>
          <select value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
            {CLIENT_LIST.map((c) => <option key={c} value={c} style={{ background: "#0A2463" }}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Type</label>
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TxType }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
            <option value="Income"  style={{ background: "#0A2463" }}>Income</option>
            <option value="Expense" style={{ background: "#0A2463" }}>Expense</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>Category</label>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle}>
            {CATEGORIES.map((c) => <option key={c} value={c} style={{ background: "#0A2463" }}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={labelStyle}>{`Amount (e.g. ${symbol}1,200)`}</label>
          <input type="text" placeholder={`${symbol}0.00`} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none placeholder-[#6B7280]" style={inputStyle} />
        </div>
      </div>
    </SystemSheet>
  );
}

export default function StaffTransactionsPage() {
  const [transactions, setTransactions] = useState(INIT_TRANSACTIONS);
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() =>
    transactions.filter((t) => clientFilter === "All Clients" || t.client === clientFilter),
    [transactions, clientFilter]);

  const handleAdd = (tx: Omit<Transaction, "id">) => {
    setTransactions((prev) => [{ ...tx, id: `t${Date.now()}` }, ...prev]);
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
            <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
            <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Review and manage transactions for your assigned clients.</p>
          </div>
          <PermissionGuard permission="add_transaction">
            <button type="button" onClick={() => setSheetOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
              <Plus size={16} /> Add Transaction
            </button>
          </PermissionGuard>
        </div>

        {/* Client filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Client:</label>
          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="border rounded-xl px-3 py-2 text-sm text-white outline-none" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }}>
            {ASSIGNED_CLIENTS.map((c) => <option key={c} value={c} style={{ background: "#0A2463" }}>{c}</option>)}
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
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: t.type === "Expense" ? "#ef4444" : "#06D6A0", backgroundColor: t.type === "Expense" ? "rgba(239,68,68,0.1)" : "rgba(6,214,160,0.1)" }}>{t.type}</span>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.7)" }}>{t.category}</td>
                    <td className="px-5 py-3.5 font-bold" style={{ color: t.type === "Expense" ? "#ef4444" : "#06D6A0" }}>{formatAmountRaw(t.amount, t.currency)}</td>
                    <td className="px-5 py-3.5">
                      <PermissionGuard permission="edit_transaction">
                        <button type="button" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: BRAND.muted }}>
                          <Pencil size={14} />
                        </button>
                      </PermissionGuard>
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

      <AddTransactionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
