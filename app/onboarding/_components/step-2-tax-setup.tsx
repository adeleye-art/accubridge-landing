"use client";

import React, { useState } from "react";
import type { Step2Data } from "@/types/onboarding";
import { FormField, FormInput, FormSelect, FormToggle, StepNav } from "./form-primitives";
import { useUpdateClientTaxSetupMutation } from "@/lib/api/clientApi";

const ACCOUNTING_BASIS_TO_INT: Record<string, number> = { cash: 0, accrual: 1 };

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const OPT = { backgroundColor: "#0f1e3a" };

interface Props {
  data: Partial<Step2Data>;
  operatingCountry: string;
  userId: number | null;
  onComplete: (data: Step2Data) => void;
  onBack: () => void;
}

export function Step2TaxSetup({ data, operatingCountry, userId, onComplete, onBack }: Props) {
  const [form, setForm] = useState<Step2Data>({
    tax_id:             data.tax_id             ?? "",
    vat_registered:     data.vat_registered     ?? false,
    vat_number:         data.vat_number         ?? "",
    payroll_required:   data.payroll_required   ?? false,
    employee_count:     data.employee_count     ?? "",
    financial_year_end: data.financial_year_end ?? "",
    accounting_basis:   data.accounting_basis   ?? "",
  });
  const [errors,   setErrors]   = useState<Partial<Record<keyof Step2Data, string>>>({});
  const [apiError, setApiError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [updateClientTaxSetup] = useUpdateClientTaxSetupMutation();

  const isUK      = operatingCountry === "uk"      || operatingCountry === "both";
  const isNigeria = operatingCountry === "nigeria"  || operatingCountry === "both";
  const taxLabel  = isUK && isNigeria ? "UTR (UK) / TIN (Nigeria)" : isUK ? "UTR — Unique Taxpayer Reference" : "TIN — Tax Identification Number";
  const taxHint   = isUK ? "10-digit number from HMRC (e.g. 1234567890)" : "Issued by Federal Inland Revenue Service";

  const set = (k: keyof Step2Data) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e: typeof errors = {};
    if (!form.tax_id.trim())          e.tax_id             = `${isUK ? "UTR" : "TIN"} is required`;
    if (!form.financial_year_end)     e.financial_year_end = "Please select your financial year end";
    if (!form.accounting_basis)       e.accounting_basis   = "Please select your accounting basis";
    if (form.vat_registered && !form.vat_number.trim()) e.vat_number = "VAT number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleContinue() {
    if (!validate()) return;
    if (!userId) { onComplete(form); return; }

    setIsSaving(true);
    setApiError("");
    try {
      await updateClientTaxSetup({
        id: userId,
        body: {
          corporationTaxUtr:  form.tax_id,
          financialYearEnd:   form.financial_year_end,
          accountingBasis:    ACCOUNTING_BASIS_TO_INT[form.accounting_basis] ?? 0,
        },
      });
      onComplete(form);
    } catch {
      setApiError("Failed to save your tax setup. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const sectionStyle = {
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  };
  const sectionLabel = { fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#3E92CC" };

  return (
    <div className="flex flex-col gap-5">
      {/* Tax ID */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>Tax Identification</div>
        <FormField label={taxLabel} required hint={taxHint} error={errors.tax_id}>
          <FormInput placeholder={isUK ? "1234567890" : "12345678-0001"} value={form.tax_id} onChange={set("tax_id")} />
        </FormField>
      </div>

      {/* VAT */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>VAT / Sales Tax</div>
        <FormToggle
          label="VAT Registered"
          hint={isUK ? "Are you registered for VAT with HMRC?" : "Are you registered for VAT with FIRS?"}
          checked={form.vat_registered}
          onChange={(v) => setForm((f) => ({ ...f, vat_registered: v }))}
        />
        {form.vat_registered && (
          <FormField label="VAT Number" required error={errors.vat_number}>
            <FormInput placeholder={isUK ? "GB123456789" : "VAT-0012345"} value={form.vat_number} onChange={set("vat_number")} />
          </FormField>
        )}
      </div>

      {/* Payroll */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>Payroll</div>
        <FormToggle
          label="Payroll Required"
          hint="Do you have employees or directors on payroll?"
          checked={form.payroll_required}
          onChange={(v) => setForm((f) => ({ ...f, payroll_required: v }))}
        />
        {form.payroll_required && (
          <FormField label="Number of Employees">
            <FormInput type="number" placeholder="e.g. 5" min="1" value={form.employee_count} onChange={set("employee_count")} />
          </FormField>
        )}
      </div>

      {/* Accounting preferences */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>Accounting Preferences</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Financial Year End" required error={errors.financial_year_end}>
            <FormSelect value={form.financial_year_end} onChange={set("financial_year_end")}>
              <option value="" style={OPT}>Select month…</option>
              {MONTHS.map((m) => <option key={m} value={m} style={OPT}>{m}</option>)}
            </FormSelect>
          </FormField>
          <FormField
            label="Accounting Basis"
            required
            error={errors.accounting_basis}
            hint="Cash: record when money moves. Accrual: record when earned/incurred."
          >
            <FormSelect value={form.accounting_basis} onChange={set("accounting_basis")}>
              <option value="" style={OPT}>Select basis…</option>
              <option value="cash"    style={OPT}>Cash Basis</option>
              <option value="accrual" style={OPT}>Accrual Basis</option>
            </FormSelect>
          </FormField>
        </div>
      </div>

      {apiError && <p className="text-sm text-red-400 text-center">{apiError}</p>}
      <StepNav onBack={onBack} isLoading={isSaving} onContinue={handleContinue} />
    </div>
  );
}
