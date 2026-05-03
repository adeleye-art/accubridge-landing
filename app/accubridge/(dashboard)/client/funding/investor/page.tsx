"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, TrendingUp, Upload, FileText, CheckCircle2, Clock, XCircle, Loader2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/accubridge/shared/page-header";
import { useToast } from "@/components/accubridge/shared/toast";
import {
  useGetFundingApplicationsQuery,
  useCreateFundingApplicationMutation,
  useSubmitFundingApplicationMutation,
  type ApiFundingApplication,
} from "@/lib/accubridge/api/fundingApi";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

const TIMELINE = [
  { key: "submitted",    label: "Pitch Submitted", icon: <Upload size={14} />       },
  { key: "under_review", label: "Under Review",    icon: <Clock size={14} />        },
  { key: "approved",     label: "Approved",        icon: <CheckCircle2 size={14} /> },
];

function statusToTimelineIndex(status: string): number {
  switch (status) {
    case "Submitted":   return 0;
    case "UnderReview": return 1;
    case "Approved":    return 2;
    default:            return 0;
  }
}

function SubmissionStatus({ app }: { app: ApiFundingApplication }) {
  const isRejected      = app.status === "Rejected";
  const currentStepIndex = isRejected ? 1 : statusToTimelineIndex(app.status);
  const submittedDate    = app.submittedAt ?? app.createdAt;

  return (
    <div className="rounded-2xl border p-6 flex flex-col gap-6"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: `${BRAND.accent}25` }}>
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-base">Submission Status</h2>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
          style={{
            backgroundColor: isRejected ? "rgba(239,68,68,0.12)" : `${BRAND.accent}15`,
            color: isRejected ? "#ef4444" : BRAND.accent,
            borderColor: isRejected ? "rgba(239,68,68,0.3)" : `${BRAND.accent}30`,
          }}>
          {isRejected ? "Not Approved" : "In Progress"}
        </span>
      </div>

      {/* File info */}
      <div className="flex items-center gap-3 p-4 rounded-xl"
        style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
        <FileText size={18} style={{ color: BRAND.accent }} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {app.purpose?.replace("Investor pitch: ", "") || `Pitch #${app.id}`}
          </div>
          <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
            Submitted {new Date(submittedDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-2">
        {TIMELINE.map((step, i) => {
          const isDone    = i <= currentStepIndex;
          const isCurrent = i === currentStepIndex;
          const isFailed  = isRejected && i === 1;

          return (
            <div key={step.key} className="flex items-start gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300"
                  style={{
                    backgroundColor: isFailed ? "rgba(239,68,68,0.2)" : isDone ? `${BRAND.green}20` : "rgba(255,255,255,0.06)",
                    borderColor:     isFailed ? "rgba(239,68,68,0.4)" : isDone ? `${BRAND.green}40` : "rgba(255,255,255,0.1)",
                    color:           isFailed ? "#ef4444"              : isDone ? BRAND.green        : BRAND.muted,
                  }}
                >
                  {isFailed ? <XCircle size={14} /> : step.icon}
                </div>
                {i < TIMELINE.length - 1 && (
                  <div className="w-px h-6 mt-1"
                    style={{ backgroundColor: isDone ? `${BRAND.green}40` : "rgba(255,255,255,0.08)" }} />
                )}
              </div>
              <div className="pt-1.5">
                <div className="text-sm font-medium"
                  style={{ color: isCurrent ? "#fff" : isDone ? BRAND.green : "rgba(255,255,255,0.35)" }}>
                  {isFailed ? "Not Approved" : step.label}
                </div>
                {isCurrent && !isFailed && (
                  <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>Current stage</div>
                )}
                {isFailed && app.rejectionReason && (
                  <div className="text-xs mt-0.5" style={{ color: "rgba(239,68,68,0.7)" }}>{app.rejectionReason}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {app.status === "Approved" ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ backgroundColor: `${BRAND.green}10`, borderColor: `${BRAND.green}25` }}>
          <CheckCircle2 size={18} style={{ color: BRAND.green }} />
          <div>
            <div className="text-sm font-bold" style={{ color: BRAND.green }}>Pitch Approved — Investor Access Granted</div>
            <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Your AccuBridge team will be in touch shortly
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ backgroundColor: `${BRAND.accent}08`, borderColor: `${BRAND.accent}20` }}>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            We review all pitches within 5 business days. You'll receive a notification when there's an update.
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvestorPitchPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging,   setIsDragging]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: fundingData, isLoading } = useGetFundingApplicationsQuery({ type: 4, pageSize: 10 });
  const [createFunding] = useCreateFundingApplicationMutation();
  const [submitFunding] = useSubmitFundingApplicationMutation();

  // Show existing submission if one exists (any non-draft status)
  const existingSubmission = (fundingData?.applications ?? []).find(
    (a) => a.status !== "Draft" && a.status !== "Cancelled",
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".pdf") || file.name.endsWith(".pptx") || file.name.endsWith(".ppt"))) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;
    setIsSubmitting(true);
    try {
      const app = await createFunding({
        type: 4,
        requestedAmount: 0,
        purpose: `Investor pitch: ${uploadedFile.name}`,
      }).unwrap();
      await submitFunding(app.id).unwrap();
      toast({ title: "Pitch submitted successfully", variant: "success" });
      setUploadedFile(null);
    } catch {
      toast({ title: "Failed to submit pitch. Please try again.", variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <div className="mb-4">
          <Link
            href="/accubridge/client/funding"
            className="inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
            style={{ color: BRAND.accent }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = BRAND.accent; }}
          >
            <ChevronLeft size={15} />Back to Funding
          </Link>
        </div>

        <PageHeader
          badge="Funding"
          title="Investor Pitch"
          description="Upload your pitch deck and connect with the AccuBridge investor network"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* Left — upload / submission status */}
          <div className="flex flex-col gap-5">
            {isLoading ? (
              <div className="rounded-2xl border p-12 flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                <Loader2 size={24} className="animate-spin" style={{ color: BRAND.muted }} />
              </div>
            ) : existingSubmission ? (
              <SubmissionStatus app={existingSubmission} />
            ) : (
              /* Upload zone */
              <div className="rounded-2xl border p-6 flex flex-col gap-6"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND.accent}18`, color: BRAND.accent }}>
                    <TrendingUp size={20} />
                  </div>
                  <h2 className="text-white font-bold text-base">Upload Your Pitch Deck</h2>
                </div>

                {/* Drop zone */}
                <div
                  className="rounded-2xl border border-dashed p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: isDragging ? BRAND.accent : uploadedFile ? `${BRAND.green}50` : "rgba(255,255,255,0.15)",
                    backgroundColor: isDragging ? `${BRAND.accent}06` : uploadedFile ? `${BRAND.green}05` : "transparent",
                  }}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <>
                      <CheckCircle2 size={36} style={{ color: BRAND.green }} />
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white">{uploadedFile.name}</div>
                        <div className="text-xs mt-1" style={{ color: BRAND.muted }}>
                          {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB — ready to submit
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                        className="flex items-center gap-1.5 text-xs transition-colors duration-200"
                        style={{ color: BRAND.muted }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = BRAND.muted; }}
                      >
                        <Trash2 size={12} />Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${BRAND.accent}12`, color: BRAND.accent }}>
                        <Upload size={26} />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white">
                          {isDragging ? "Drop to upload" : "Drag & drop or click to upload"}
                        </div>
                        <div className="text-xs mt-1.5" style={{ color: BRAND.muted }}>PDF, PPTX or PPT · Max 20MB</div>
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.pptx,.ppt"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); }}
                />

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!uploadedFile || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: uploadedFile ? BRAND.gold : "rgba(255,255,255,0.08)", color: uploadedFile ? BRAND.primary : BRAND.muted }}
                >
                  {isSubmitting
                    ? <><Loader2 size={15} className="animate-spin" />Submitting pitch…</>
                    : <><TrendingUp size={15} />Submit Pitch Deck</>}
                </button>
              </div>
            )}
          </div>

          {/* Right — pitch guide */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border p-6 flex flex-col gap-4"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <h2 className="text-white font-bold text-base">What to Include</h2>
              {[
                { title: "Problem & Solution",  desc: "What problem are you solving and how does your product/service address it?" },
                { title: "Market Size",         desc: "TAM, SAM, SOM with credible data and sources." },
                { title: "Business Model",      desc: "How does the business generate revenue?" },
                { title: "Traction",            desc: "Current customers, revenue, or key milestones achieved." },
                { title: "Funding Ask",         desc: "How much are you raising and exactly how will it be used?" },
                { title: "Team",                desc: "Founders' backgrounds and relevant experience." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: BRAND.accent }} />
                  <div>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border p-5 flex flex-col gap-3"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>Accepted Formats</div>
              {[
                { label: "PDF",  desc: "Recommended format"  },
                { label: "PPTX", desc: "PowerPoint presentation" },
                { label: "PPT",  desc: "Legacy PowerPoint"   },
              ].map((fmt) => (
                <div key={fmt.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black"
                    style={{ backgroundColor: `${BRAND.accent}12`, color: BRAND.accent }}>
                    {fmt.label}
                  </div>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{fmt.desc}</span>
                </div>
              ))}
              <div className="text-[11px] mt-1" style={{ color: BRAND.muted }}>Maximum file size: 20MB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
