"use client";

import React, { useRef, useState } from "react";
import { Upload, CheckCircle2, ShieldCheck, Check, X } from "lucide-react";
import type { Step5Data } from "@/types/onboarding";
import { FormField, FormSelect, StepNav } from "./form-primitives";
import { useUpdateClientMetadataMutation } from "@/lib/api/clientApi";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

const ID_TYPES = [
  { value: "passport",        label: "Passport"         },
  { value: "drivers_licence", label: "Driver's Licence" },
  { value: "national_id",     label: "National ID Card" },
];

const DOC_TYPES = [
  { value: "certificate_of_incorporation", label: "Certificate of Incorporation (UK)" },
  { value: "cac_certificate",              label: "CAC Certificate (Nigeria)"          },
  { value: "vat_certificate",              label: "VAT Registration Certificate"       },
  { value: "other",                        label: "Other Business Document"            },
];
const OPT = { backgroundColor: "#0f1e3a" };

interface Props {
  data: Partial<Step5Data>;
  userId: number | null;
  onComplete: (data: Step5Data) => void;
  onBack: () => void;
}

export function Step5Verification({ data, userId, onComplete, onBack }: Props) {
  const [form, setForm] = useState<Step5Data>({
    id_uploaded:            data.id_uploaded            ?? false,
    id_file_name:           data.id_file_name           ?? "",
    id_type:                data.id_type                ?? "",
    business_doc_uploaded:  data.business_doc_uploaded  ?? false,
    business_doc_file_name: data.business_doc_file_name ?? "",
    business_doc_type:      data.business_doc_type      ?? "",
    terms_accepted:         data.terms_accepted         ?? false,
  });
  const [errors,   setErrors]   = useState<{ id?: string; terms?: string }>({});
  const [apiError, setApiError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const idRef  = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const [updateClientMetadata] = useUpdateClientMetadataMutation();

  function validate() {
    const e: typeof errors = {};
    if (!form.id_uploaded)    e.id    = "Please upload a valid ID document";
    if (!form.terms_accepted) e.terms = "You must accept the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleComplete() {
    if (!validate()) return;
    if (!userId) { onComplete(form); return; }

    setIsSaving(true);
    setApiError("");
    try {
      await updateClientMetadata({
        id:   userId,
        body: { notes: "Terms accepted during onboarding", source: 0 },
      });
      onComplete(form);
    } catch {
      setApiError("Failed to submit verification. Please check your connection and try again.");
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
  const sectionLabel = { fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: BRAND.accent };

  return (
    <div className="flex flex-col gap-5">
      {/* ID Upload */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>Identity Verification</div>

        <FormField label="ID Document Type" required>
          <FormSelect
            value={form.id_type}
            onChange={(e) => setForm((f) => ({ ...f, id_type: e.target.value as Step5Data["id_type"] }))}
          >
            <option value="" style={OPT}>Select ID type…</option>
            {ID_TYPES.map((t) => <option key={t.value} value={t.value} style={OPT}>{t.label}</option>)}
          </FormSelect>
        </FormField>

        <div
          className="rounded-xl border border-dashed p-5 flex flex-col items-center gap-3 transition-all duration-200"
          style={{
            backgroundColor: form.id_uploaded ? `${BRAND.green}06` : "rgba(255,255,255,0.03)",
            borderColor: form.id_uploaded ? `${BRAND.green}40` : errors.id ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.12)",
            cursor: form.id_uploaded ? "default" : "pointer",
          }}
          onClick={() => !form.id_uploaded && idRef.current?.click()}
        >
          {form.id_uploaded ? (
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} style={{ color: BRAND.green }} />
              <span className="text-sm font-medium" style={{ color: BRAND.green }}>{form.id_file_name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, id_uploaded: false, id_file_name: "" })); }}
                style={{ color: BRAND.muted, lineHeight: 1 }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: BRAND.muted }}
              >
                <Upload size={20} />
              </div>
              <div className="text-center">
                <div className="text-sm text-white font-medium">Upload your ID</div>
                <div className="text-xs mt-1" style={{ color: BRAND.muted }}>JPG, PNG or PDF — max 5 MB</div>
              </div>
            </>
          )}
        </div>
        {errors.id && <span className="text-xs text-red-400">{errors.id}</span>}
        <input ref={idRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { setForm((p) => ({ ...p, id_uploaded: true, id_file_name: f.name })); e.target.value = ""; }
          }}
        />
      </div>

      {/* Business document */}
      <div style={sectionStyle}>
        <div className="flex items-center justify-between">
          <div style={sectionLabel}>Business Document</div>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: BRAND.muted }}>
            Optional
          </span>
        </div>

        <FormField label="Document Type">
          <FormSelect
            value={form.business_doc_type}
            onChange={(e) => setForm((f) => ({ ...f, business_doc_type: e.target.value as Step5Data["business_doc_type"] }))}
          >
            <option value="" style={OPT}>Select document type…</option>
            {DOC_TYPES.map((t) => <option key={t.value} value={t.value} style={OPT}>{t.label}</option>)}
          </FormSelect>
        </FormField>

        <button
          type="button"
          onClick={() => docRef.current?.click()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 w-full"
          style={{
            backgroundColor: form.business_doc_uploaded ? `${BRAND.green}08` : "rgba(255,255,255,0.04)",
            borderColor: form.business_doc_uploaded ? `${BRAND.green}30` : "rgba(255,255,255,0.1)",
          }}
        >
          {form.business_doc_uploaded ? (
            <><CheckCircle2 size={16} style={{ color: BRAND.green }} /><span className="text-sm ml-1" style={{ color: BRAND.green }}>{form.business_doc_file_name}</span></>
          ) : (
            <><Upload size={16} style={{ color: BRAND.muted }} /><span className="text-sm ml-1" style={{ color: BRAND.muted }}>Click to upload business document (PDF)</span></>
          )}
        </button>
        <input ref={docRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { setForm((p) => ({ ...p, business_doc_uploaded: true, business_doc_file_name: f.name })); e.target.value = ""; }
          }}
        />
      </div>

      {/* Compliance summary */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-3"
        style={{ backgroundColor: "rgba(6,214,160,0.05)", borderColor: "rgba(6,214,160,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} style={{ color: BRAND.green }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.green }}>
            Onboarding Summary
          </span>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
          Your information will be reviewed by our compliance team within 1 business day.
          Your Compliance Passport will be generated once verification is approved.
        </p>
      </div>

      {/* Terms */}
      <div>
        <label
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => setForm((f) => ({ ...f, terms_accepted: !f.terms_accepted }))}
        >
          <div
            className="w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: form.terms_accepted ? BRAND.gold : "rgba(255,255,255,0.06)",
              borderColor: form.terms_accepted ? BRAND.gold : errors.terms ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)",
            }}
          >
            {form.terms_accepted && <Check size={11} style={{ color: BRAND.primary }} />}
          </div>
          <span className="text-xs leading-relaxed select-none" style={{ color: "rgba(255,255,255,0.6)" }}>
            I confirm that all information provided is accurate and I agree to AccuBridge&apos;s{" "}
            <a href="/terms"      onClick={(e) => e.stopPropagation()} className="underline" style={{ color: BRAND.accent }}>Terms of Service</a>,{" "}
            <a href="/privacy"    onClick={(e) => e.stopPropagation()} className="underline" style={{ color: BRAND.accent }}>Privacy Policy</a>, and{" "}
            <a href="/compliance" onClick={(e) => e.stopPropagation()} className="underline" style={{ color: BRAND.accent }}>Compliance Agreement</a>.
          </span>
        </label>
        {errors.terms && <span className="text-xs text-red-400 mt-1 block">{errors.terms}</span>}
      </div>

      {apiError && <p className="text-sm text-red-400 text-center">{apiError}</p>}
      <StepNav
        onBack={onBack}
        isLoading={isSaving}
        onContinue={handleComplete}
        continueLabel="Complete Onboarding →"
      />
    </div>
  );
}
