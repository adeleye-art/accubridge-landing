"use client";

import React, { useState, useRef } from "react";
import { SystemSheet } from "@/components/shared/system-sheet";
import { KYCData } from "@/types/compliance";
import { Loader2, ShieldCheck, AlertCircle, Check, Upload, Plus, Trash2, CheckCircle2 } from "lucide-react";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

const inputBase = "w-full h-11 px-4 rounded-xl text-sm text-white border outline-none transition-all duration-200 placeholder-[#6B7280]";
const inputStyle = { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" };

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = "rgba(62,146,204,0.6)";
  e.target.style.boxShadow = "0 0 0 3px rgba(62,146,204,0.12)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = "rgba(255,255,255,0.1)";
  e.target.style.boxShadow = "none";
}

function FField({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>
        {label}{required && <span style={{ color: BRAND.gold }}> *</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

interface IDDocument {
  id_type: KYCData["id_type"] | "";
  id_number: string;
  id_expiry: string;
  file_name?: string;
}

function IDDocumentEntry({
  index,
  doc,
  onChange,
  onRemove,
  canRemove,
  error,
}: {
  index: number;
  doc: IDDocument;
  onChange: (d: IDDocument) => void;
  onRemove: () => void;
  canRemove: boolean;
  error?: Partial<Record<keyof IDDocument, string>>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-4"
      style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.accent }}>
          {index === 0 ? "Primary ID" : `Additional ID ${index}`}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
            style={{ color: "#ef4444" }}
          >
            <Trash2 size={12} /> Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FField label="ID Type" required={index === 0} error={error?.id_type}>
          <select
            value={doc.id_type}
            onChange={(e) => onChange({ ...doc, id_type: e.target.value as IDDocument["id_type"] })}
            className={`${inputBase} appearance-none cursor-pointer`}
            style={{ ...inputStyle, colorScheme: "dark" as const }}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <option value="" style={{ backgroundColor: "#0f1e3a" }}>Select ID type…</option>
            <option value="passport" style={{ backgroundColor: "#0f1e3a" }}>Passport</option>
            <option value="drivers_licence" style={{ backgroundColor: "#0f1e3a" }}>Driver's Licence</option>
            <option value="national_id" style={{ backgroundColor: "#0f1e3a" }}>National ID Card</option>
            <option value="residence_permit" style={{ backgroundColor: "#0f1e3a" }}>Residence Permit</option>
            <option value="biometric_card" style={{ backgroundColor: "#0f1e3a" }}>Biometric Residence Permit</option>
          </select>
        </FField>

        <FField label="ID Number" required={index === 0} error={error?.id_number}>
          <input
            type="text"
            placeholder="GB12345678"
            value={doc.id_number}
            onChange={(e) => onChange({ ...doc, id_number: e.target.value })}
            className={inputBase}
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </FField>

        <FField label="Expiry Date" required={index === 0} error={error?.id_expiry}>
          <input
            type="date"
            value={doc.id_expiry}
            onChange={(e) => onChange({ ...doc, id_expiry: e.target.value })}
            className={inputBase}
            style={{ ...inputStyle, colorScheme: "dark" as const }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </FField>

        {/* File upload */}
        <FField label="Upload Document">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-11 flex items-center gap-2 px-4 rounded-xl border transition-all duration-200 text-sm"
            style={{
              backgroundColor: doc.file_name ? `${BRAND.green}08` : "rgba(255,255,255,0.04)",
              borderColor: doc.file_name ? `${BRAND.green}30` : "rgba(255,255,255,0.1)",
              color: doc.file_name ? BRAND.green : "rgba(255,255,255,0.55)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = doc.file_name ? `${BRAND.green}14` : `${BRAND.accent}08`; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = doc.file_name ? `${BRAND.green}08` : "rgba(255,255,255,0.04)"; }}
          >
            {doc.file_name
              ? <><CheckCircle2 size={14} /><span className="truncate">{doc.file_name}</span></>
              : <><Upload size={14} /><span>Upload file (JPG, PNG, PDF)</span></>}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onChange({ ...doc, file_name: f.name });
            }}
          />
        </FField>
      </div>
    </div>
  );
}

interface KYCSheetProps {
  isOpen: boolean;
  onClose: () => void;
  existingData?: Partial<KYCData>;
  onSubmit: (data: KYCData) => Promise<void>;
}

export function KYCSheet({ isOpen, onClose, existingData, onSubmit }: KYCSheetProps) {
  const [step, setStep] = useState<"form" | "processing" | "success" | "failed">("form");
  const [form, setForm] = useState<Partial<KYCData>>(existingData || { country: "uk" });
  const [ids, setIds] = useState<IDDocument[]>([{ id_type: "", id_number: "", id_expiry: "" }]);
  const [errors, setErrors] = useState<Partial<Record<keyof KYCData, string>>>({});
  const [idErrors, setIdErrors] = useState<Partial<Record<keyof IDDocument, string>>[]>([{}]);

  const set = (k: keyof KYCData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const addId = () => {
    if (ids.length >= 3) return;
    setIds((prev) => [...prev, { id_type: "", id_number: "", id_expiry: "" }]);
    setIdErrors((prev) => [...prev, {}]);
  };

  const updateId = (i: number, doc: IDDocument) => {
    setIds((prev) => prev.map((d, idx) => idx === i ? doc : d));
  };

  const removeId = (i: number) => {
    setIds((prev) => prev.filter((_, idx) => idx !== i));
    setIdErrors((prev) => prev.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    let valid = true;
    const e: Partial<Record<keyof KYCData, string>> = {};
    if (!form.full_name?.trim()) { e.full_name = "Required"; valid = false; }
    if (!form.dob)               { e.dob = "Required"; valid = false; }
    if (!form.nationality?.trim()) { e.nationality = "Required"; valid = false; }
    setErrors(e);

    const newIdErrors = ids.map((doc, i) => {
      if (i > 0 && !doc.id_type && !doc.id_number && !doc.id_expiry) return {};
      const ie: Partial<Record<keyof IDDocument, string>> = {};
      if (!doc.id_type)   { ie.id_type = "Required"; valid = false; }
      if (!doc.id_number) { ie.id_number = "Required"; valid = false; }
      if (!doc.id_expiry) { ie.id_expiry = "Required"; valid = false; }
      return ie;
    });
    setIdErrors(newIdErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStep("processing");
    try {
      const primaryId = ids[0];
      await onSubmit({
        ...form,
        id_type: primaryId.id_type as KYCData["id_type"],
        id_number: primaryId.id_number,
        id_expiry: primaryId.id_expiry,
      } as KYCData);
      setStep("success");
    } catch {
      setStep("failed");
    }
  };

  const footer =
    step === "form" ? (
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#c49b30"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BRAND.gold; }}
      >
        <ShieldCheck size={15} />Submit for Verification
      </button>
    ) : step === "processing" ? (
      <div className="flex items-center justify-center gap-2 h-11" style={{ color: BRAND.accent }}>
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Running checks…</span>
      </div>
    ) : step === "success" ? (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setForm({ country: "uk" });
            setIds([{ id_type: "", id_number: "", id_expiry: "" }]);
            setErrors({});
            setIdErrors([{}]);
            setStep("form");
          }}
          className="flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
          style={{ backgroundColor: `${BRAND.accent}12`, color: BRAND.accent, border: `1px solid ${BRAND.accent}30` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}25`; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}12`; }}
        >
          <Plus size={15} /> Add Another Person
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
          style={{ backgroundColor: `${BRAND.green}15`, color: BRAND.green, border: `1px solid ${BRAND.green}30` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.green}25`; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.green}15`; }}
        >
          <Check size={15} /> Close
        </button>
      </div>
    ) : (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStep("form")}
          className="flex-1 h-11 rounded-xl text-sm font-medium border transition-all duration-200"
          style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 h-11 rounded-xl text-sm font-medium border"
          style={{ borderColor: "rgba(255,255,255,0.12)", color: BRAND.muted }}
        >
          Close
        </button>
      </div>
    );

  return (
    <SystemSheet
      open={isOpen}
      onClose={onClose}
      title="Identity Verification (KYC)"
      description="Verify your identity to unlock compliance scoring and funding access"
      footer={footer}
      width={540}
    >
      {step === "form" && (
        <button
          type="button"
          onClick={onClose}
          className="mb-4 text-sm font-semibold flex items-center gap-1.5 transition-colors"
          style={{ color: BRAND.accent }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          ← Back to Summary
        </button>
      )}
      {step === "form" && (
        <div className="flex flex-col gap-5">
          <div
            className="rounded-xl border p-4 text-xs leading-relaxed"
            style={{ backgroundColor: `${BRAND.accent}08`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
          >
            🔒 Your data is encrypted and used solely for compliance verification.
            AccuBridge complies with FCA and FIRS data protection requirements.
          </div>

          {/* Personal info */}
          <div
            className="rounded-2xl border p-4 flex flex-col gap-4"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: BRAND.accent }}>
              Personal Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FField label="Full Legal Name" required error={errors.full_name}>
                <input
                  type="text" placeholder="Jane Okonkwo"
                  value={form.full_name || ""} onChange={set("full_name")}
                  className={inputBase} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />
              </FField>
              <FField label="Date of Birth" required error={errors.dob}>
                <input
                  type="date" value={form.dob || ""} onChange={set("dob")}
                  className={inputBase} style={{ ...inputStyle, colorScheme: "dark" as const }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </FField>
              <FField label="Nationality" required error={errors.nationality}>
                <input
                  type="text" placeholder="British / Nigerian"
                  value={form.nationality || ""} onChange={set("nationality")}
                  className={inputBase} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />
              </FField>
              <FField label="Country of Residence">
                <select
                  value={form.country || "uk"} onChange={set("country")}
                  className={`${inputBase} appearance-none cursor-pointer`}
                  style={{ ...inputStyle, colorScheme: "dark" as const }}
                  onFocus={onFocus} onBlur={onBlur}
                >
                  <option value="uk" style={{ backgroundColor: "#0f1e3a" }}>🇬🇧 United Kingdom</option>
                  <option value="nigeria" style={{ backgroundColor: "#0f1e3a" }}>🇳🇬 Nigeria</option>
                </select>
              </FField>
              <div className="sm:col-span-2">
                <FField label="Residential Address">
                  <input
                    type="text" placeholder="123 Business Street, London"
                    value={form.address || ""} onChange={set("address")}
                    className={inputBase} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </FField>
              </div>
            </div>
          </div>

          {/* ID documents — multiple */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: BRAND.accent }}>
                  Government-Issued ID
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  You can add up to 3 identity documents
                </div>
              </div>
              {ids.length < 3 && (
                <button
                  type="button"
                  onClick={addId}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 h-8 rounded-lg border transition-all duration-200"
                  style={{ backgroundColor: `${BRAND.accent}10`, borderColor: `${BRAND.accent}25`, color: BRAND.accent }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}10`; }}
                >
                  <Plus size={13} />Add another ID
                </button>
              )}
            </div>

            {ids.map((doc, i) => (
              <IDDocumentEntry
                key={i}
                index={i}
                doc={doc}
                onChange={(d) => updateId(i, d)}
                onRemove={() => removeId(i)}
                canRemove={i > 0}
                error={idErrors[i]}
              />
            ))}
          </div>

          <div
            className="rounded-xl border p-4 text-xs leading-relaxed"
            style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
          >
            By submitting, you consent to AccuBridge performing AML, PEP screening, and sanctions checks
            against your identity. These checks are required for FCA compliance and funding eligibility.
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center gap-6 py-16">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${BRAND.accent}15` }}>
            <ShieldCheck size={28} className="animate-pulse" style={{ color: BRAND.accent }} />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold mb-2">Running verification checks</p>
            <div className="flex flex-col gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {["Verifying identity documents…", "Running AML checks…", "Checking PEP & sanctions lists…"].map((msg) => (
                <div key={msg} className="flex items-center gap-2 justify-center">
                  <Loader2 size={11} className="animate-spin" style={{ color: BRAND.accent }} />{msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${BRAND.green}20`, border: `2px solid ${BRAND.green}` }}>
            <ShieldCheck size={28} style={{ color: BRAND.green }} />
          </div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Identity Verified</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Your identity has been successfully verified. Your compliance score has been updated.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {["✓ AML Clear", "✓ Identity Confirmed", "✓ No PEP Match"].map((b) => (
              <span key={b} className="text-xs px-3 py-1 rounded-full border"
                style={{ backgroundColor: `${BRAND.green}12`, color: BRAND.green, borderColor: `${BRAND.green}25` }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {step === "failed" && (
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)" }}>
            <AlertCircle size={28} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Verification Failed</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              We were unable to verify your identity. Please check your details and try again.
            </p>
          </div>
        </div>
      )}
    </SystemSheet>
  );
}
