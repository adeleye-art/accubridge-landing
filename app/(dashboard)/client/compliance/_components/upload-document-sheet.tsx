"use client";

import React, { useState, useRef } from "react";
import { SystemSheet } from "@/components/shared/system-sheet";
import { Upload, FileText, CheckCircle2, Loader2, Check, X } from "lucide-react";
import { useUploadComplianceDocumentMutation } from "@/lib/api/complianceCentreApi";
import { useToast } from "@/components/shared/toast";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

const DOC_TYPES = [
  { value: "incorporation_certificate",  label: "Certificate of Incorporation" },
  { value: "cac_document",              label: "CAC Certificate (Nigeria)" },
  { value: "companies_house_extract",   label: "Companies House Extract (UK)" },
  { value: "director_id",               label: "Director / Owner ID" },
  { value: "proof_of_address",          label: "Proof of Registered Address" },
  { value: "tax_document",              label: "Tax Registration / UTR Document" },
  { value: "bank_statement",            label: "Bank Statement" },
  { value: "vat_certificate",           label: "VAT Certificate" },
  { value: "aml_document",              label: "AML / Compliance Document" },
  { value: "other",                     label: "Other" },
];

interface UploadedFile {
  file: File;
  name: string;
  size: number;
}

interface UploadDocumentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDocType?: string;
  title?: string;
  description?: string;
}

export function UploadDocumentSheet({
  isOpen,
  onClose,
  defaultDocType = "",
  title = "Upload Document",
  description = "Upload a compliance document to your AccuBridge profile",
}: UploadDocumentSheetProps) {
  const [docType, setDocType] = useState(defaultDocType);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"form" | "uploading" | "success">("form");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next: UploadedFile[] = Array.from(incoming).map((f) => ({
      file: f, name: f.name, size: f.size,
    }));
    setFiles((prev) => [...prev, ...next].slice(0, 5));
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const [uploadDoc] = useUploadComplianceDocumentMutation();
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!docType || files.length === 0) return;
    setStep("uploading");
    try {
      for (const f of files) {
        await uploadDoc({
          documentType: docType,
          file: f.file,
          fileName: f.name,
          fileSizeBytes: f.size,
          notes: notes || undefined,
        }).unwrap();
      }
      setStep("success");
    } catch {
      setStep("form");
      toast({ title: "Upload failed. Please try again.", variant: "error" });
    }
  };

  const handleClose = () => {
    setStep("form");
    setFiles([]);
    setDocType(defaultDocType);
    setNotes("");
    onClose();
  };

  const canSubmit = docType && files.length > 0;

  const footer =
    step === "form" ? (
      <button
        type="button"
        onClick={handleUpload}
        disabled={!canSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.backgroundColor = "#c49b30"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BRAND.gold; }}
      >
        <Upload size={15} />Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""}` : "Document"}
      </button>
    ) : step === "uploading" ? (
      <div className="flex items-center justify-center gap-2 h-11" style={{ color: BRAND.accent }}>
        <Loader2 size={16} className="animate-spin" /><span className="text-sm">Uploading…</span>
      </div>
    ) : (
      <button
        type="button" onClick={handleClose}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
        style={{ backgroundColor: `${BRAND.green}20`, color: BRAND.green, border: `1px solid ${BRAND.green}30` }}
      >
        <Check size={15} />Done
      </button>
    );

  return (
    <SystemSheet open={isOpen} onClose={handleClose} title={title} description={description} footer={footer} width={520}>
      {step === "form" && (
        <button
          type="button"
          onClick={handleClose}
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
          {/* Doc type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>
              Document Type <span style={{ color: BRAND.gold }}>*</span>
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full h-11 px-4 rounded-xl text-sm text-white border outline-none transition-all duration-200 appearance-none cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)", colorScheme: "dark" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(62,146,204,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(62,146,204,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
            >
              <option value="" style={{ backgroundColor: "#0f1e3a" }}>Select document type…</option>
              {DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value} style={{ backgroundColor: "#0f1e3a" }}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Drop zone */}
          <div
            className="rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 text-center cursor-pointer transition-all duration-200"
            style={{
              borderColor: dragOver ? BRAND.accent : "rgba(255,255,255,0.12)",
              backgroundColor: dragOver ? `${BRAND.accent}06` : "rgba(255,255,255,0.02)",
            }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${BRAND.accent}12`, color: BRAND.accent }}>
              <Upload size={22} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Drop files here or click to browse</div>
              <div className="text-xs mt-1" style={{ color: BRAND.muted }}>PDF, JPG, PNG · Max 5 MB per file · Up to 5 files</div>
            </div>
            <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
              onChange={(e) => addFiles(e.target.files)} />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              {files.map((f, i) => (
                <div key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <FileText size={16} style={{ color: BRAND.accent, flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{f.name}</div>
                    <div className="text-[11px]" style={{ color: BRAND.muted }}>{(f.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button type="button" onClick={() => removeFile(i)} className="flex-shrink-0 transition-opacity hover:opacity-70">
                    <X size={14} style={{ color: BRAND.muted }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>Notes (optional)</label>
            <textarea
              placeholder="Any context about this document…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm text-white border outline-none resize-none placeholder-[#6B7280] transition-all duration-200"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)", colorScheme: "dark" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(62,146,204,0.6)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
          </div>
        </div>
      )}

      {step === "uploading" && (
        <div className="flex flex-col items-center gap-6 py-16">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${BRAND.accent}15` }}>
            <Upload size={28} className="animate-pulse" style={{ color: BRAND.accent }} />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold mb-1">Uploading {files.length} file{files.length > 1 ? "s" : ""}…</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Encrypting and storing securely</p>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${BRAND.green}20`, border: `2px solid ${BRAND.green}` }}>
            <CheckCircle2 size={28} style={{ color: BRAND.green }} />
          </div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Document Uploaded</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Your document has been uploaded and is pending review. Your compliance score will update once verified.
            </p>
          </div>
        </div>
      )}
    </SystemSheet>
  );
}
