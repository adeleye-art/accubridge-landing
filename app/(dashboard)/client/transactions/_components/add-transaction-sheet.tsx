"use client";

import React, { useState, useEffect } from "react";
import { SystemSheet } from "@/components/shared/system-sheet";

export type TxType = "Income" | "Expense";

export interface TransactionFormData {
  date: string;
  type: TxType;
  category: string;
  description: string;
  amount: string;
  reference: string;
}

const INCOME_CATEGORIES = [
  "Sales Revenue",
  "Service Fees",
  "Consulting",
  "Investment Returns",
  "Grants & Funding",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Salaries & Wages",
  "Office Rent",
  "Utilities",
  "Software & Tools",
  "Marketing & Ads",
  "Travel & Transport",
  "Professional Services",
  "Equipment",
  "Insurance",
  "Other Expense",
];

const EMPTY: TransactionFormData = {
  date: new Date().toISOString().slice(0, 10),
  type: "Expense",
  category: "",
  description: "",
  amount: "",
  reference: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: TransactionFormData) => void;
  initial?: Partial<TransactionFormData> | null;
  mode?: "add" | "edit";
}

// ─── Reusable field wrapper ───────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "white",
  fontSize: "14px",
  padding: "10px 14px",
  outline: "none",
  width: "100%",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AddTransactionSheet({ open, onClose, onSave, initial, mode = "add" }: Props) {
  const [form, setForm] = useState<TransactionFormData>(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial } : EMPTY);
    }
  }, [open, initial]);

  const categories = form.type === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function set<K extends keyof TransactionFormData>(key: K, value: TransactionFormData[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      // reset category when type changes
      ...(key === "type" ? { category: "" } : {}),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  const isValid = form.date && form.category && form.amount && parseFloat(form.amount) > 0;

  return (
    <SystemSheet
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit Transaction" : "Add Transaction"}
      description={mode === "edit" ? "Update the transaction details below." : "Record a new income or expense."}
      footer={
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="tx-form"
            disabled={!isValid}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 700,
              backgroundColor: isValid ? "#D4AF37" : "rgba(212,175,55,0.3)",
              color: isValid ? "#0A2463" : "rgba(255,255,255,0.4)",
              border: "none",
              cursor: isValid ? "pointer" : "not-allowed",
              transition: "opacity 0.15s",
            }}
          >
            {mode === "edit" ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      }
    >
      <form id="tx-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Type toggle */}
        <Field label="TYPE">
          <div className="flex gap-2">
            {(["Income", "Expense"] as TxType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("type", t)}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border: "1px solid",
                  borderColor:
                    form.type === t
                      ? t === "Income"
                        ? "rgba(6,214,160,0.5)"
                        : "rgba(239,68,68,0.5)"
                      : "rgba(255,255,255,0.1)",
                  backgroundColor:
                    form.type === t
                      ? t === "Income"
                        ? "rgba(6,214,160,0.12)"
                        : "rgba(239,68,68,0.12)"
                      : "rgba(255,255,255,0.04)",
                  color:
                    form.type === t
                      ? t === "Income"
                        ? "#06D6A0"
                        : "#ef4444"
                      : "rgba(255,255,255,0.5)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        {/* Date */}
        <Field label="DATE">
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            required
            style={{ ...inputStyle, colorScheme: "dark" }}
          />
        </Field>

        {/* Category */}
        <Field label="CATEGORY">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            required
            style={{ ...inputStyle, appearance: "none" }}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        {/* Amount */}
        <Field label="AMOUNT (£)">
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>£</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              required
              style={{ ...inputStyle, paddingLeft: "28px" }}
            />
          </div>
        </Field>

        {/* Description */}
        <Field label="DESCRIPTION (OPTIONAL)">
          <input
            type="text"
            placeholder="Brief description…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={120}
            style={inputStyle}
          />
        </Field>

        {/* Reference */}
        <Field label="REFERENCE / INVOICE NO. (OPTIONAL)">
          <input
            type="text"
            placeholder="e.g. INV-0042"
            value={form.reference}
            onChange={(e) => set("reference", e.target.value)}
            maxLength={60}
            style={inputStyle}
          />
        </Field>
      </form>
    </SystemSheet>
  );
}
