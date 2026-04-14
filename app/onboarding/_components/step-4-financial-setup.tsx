"use client";

import React, { useRef, useState } from "react";
import { Upload, CheckCircle2, FileText, Receipt, Link2, X } from "lucide-react";
import type { Step4Data } from "@/types/onboarding";
import { FormField, FormSelect, StepNav } from "./form-primitives";
import { useUpdateClientFinancialMutation } from "@/lib/api/clientApi";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

const BANKS_UK = ["Barclays","HSBC","Lloyds","NatWest","Santander","Halifax","Monzo","Starling","Other"];
const BANKS_NG = ["GTBank","Zenith Bank","First Bank","Access Bank","UBA","Sterling Bank","Kuda","Opay","Other"];
const OPT = { backgroundColor: "#0f1e3a" };

function UploadCard({
  icon, title, subtitle, isUploaded, fileName, onUpload, onClear, accept,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isUploaded: boolean;
  fileName?: string;
  onUpload: (file: File) => void;
  onClear: () => void;
  accept: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className="rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-200"
      style={{
        backgroundColor: isUploaded ? `${BRAND.green}06` : "rgba(255,255,255,0.03)",
        borderColor: isUploaded ? `${BRAND.green}30` : "rgba(255,255,255,0.08)",
        cursor: isUploaded ? "default" : "pointer",
      }}
      onClick={() => !isUploaded && ref.current?.click()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: isUploaded ? `${BRAND.green}18` : "rgba(255,255,255,0.06)",
              color: isUploaded ? BRAND.green : BRAND.muted,
            }}
          >
            {icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{title}</div>
            <div className="text-xs" style={{ color: BRAND.muted }}>{subtitle}</div>
          </div>
        </div>
        {isUploaded ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <CheckCircle2 size={16} style={{ color: BRAND.green }} />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-xs underline"
              style={{ color: BRAND.muted }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-medium flex-shrink-0" style={{ color: BRAND.accent }}>
            <Upload size={13} /> Upload
          </div>
        )}
      </div>

      {isUploaded && fileName ? (
        <div className="text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(6,214,160,0.08)", color: BRAND.green }}>
          ✓ {fileName}
        </div>
      ) : (
        <div
          className="rounded-lg border border-dashed px-4 py-3 flex items-center justify-center text-xs"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}
        >
          Click to browse or drag & drop
        </div>
      )}
      <input ref={ref} type="file" accept={accept} className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { onUpload(f); e.target.value = ""; } }} />
    </div>
  );
}

interface Props {
  data: Partial<Step4Data>;
  operatingCountry: string;
  userId: number | null;
  onComplete: (data: Step4Data) => void;
  onBack: () => void;
}

export function Step4FinancialSetup({ data, operatingCountry, userId, onComplete, onBack }: Props) {
  const [form, setForm] = useState<Step4Data>({
    bank_connected:      data.bank_connected      ?? false,
    bank_name:           data.bank_name           ?? "",
    statement_uploaded:  data.statement_uploaded  ?? false,
    statement_file_name: data.statement_file_name ?? "",
    receipts_uploaded:   data.receipts_uploaded   ?? false,
    receipts_count:      data.receipts_count      ?? 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [updateClientFinancial] = useUpdateClientFinancialMutation();

  async function handleContinue() {
    if (!userId) { onComplete(form); return; }
    setIsSaving(true);
    setApiError("");
    try {
      await updateClientFinancial({
        id:   userId,
        body: { bankName: form.bank_name || undefined, employeeCount: 0, companySize: 0 },
      });
      onComplete(form);
    } catch {
      setApiError("Failed to save your financial setup. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const banks = operatingCountry === "nigeria" ? BANKS_NG
    : operatingCountry === "both" ? [...new Set([...BANKS_UK, ...BANKS_NG])]
    : BANKS_UK;

  const sectionStyle = {
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  };
  const sectionLabel = { fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: BRAND.accent };

  return (
    <div className="flex flex-col gap-5">
      {/* Bank connection */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>Bank Connection</div>

        <FormField label="Your Primary Business Bank" hint="Select where you hold your main business account">
          <FormSelect
            value={form.bank_name}
            onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
          >
            <option value="" style={OPT}>Select bank…</option>
            {banks.map((b) => <option key={b} value={b} style={OPT}>{b}</option>)}
          </FormSelect>
        </FormField>

        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, bank_connected: !f.bank_connected }))}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 w-full"
          style={{
            backgroundColor: form.bank_connected ? `${BRAND.green}10` : "rgba(255,255,255,0.04)",
            borderColor: form.bank_connected ? `${BRAND.green}40` : "rgba(255,255,255,0.1)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: form.bank_connected ? `${BRAND.green}20` : "rgba(255,255,255,0.06)",
              color: form.bank_connected ? BRAND.green : BRAND.muted,
            }}
          >
            {form.bank_connected ? <CheckCircle2 size={18} /> : <Link2 size={18} />}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              {form.bank_connected ? "Bank Connected ✓" : "Connect Bank Account"}
            </div>
            <div className="text-xs" style={{ color: BRAND.muted }}>
              {form.bank_connected
                ? "Click to disconnect"
                : "Securely link for automatic reconciliation (optional)"}
            </div>
          </div>
        </button>
      </div>

      {/* Document uploads */}
      <div style={sectionStyle}>
        <div className="flex items-center justify-between">
          <div style={sectionLabel}>Upload Documents</div>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: BRAND.muted }}
          >
            Optional — can be done later
          </span>
        </div>

        <UploadCard
          icon={<FileText size={16} />}
          title="Bank Statement"
          subtitle="CSV, PDF or Excel — last 3 months recommended"
          isUploaded={form.statement_uploaded}
          fileName={form.statement_file_name}
          onUpload={(f) => setForm((p) => ({ ...p, statement_uploaded: true, statement_file_name: f.name }))}
          onClear={() => setForm((p) => ({ ...p, statement_uploaded: false, statement_file_name: "" }))}
          accept=".csv,.pdf,.xlsx,.xls"
        />
        <UploadCard
          icon={<Receipt size={16} />}
          title="Receipts & Expenses"
          subtitle="Upload images or PDFs of your business receipts"
          isUploaded={form.receipts_uploaded}
          fileName={form.receipts_count > 0 ? `${form.receipts_count} file(s) uploaded` : undefined}
          onUpload={() => setForm((p) => ({ ...p, receipts_uploaded: true, receipts_count: p.receipts_count + 1 }))}
          onClear={() => setForm((p) => ({ ...p, receipts_uploaded: false, receipts_count: 0 }))}
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>

      {apiError && <p className="text-sm text-red-400 text-center">{apiError}</p>}
      <StepNav onBack={onBack} isLoading={isSaving} onContinue={handleContinue} />
    </div>
  );
}
