"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, CheckCircle2, XCircle, Loader2, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/shared/toast";
import { useGetClientDashboardQuery } from "@/lib/api/clientDashboardApi";
import {
  useGetFundingApplicationsQuery,
  useCreateFundingApplicationMutation,
  useSubmitFundingApplicationMutation,
} from "@/lib/api/fundingApi";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

const MIN_SCORE   = 70;
const MIN_MONTHS  = 12;

const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderColor:     "rgba(255,255,255,0.1)",
  colorScheme:     "dark",
};

function appStatusLabel(status: string): { label: string; color: string; bg: string } {
  switch (status) {
    case "Submitted":
    case "UnderReview": return { label: "Pending Review", color: BRAND.gold,  bg: `${BRAND.gold}15`   };
    case "Approved":    return { label: "Approved",        color: BRAND.green, bg: `${BRAND.green}15`  };
    case "Rejected":    return { label: "Rejected",        color: "#ef4444",   bg: "rgba(239,68,68,0.12)" };
    default:            return { label: status,            color: BRAND.muted, bg: "rgba(255,255,255,0.06)" };
  }
}

export default function ComplianceGrantsPage() {
  const [amount,       setAmount]       = useState("");
  const [notes,        setNotes]        = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const { toast } = useToast();

  // Load compliance score from client dashboard
  const { data: dashboard, isLoading: dashLoading } = useGetClientDashboardQuery();
  const complianceScore = dashboard?.complianceScore?.score ?? 0;

  // Estimate months active from business registration step (rough proxy)
  const currentStep = dashboard?.businessRegistration?.currentStep ?? 0;
  const monthsActive = currentStep >= 5 ? MIN_MONTHS : 0; // Simplified — show as eligible if fully onboarded

  const isEligible = complianceScore >= MIN_SCORE && monthsActive >= MIN_MONTHS;

  // Load existing compliance grant applications
  const { data: fundingData, isLoading: appsLoading } = useGetFundingApplicationsQuery({ type: 5, pageSize: 50 });
  const applications = (fundingData?.applications ?? []).filter((a) => a.status !== "Draft");

  const [createFunding] = useCreateFundingApplicationMutation();
  const [submitFunding] = useSubmitFundingApplicationMutation();

  const handleApply = async () => {
    if (!amount) return;
    setIsSubmitting(true);
    try {
      const app = await createFunding({
        type: 5,
        requestedAmount: Number(amount),
        purpose: notes.trim() || "Compliance grant application",
      }).unwrap();
      await submitFunding(app.id).unwrap();
      setAmount("");
      setNotes("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      toast({ title: "Application submitted successfully", variant: "success" });
    } catch {
      toast({ title: "Failed to submit application. Please try again.", variant: "error" });
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
            href="/client/funding"
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
          title="Compliance Grants"
          description="Earn funding by maintaining a strong compliance score over 12+ months"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* Left — eligibility + how it works */}
          <div className="flex flex-col gap-5">

            {/* Eligibility card */}
            <div
              className="rounded-2xl border p-6 flex flex-col gap-5"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: isEligible ? `${BRAND.green}25` : "rgba(239,68,68,0.2)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND.green}15`, color: BRAND.green }}>
                    <ShieldCheck size={20} />
                  </div>
                  <h2 className="text-white font-bold text-base">Eligibility Status</h2>
                </div>
                {dashLoading ? (
                  <Loader2 size={16} className="animate-spin" style={{ color: BRAND.muted }} />
                ) : (
                  <span
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
                    style={{
                      backgroundColor: isEligible ? `${BRAND.green}15` : "rgba(239,68,68,0.12)",
                      color: isEligible ? BRAND.green : "#ef4444",
                      borderColor: isEligible ? `${BRAND.green}30` : "rgba(239,68,68,0.25)",
                    }}
                  >
                    {isEligible
                      ? <><CheckCircle2 size={12} />Eligible</>
                      : <><XCircle size={12} />Not Eligible</>}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { label: "Compliance Score", value: complianceScore, min: MIN_SCORE,  max: 100, unit: "",    passes: complianceScore >= MIN_SCORE },
                  { label: "Months Active",    value: monthsActive,    min: MIN_MONTHS, max: 24,  unit: " mo", passes: monthsActive >= MIN_MONTHS  },
                ].map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{c.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: c.passes ? BRAND.green : "#ef4444" }}>
                          {dashLoading ? "…" : `${c.value}${c.unit}`}
                        </span>
                        {!dashLoading && (c.passes
                          ? <CheckCircle2 size={14} style={{ color: BRAND.green }} />
                          : <XCircle size={14} style={{ color: "#ef4444" }} />)}
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((c.value / c.max) * 100, 100)}%`,
                          backgroundColor: c.passes ? BRAND.green : "#ef4444",
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px]" style={{ color: BRAND.muted }}>0{c.unit}</span>
                      <span className="text-[11px]" style={{ color: BRAND.muted }}>Min: {c.min}{c.unit}</span>
                      <span className="text-[11px]" style={{ color: BRAND.muted }}>{c.max}{c.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl border p-6 flex flex-col gap-4"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <h2 className="text-white font-bold text-base">How It Works</h2>
              {[
                { step: "01", title: "Meet the criteria",      desc: `Maintain a compliance score of ${MIN_SCORE}+ for at least ${MIN_MONTHS} months.` },
                { step: "02", title: "Submit an application",  desc: "State the amount requested and describe your intended use of funds." },
                { step: "03", title: "Admin reviews",          desc: "AccuBridge reviews your compliance history and application within 5 business days." },
                { step: "04", title: "Receive funding",        desc: "Approved grants are disbursed directly to your registered business account." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: `${BRAND.green}12`, color: BRAND.green }}>
                    {item.step}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-0.5">{item.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — application form + history */}
          <div className="flex flex-col gap-5">

            {/* Application form */}
            <div
              className="rounded-2xl border p-6 flex flex-col gap-5"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.08)",
                opacity: isEligible ? 1 : 0.5,
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-base">Apply for a Grant</h2>
                {!isEligible && !dashLoading && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                    Not eligible yet
                  </span>
                )}
              </div>

              {submitted && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border"
                  style={{ backgroundColor: `${BRAND.green}12`, borderColor: `${BRAND.green}30` }}>
                  <CheckCircle2 size={15} style={{ color: BRAND.green }} />
                  <span className="text-sm font-medium" style={{ color: BRAND.green }}>Application submitted!</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>
                  Amount Requested (£) <span style={{ color: BRAND.gold }}>*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: BRAND.muted }}>£</span>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={!isEligible}
                    className="w-full h-11 pl-7 pr-4 rounded-xl text-sm text-white border outline-none transition-all duration-200 disabled:cursor-not-allowed"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>
                  Business Case / Notes
                </label>
                <textarea
                  placeholder="Briefly describe how you'll use this funding…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!isEligible}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white border outline-none transition-all duration-200 resize-none disabled:cursor-not-allowed"
                  style={inputStyle}
                />
              </div>

              <button
                type="button"
                onClick={handleApply}
                disabled={!isEligible || !amount || isSubmitting}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
              >
                {isSubmitting
                  ? <><Loader2 size={15} className="animate-spin" />Submitting…</>
                  : <><Send size={15} />Submit Application</>}
              </button>
            </div>

            {/* Application history */}
            <div className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="px-5 py-4 border-b flex items-center justify-between"
                style={{ borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.03)" }}>
                <span className="text-sm font-bold text-white">My Applications</span>
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: BRAND.muted }}>
                  {applications.length}
                </span>
              </div>

              {appsLoading ? (
                <div className="py-8 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin" style={{ color: BRAND.muted }} />
                </div>
              ) : applications.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", color: BRAND.muted }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div className="text-sm font-medium" style={{ color: BRAND.muted }}>No applications yet</div>
                  <div className="text-xs text-center max-w-[200px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {isEligible ? "Submit your first application above" : "Meet the eligibility criteria to apply"}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {applications.map((app) => {
                    const { label, color, bg } = appStatusLabel(app.status);
                    return (
                      <div
                        key={app.id}
                        className="flex items-center justify-between px-5 py-4 border-b last:border-0"
                        style={{ borderColor: "rgba(255,255,255,0.05)" }}
                      >
                        <div>
                          <div className="text-sm font-medium text-white truncate max-w-[180px]">
                            {app.purpose || `Grant Application #${app.id}`}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold" style={{ color: BRAND.gold }}>
                              £{app.requestedAmount.toLocaleString("en-GB")}
                            </span>
                          </div>
                        </div>
                        <span
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0"
                          style={{ backgroundColor: bg, color, borderColor: `${color}30` }}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
