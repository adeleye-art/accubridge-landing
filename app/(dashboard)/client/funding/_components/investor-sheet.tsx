"use client";

import React, { useState, useRef } from "react";
import { SystemSheet } from "@/components/shared/system-sheet";
import type { InvestorSubmission } from "@/types/funding";
import { Upload, FileText, CheckCircle2, Clock, XCircle, Loader2, Eye } from "lucide-react";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  submission: InvestorSubmission | null;
  onUploadAndSubmit: (fileName: string) => Promise<void>;
}

const TIMELINE = [
  { key: "submitted",    label: "Pitch Submitted", icon: <Upload size={14} />        },
  { key: "under_review", label: "Under Review",    icon: <Clock size={14} />         },
  { key: "approved",     label: "Approved",        icon: <CheckCircle2 size={14} />  },
];

export function InvestorSheet({ isOpen, onClose, submission, onUploadAndSubmit }: Props) {
  const [isUploading, setIsUploading]   = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentStepIndex = submission
    ? TIMELINE.findIndex((s) => s.key === submission.status)
    : -1;

  return (
    <SystemSheet
      open={isOpen}
      onClose={onClose}
      title="Investor Pitch Funding"
      description="Upload your pitch deck and connect with our investor network"
      footer={
        !submission ? (
          <button type="button"
            onClick={async () => {
              if (!uploadedFile) { fileRef.current?.click(); return; }
              setIsUploading(true);
              await onUploadAndSubmit(uploadedFile.name);
              setIsUploading(false);
            }}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all duration-200"
            style={{ backgroundColor: uploadedFile ? BRAND.gold : `${BRAND.accent}20`, color: uploadedFile ? BRAND.primary : BRAND.accent }}>
            {isUploading
              ? <><Loader2 size={15} className="animate-spin" />Submitting pitch…</>
              : uploadedFile ? <>Submit Pitch Deck</> : <><Upload size={15} />Upload Pitch Deck</>}
          </button>
        ) : submission.status === "approved" ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border"
            style={{ backgroundColor: `${BRAND.green}10`, borderColor: `${BRAND.green}25` }}>
            <CheckCircle2 size={16} style={{ color: BRAND.green }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: BRAND.green }}>Pitch Approved — Investor Access Granted</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Your AccuBridge team will be in touch shortly</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl border"
            style={{ backgroundColor: `${BRAND.accent}10`, borderColor: `${BRAND.accent}25` }}>
            <Eye size={15} style={{ color: BRAND.accent }} />
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              Your pitch is being reviewed. We'll notify you within 5 business days.
            </div>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-5">
        {/* Status timeline */}
        {submission && (
          <div className="rounded-2xl border p-5 flex flex-col gap-4"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.accent }}>Submission Status</div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <FileText size={16} style={{ color: BRAND.accent }} />
              <span className="text-sm text-white font-medium truncate">{submission.pitch_deck_name}</span>
            </div>
            <div className="flex flex-col gap-1">
              {TIMELINE.map((step, i) => {
                const isDone     = i <= currentStepIndex;
                const isCurrent  = i === currentStepIndex;
                const isRejected = submission.status === "rejected" && i === 1;
                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300"
                        style={{
                          backgroundColor: isRejected ? "rgba(239,68,68,0.2)" : isDone ? `${BRAND.green}20` : "rgba(255,255,255,0.06)",
                          borderColor: isRejected ? "rgba(239,68,68,0.4)" : isDone ? `${BRAND.green}40` : "rgba(255,255,255,0.1)",
                          color: isRejected ? "#ef4444" : isDone ? BRAND.green : BRAND.muted,
                        }}>
                        {isRejected ? <XCircle size={13} /> : step.icon}
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className="w-px h-5 mt-0.5"
                          style={{ backgroundColor: isDone ? `${BRAND.green}40` : "rgba(255,255,255,0.08)" }} />
                      )}
                    </div>
                    <div className="pt-1">
                      <div className="text-sm font-medium"
                        style={{ color: isCurrent ? "#fff" : isDone ? BRAND.green : "rgba(255,255,255,0.35)" }}>
                        {isRejected ? "Not Approved" : step.label}
                      </div>
                      {isCurrent && !isRejected && <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>Current stage</div>}
                      {isRejected && submission.reviewer_notes && (
                        <div className="text-xs mt-0.5" style={{ color: "rgba(239,68,68,0.7)" }}>{submission.reviewer_notes}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload zone */}
        {!submission && (
          <div
            className="rounded-2xl border border-dashed p-6 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200"
            style={{ borderColor: uploadedFile ? `${BRAND.accent}40` : "rgba(255,255,255,0.12)" }}
            onClick={() => fileRef.current?.click()}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}06`; e.currentTarget.style.borderColor = `${BRAND.accent}40`; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = uploadedFile ? `${BRAND.accent}40` : "rgba(255,255,255,0.12)"; }}
          >
            {uploadedFile ? (
              <>
                <CheckCircle2 size={28} style={{ color: BRAND.green }} />
                <div className="text-center">
                  <div className="text-sm font-medium text-white">{uploadedFile.name}</div>
                  <div className="text-xs mt-1" style={{ color: BRAND.muted }}>Ready to submit — click below</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${BRAND.accent}15`, color: BRAND.accent }}>
                  <Upload size={22} />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-white">Upload your pitch deck</div>
                  <div className="text-xs mt-1" style={{ color: BRAND.muted }}>PDF format recommended — max 20MB</div>
                </div>
              </>
            )}
          </div>
        )}
        <input ref={fileRef} type="file" accept=".pdf,.pptx,.ppt" className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); }} />

        {/* Pitch tips */}
        <div className="rounded-2xl border p-4 flex flex-col gap-3"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>What to Include in Your Pitch</div>
          {[
            "Problem & solution — what problem are you solving and how?",
            "Market size — TAM, SAM, SOM with credible data",
            "Business model — how does the business generate revenue?",
            "Traction — current customers, revenue, or key milestones",
            "Funding ask — how much and how will it be used?",
            "Team — founders' background and relevant experience",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: BRAND.accent }} />
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </SystemSheet>
  );
}
