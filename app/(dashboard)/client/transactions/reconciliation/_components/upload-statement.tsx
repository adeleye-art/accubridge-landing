"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle2, X, AlertCircle, Loader2 } from "lucide-react";
import type { BankStatementLine } from "@/types/reconciliation";

const BRAND = { primary: "#0A2463", accent: "#3E92CC", gold: "#D4AF37", green: "#06D6A0", muted: "#6B7280" };
const ACCEPTED = [".csv", ".pdf", ".xlsx", ".xls"];

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

interface Props {
  onParsed: (lines: BankStatementLine[]) => void;
  isLoaded: boolean;
  onClear: () => void;
  mockData: BankStatementLine[];
}

export function UploadStatement({ onParsed, isLoaded, onClear, mockData }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>(isLoaded ? "success" : "idle");
  const [fileName, setFileName] = useState<string | null>(isLoaded ? "march_statement.csv" : null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validate(file: File) {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) return "Unsupported type. Upload CSV, PDF, or Excel.";
    if (file.size > 10 * 1024 * 1024) return "File too large. Max 10 MB.";
    return null;
  }

  const processFile = useCallback(async (file: File) => {
    const err = validate(file);
    if (err) { setUploadState("error"); setErrorMsg(err); return; }
    setFileName(file.name);
    setUploadState("uploading");
    setErrorMsg(null);
    await new Promise((r) => setTimeout(r, 1800));
    setUploadState("success");
    onParsed(mockData);
  }, [mockData, onParsed]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setUploadState("idle");
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }

  function handleClear() {
    setUploadState("idle");
    setFileName(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClear();
  }

  const zoneColor =
    uploadState === "dragging" ? BRAND.accent
    : uploadState === "success" ? BRAND.green
    : uploadState === "error"   ? "#ef4444"
    : "rgba(255,255,255,0.12)";

  return (
    <div
      className="rounded-2xl border p-5 h-full"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${BRAND.accent}18`, color: BRAND.accent }}
        >
          <FileText size={16} />
        </div>
        <div>
          <h3 className="text-white font-bold text-base">Upload Bank Statement</h3>
          <p className="text-xs" style={{ color: BRAND.muted }}>
            Supported: CSV, PDF, Excel (.xlsx) — Max 10 MB
          </p>
        </div>
      </div>

      {/* Drop zone + button row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div
          className="flex-1"
          onDragOver={(e) => { e.preventDefault(); if (uploadState !== "uploading") setUploadState("dragging"); }}
          onDragLeave={() => { if (uploadState === "dragging") setUploadState("idle"); }}
          onDrop={handleDrop}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadState === "uploading"}
            className="w-full h-12 rounded-xl border border-dashed flex items-center justify-center gap-2.5 transition-all duration-200 text-sm"
            style={{
              backgroundColor:
                uploadState === "dragging" ? `${BRAND.accent}10`
                : uploadState === "success" ? `${BRAND.green}08`
                : "rgba(255,255,255,0.04)",
              borderColor: zoneColor,
              color:
                uploadState === "success" ? BRAND.green
                : uploadState === "error"  ? "#ef4444"
                : uploadState === "dragging" ? BRAND.accent
                : BRAND.muted,
              cursor: uploadState === "uploading" ? "not-allowed" : "pointer",
            }}
          >
            {uploadState === "uploading" ? (
              <><Loader2 size={16} className="animate-spin" style={{ color: BRAND.accent }} /><span style={{ color: BRAND.accent }}>Parsing statement…</span></>
            ) : uploadState === "success" && fileName ? (
              <><CheckCircle2 size={16} /><span className="font-medium truncate max-w-[240px]">{fileName}</span></>
            ) : uploadState === "error" ? (
              <><AlertCircle size={16} /><span>{errorMsg || "Upload failed — click to retry"}</span></>
            ) : (
              <><Upload size={16} /><span>{uploadState === "dragging" ? "Drop file here…" : "Click to upload or drag & drop"}</span></>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.pdf,.xlsx,.xls"
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          />
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {uploadState === "success" ? (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 px-4 h-12 rounded-xl text-sm font-medium border transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}
            >
              <X size={14} />
              Clear
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadState === "uploading"}
              className="flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                backgroundColor: uploadState === "uploading" ? `${BRAND.accent}60` : BRAND.accent,
                color: "#ffffff",
                cursor: uploadState === "uploading" ? "not-allowed" : "pointer",
              }}
            >
              <Upload size={16} />
              Upload Statement
            </button>
          )}
        </div>
      </div>

      {/* Format tips */}
      {uploadState === "idle" && (
        <div className="mt-3 flex flex-wrap gap-2">
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
      )}
    </div>
  );
}
