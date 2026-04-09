"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Upload, FileText, AlertCircle, Loader2, CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { useCreateReconciliationMutation } from "@/lib/api/reconciliationApi";
import { useToast } from "@/components/shared/toast";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };
const ACCEPTED_TYPES = [".csv", ".pdf", ".xlsx", ".xls"];

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

export default function NewReconciliationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createReconciliation, { isLoading }] = useCreateReconciliationMutation();

  const [period, setPeriod] = useState("");
  const [bankName, setBankName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateFile(f: File): string | null {
    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
    if (!ACCEPTED_TYPES.includes(ext)) return "Unsupported type. Upload CSV, PDF, or Excel.";
    if (f.size > 10 * 1024 * 1024) return "File too large. Max 10 MB.";
    return null;
  }

  function handleFileSelect(f: File) {
    const err = validateFile(f);
    if (err) { setFileError(err); setFile(null); return; }
    setFileError(null);
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!period.trim() || !bankName.trim() || !file) return;

    const formData = new FormData();
    formData.append("Period", period.trim());
    formData.append("BankName", bankName.trim());
    formData.append("File", file);

    const result = await createReconciliation(formData);
    if ("data" in result && result.data) {
      toast({ variant: "success", title: "Statement uploaded", description: `${result.data.totalLines} lines ready for matching` });
      router.push(`/client/transactions/reconciliation/${result.data.id}`);
    } else {
      toast({ variant: "error", title: "Upload failed", description: "Please check the file and try again." });
    }
  }

  const canSubmit = period.trim() && bankName.trim() && file && !isLoading;

  const zoneColor = isDragging ? BRAND.accent : file ? BRAND.green : fileError ? "#ef4444" : "rgba(255,255,255,0.12)";

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-2xl mx-auto">

        {/* Back nav */}
        <button
          type="button"
          onClick={() => router.push("/client/transactions/reconciliation")}
          className="flex items-center gap-2 mb-5 text-sm transition-opacity hover:opacity-70"
          style={{ color: BRAND.muted }}
        >
          <ArrowLeft size={15} />
          Back to Reconciliation History
        </button>

        <PageHeader
          badge="Reconciliation"
          title="New Reconciliation"
          description="Upload a bank statement to start matching transactions."
        />

        <form onSubmit={handleSubmit}>
          <div
            className="rounded-2xl border p-6 flex flex-col gap-5"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            {/* Period */}
            <Field label="STATEMENT PERIOD *">
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. March 2026"
                style={inputStyle}
                required
              />
            </Field>

            {/* Bank Name */}
            <Field label="BANK NAME *">
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Barclays Business"
                style={inputStyle}
                required
              />
            </Field>

            {/* File upload */}
            <Field label="BANK STATEMENT FILE *">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    backgroundColor: isDragging ? `${BRAND.accent}10` : file ? `${BRAND.green}08` : "rgba(255,255,255,0.03)",
                    borderColor: zoneColor,
                    color: file ? BRAND.green : fileError ? "#ef4444" : isDragging ? BRAND.accent : BRAND.muted,
                  }}
                >
                  {file ? (
                    <>
                      <CheckCircle2 size={20} />
                      <span className="text-sm font-medium">{file.name}</span>
                    </>
                  ) : fileError ? (
                    <>
                      <AlertCircle size={20} />
                      <span className="text-sm">{fileError}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      <span className="text-sm">{isDragging ? "Drop file here…" : "Click to upload or drag & drop"}</span>
                      <span className="text-xs" style={{ color: BRAND.muted }}>CSV, PDF, Excel — max 10 MB</span>
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.pdf,.xlsx,.xls"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                />
              </div>

              {file && (
                <button
                  type="button"
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="flex items-center gap-1.5 mt-2 text-xs transition-opacity hover:opacity-70"
                  style={{ color: BRAND.muted }}
                >
                  <X size={12} />
                  Remove file
                </button>
              )}
            </Field>

            {/* Tip row */}
            <div className="flex flex-wrap gap-2">
              {["CSV: date, description, amount columns required", "PDF: text-based statements only", "Excel: first sheet parsed"].map((tip) => (
                <span
                  key={tip}
                  className="text-[11px] px-2 py-0.5 rounded-full border"
                  style={{ color: BRAND.muted, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.02)" }}
                >
                  {tip}
                </span>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: canSubmit ? BRAND.gold : "rgba(255,255,255,0.06)",
                color: canSubmit ? BRAND.primary : "rgba(255,255,255,0.3)",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading & Parsing…
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Upload & Start Reconciliation
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
