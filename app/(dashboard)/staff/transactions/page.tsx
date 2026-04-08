"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Pencil, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { SystemSheet } from "@/components/shared/system-sheet";
import { useToast } from "@/components/shared/toast";
import { type SupportedCurrency, formatAmountRaw } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-context";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type TxType = "Income" | "Expense";
type ApprovalStatus = "pending_approval" | "approved" | "rejected";

interface Transaction {
  id: string; date: string; client: string; type: TxType; category: string;
  amount: number; currency: SupportedCurrency; approval: ApprovalStatus;
}

const ASSIGNED_CLIENTS = ["All Clients", "Apex Solutions Ltd", "Nova Consulting UK", "Bright Path Ltd", "TechBridge NG Ltd", "Lagos First Capital"];
const CLIENT_LIST      = ASSIGNED_CLIENTS.slice(1);
const CATEGORIES       = ["Salaries & Wages", "Office Rent", "Consulting Fees", "Product Sales", "Software Subscriptions", "Marketing", "Other"];

const INIT_TRANSACTIONS: Transaction[] = [
  { id: "t1", date: "3 Apr 2026",  client: "Apex Solutions Ltd", type: "Expense", category: "Salaries & Wages",      amount: 8700,  currency: "GBP", approval: "approved" },
  { id: "t2", date: "2 Apr 2026",  client: "Nova Consulting UK", type: "Income",  category: "Consulting Fees",       amount: 12500, currency: "GBP", approval: "approved" },
  { id: "t3", date: "1 Apr 2026",  client: "Bright Path Ltd",    type: "Expense", category: "Office Rent",           amount: 2200,  currency: "GBP", approval: "approved" },
  { id: "t4", date: "1 Apr 2026",  client: "TechBridge NG Ltd",  type: "Income",  category: "Product Sales",         amount: 5400,  currency: "NGN", approval: "approved" },
  { id: "t5", date: "31 Mar 2026", client: "Apex Solutions Ltd", type: "Expense", category: "Software Subscriptions",amount: 890,   currency: "GBP", approval: "approved" },
];

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const map: Record<ApprovalStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    approved:         { color: "#06D6A0", bg: "rgba(6,214,160,0.1)",  icon: <CheckCircle2 size={11} />, label: "Approved"         },
    pending_approval: { color: "#D4AF37", bg: "rgba(212,175,55,0.1)", icon: <Clock size={11} />,        label: "Pending Approval" },
    rejected:         { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  icon: <XCircle size={11} />,      label: "Rejected"         },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap" style={{ color: s.color, backgroundColor: s.bg }}>
      {s.icon} {s.label}
    </span>
  );
}

const inputStyle = { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)", color: "white" };
const labelStyle = { color: "rgba(255,255,255,0.7)" };

function ApprovalNotice() {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ backgroundColor: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", color: "rgba(255,255,255,0.6)" }}>
      <Clock size={13} style={{ color: BRAND.gold, flexShrink: 0, marginTop: 1 }} />
      <span>This transaction requires admin approval before it is reflected in the system.</span>
    </div>
  );
}

function TransactionForm({
  form,
  setForm,
  symbol,
}: {
  form: { date: string; client: string; type: TxType; category: string; amount: string };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  symbol: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ApprovalNotice />

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
  );
}

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
      onAdd({ date: form.date, client: form.client, type: form.type, category: form.category, amount: parseFloat(form.amount) || 0, currency, approval: "pending_approval" });
      toast({ title: "Transaction submitted for admin approval", variant: "success" });
      setForm({ date: "", client: CLIENT_LIST[0], type: "Expense", category: CATEGORIES[0], amount: "" });
      onClose();
    }, 800);
  };

  return (
    <SystemSheet
      open={open}
      title="Add Transaction"
      description="Submitted transactions require admin approval."
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Clock size={12} style={{ color: BRAND.gold }} />
            Admin must approve before this appears in the system.
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={loading} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </div>
      }
    >
      <TransactionForm form={form} setForm={setForm} symbol={symbol} />
    </SystemSheet>
  );
}

function EditTransactionSheet({ tx, onClose, onSave }: { tx: Transaction | null; onClose: () => void; onSave: (updated: Transaction) => void }) {
  const { symbol } = useCurrency();
  const [form, setForm] = useState({ date: "", client: CLIENT_LIST[0], type: "Expense" as TxType, category: CATEGORIES[0], amount: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (tx) setForm({ date: tx.date, client: tx.client, type: tx.type, category: tx.category, amount: String(tx.amount) });
  }, [tx]);

  const handleSave = () => {
    if (!tx || !form.amount) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSave({ ...tx, date: form.date, client: form.client, type: form.type, category: form.category, amount: parseFloat(form.amount) || 0, approval: "pending_approval" });
      toast({ title: "Edit submitted for admin approval", variant: "success" });
      onClose();
    }, 800);
  };

  return (
    <SystemSheet
      open={!!tx}
      title="Edit Transaction"
      description="Changes require admin approval before taking effect."
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Clock size={12} style={{ color: BRAND.gold }} />
            Admin must approve this edit before it is reflected.
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>Cancel</button>
            <button type="button" onClick={handleSave} disabled={loading} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </div>
      }
    >
      <TransactionForm form={form} setForm={setForm} symbol={symbol} />
    </SystemSheet>
  );
}

export default function StaffTransactionsPage() {
  const [transactions, setTransactions] = useState(INIT_TRANSACTIONS);
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const filtered = useMemo(() =>
    transactions.filter((t) => clientFilter === "All Clients" || t.client === clientFilter),
    [transactions, clientFilter]);

  const handleAdd = (tx: Omit<Transaction, "id">) => {
    setTransactions((prev) => [{ ...tx, id: `t${Date.now()}` }, ...prev]);
  };

  const handleSave = (updated: Transaction) => {
    setTransactions((prev) => prev.map((t) => t.id === updated.id ? updated : t));
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
            <button type="button" onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
              <Plus size={16} /> Add Transaction
            </button>
          </PermissionGuard>
        </div>

        {/* Approval info banner */}
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border text-xs" style={{ backgroundColor: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.2)", color: "rgba(255,255,255,0.5)" }}>
          <Clock size={13} style={{ color: BRAND.gold, flexShrink: 0, marginTop: 1 }} />
          <span>Transactions you add or edit are submitted for admin review and will show as <strong style={{ color: BRAND.gold }}>Pending Approval</strong> until actioned by an admin.</span>
        </div>

        {/* Client filter */}
        <div className="flex items-center gap-3 flex-wrap">
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
                  {["Date", "Client", "Type", "Category", "Amount", "Approval", ""].map((h) => (
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
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: t.type === "Expense" ? "#ef4444" : "#06D6A0", backgroundColor: t.type === "Expense" ? "rgba(239,68,68,0.1)" : "rgba(6,214,160,0.1)" }}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.7)" }}>{t.category}</td>
                    <td className="px-5 py-3.5 font-bold" style={{ color: t.type === "Expense" ? "#ef4444" : "#06D6A0" }}>{formatAmountRaw(t.amount, t.currency)}</td>
                    <td className="px-5 py-3.5"><ApprovalBadge status={t.approval} /></td>
                    <td className="px-5 py-3.5">
                      <PermissionGuard permission="edit_transaction">
                        <button
                          type="button"
                          onClick={() => setEditTx(t)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          style={{ color: BRAND.muted }}
                          title="Edit transaction"
                        >
                          <Pencil size={14} />
                        </button>
                      </PermissionGuard>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <AddTransactionSheet open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      <EditTransactionSheet tx={editTx} onClose={() => setEditTx(null)} onSave={handleSave} />
    </div>
  );
}
