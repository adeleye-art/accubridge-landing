"use client";

import React, { useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { MissingDocument } from "@/types/compliance";

const BRAND = { green: "#06D6A0", muted: "#6B7280" };

const CATEGORY_COLORS: Record<string, string> = {
  identity:   "#3E92CC",
  business:   "#D4AF37",
  tax:        "#06D6A0",
  compliance: "#fb923c",
};

interface MissingDocumentsCardProps {
  documents: MissingDocument[];
  onUpload: (docId: string, file: File) => void;
}

export function MissingDocumentsCard({ documents, onUpload }: MissingDocumentsCardProps) {
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  const missingRequired = documents.filter((d) => d.required && !d.uploaded);
  const missingOptional = documents.filter((d) => !d.required && !d.uploaded);
  const uploaded        = documents.filter((d) => d.uploaded);
  const allComplete     = missingRequired.length === 0;

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{
        backgroundColor: allComplete ? "rgba(6,214,160,0.04)" : "rgba(255,255,255,0.04)",
        borderColor: allComplete ? "rgba(6,214,160,0.2)" : "rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={15} style={{ color: allComplete ? BRAND.green : "#ef4444" }} />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: allComplete ? BRAND.green : "#ef4444" }}
          >
            {allComplete ? "Documents Complete" : "Missing Documents"}
          </span>
        </div>
        {!allComplete && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }}
          >
            {missingRequired.length} required
          </span>
        )}
      </div>

      {missingRequired.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#ef4444" }}>
            Required
          </p>
          {missingRequired.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{ backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.15)" }}
            >
              <AlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{doc.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{doc.description}</p>
                <span
                  className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-1"
                  style={{ backgroundColor: `${CATEGORY_COLORS[doc.category]}15`, color: CATEGORY_COLORS[doc.category] }}
                >
                  {doc.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => refs.current[doc.id]?.click()}
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold border flex-shrink-0 transition-all duration-200"
                style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              >
                <Upload size={12} /> Upload
              </button>
              <input
                ref={(el) => { refs.current[doc.id] = el; }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(doc.id, f); }}
              />
            </div>
          ))}
        </div>
      )}

      {missingOptional.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>
            Optional
          </p>
          {missingOptional.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
            >
              <FileText size={14} style={{ color: BRAND.muted, flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{doc.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{doc.description}</p>
              </div>
              <button
                type="button"
                onClick={() => refs.current[doc.id]?.click()}
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border flex-shrink-0 transition-all duration-200"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted, backgroundColor: "rgba(255,255,255,0.04)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = BRAND.muted; }}
              >
                <Upload size={12} /> Upload
              </button>
              <input
                ref={(el) => { refs.current[doc.id] = el; }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(doc.id, f); }}
              />
            </div>
          ))}
        </div>
      )}

      {uploaded.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: BRAND.green }}>
            Uploaded
          </p>
          {uploaded.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ backgroundColor: `${BRAND.green}06`, borderColor: `${BRAND.green}15` }}
            >
              <CheckCircle2 size={14} style={{ color: BRAND.green, flexShrink: 0 }} />
              <p className="text-sm font-medium text-white">{doc.label}</p>
              <span
                className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${BRAND.green}15`, color: BRAND.green }}
              >
                ✓ Uploaded
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
