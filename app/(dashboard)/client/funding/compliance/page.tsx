"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, CheckCircle2, XCircle, Loader2, Upload, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import type { FundingApplication } from "@/types/funding";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

/* Mock eligibility — in production this comes from the API */
const ELIGIBILITY = {
  months_active:       15,
  compliance_score:    82,
  min_months_required: 12,
  min_score_required:  70,
  is_eligible:         true,
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.1)",
  colorScheme: "dark",
};

export default function ComplianceGrantsPage() {
  const [applications, setApplications] = useState<FundingApplication[]>([]);
  const [amount, setAmount]             = useState("");
  const [notes, setNotes]               = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);

  const { is_eligible, compliance_score, months_active } = ELIGIBILITY;

  const handleApply = async () => {
    if (!amount) return;
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 1200));
    const newApp: FundingApplication = {
      id: `app${Date.now()}`,
      type: "compliance",
      title: `Compliance Grant — ${new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`,
      submitted_at: new Date().toISOString().split("T")[0],
      status: "pending",
      amount_requested: Number(amount),
      reference: `CBG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    };
    setApplications((prev) => [newApp, ...prev]);
    setAmount("");
    setNotes("");
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <div className="mb-4">
          <Link href="/client/funding"
            className="inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
            style={{ color: BRAND.accent }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = BRAND.accent; }}>
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
            <div className="rounded-2xl border p-6 flex flex-col gap-5"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: is_eligible ? `${BRAND.green}25` : "rgba(239,68,68,0.2)",
              }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND.green}15`, color: BRAND.green }}>
                    <ShieldCheck size={20} />
                  </div>
                  <h2 className="text-white font-bold text-base">Eligibility Status</h2>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
                  style={{
                    backgroundColor: is_eligible ? `${BRAND.green}15` : "rgba(239,68,68,0.12)",
                    color: is_eligible ? BRAND.green : "#ef4444",
                    borderColor: is_eligible ? `${BRAND.green}30` : "rgba(239,68,68,0.25)",
                  }}>
                  {is_eligible
                    ? <><CheckCircle2 size={12} />Eligible</>
                    : <><XCircle size={12} />Not Eligible</>}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { label: "Compliance Score", value: compliance_score, min: 70,  max: 100, unit: "",    passes: compliance_score >= 70  },
                  { label: "Months Active",    value: months_active,    min: 12,  max: 24,  unit: " mo", passes: months_active >= 12     },
                ].map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{c.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: c.passes ? BRAND.green : "#ef4444" }}>
                          {c.value}{c.unit}
                        </span>
                        {c.passes
                          ? <CheckCircle2 size={14} style={{ color: BRAND.green }} />
                          : <XCircle size={14} style={{ color: "#ef4444" }} />}
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((c.value / c.max) * 100, 100)}%`,
                          backgroundColor: c.passes ? BRAND.green : "#ef4444",
                        }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px]" style={{ color: BRAND.muted }}>0{c.unit}</span>
                      <span className="text-[11px]" style={{ color: BRAND.muted }}>
                        Min: {c.min}{c.unit}
                      </span>
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
                { step: "01", title: "Meet the criteria",      desc: "Maintain a compliance score of 70+ for at least 12 months." },
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
            <div className="rounded-2xl border p-6 flex flex-col gap-5"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: is_eligible ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                opacity: is_eligible ? 1 : 0.5,
              }}>
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-base">Apply for a Grant</h2>
                {!is_eligible && (
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
                  <input type="number" placeholder="e.g. 5000" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={!is_eligible}
                    className="w-full h-11 pl-7 pr-4 rounded-xl text-sm text-white border outline-none transition-all duration-200 disabled:cursor-not-allowed"
                    style={inputStyle} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>
                  Business Case / Notes
                </label>
                <textarea placeholder="Briefly describe how you'll use this funding…"
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  disabled={!is_eligible} rows={4}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white border outline-none transition-all duration-200 resize-none disabled:cursor-not-allowed"
                  style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>
                  Supporting Documents (optional)
                </label>
                <button type="button" disabled={!is_eligible}
                  className="flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-medium border transition-all duration-200 disabled:cursor-not-allowed"
                  style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => { if (is_eligible) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}>
                  <Upload size={13} />Upload Documents
                </button>
              </div>

              <button type="button" onClick={handleApply}
                disabled={!is_eligible || !amount || isSubmitting}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
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

              {applications.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", color: BRAND.muted }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div className="text-sm font-medium" style={{ color: BRAND.muted }}>No applications yet</div>
                  <div className="text-xs text-center max-w-[200px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {is_eligible ? "Submit your first application above" : "Meet the eligibility criteria to apply"}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between px-5 py-4 border-b last:border-0"
                      style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <div>
                        <div className="text-sm font-medium text-white">{app.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {app.reference && <span className="text-[10px] font-mono" style={{ color: BRAND.muted }}>{app.reference}</span>}
                          {app.amount_requested && (
                            <span className="text-[10px] font-bold" style={{ color: BRAND.gold }}>
                              £{app.amount_requested.toLocaleString("en-GB")}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border"
                        style={{ backgroundColor: "rgba(212,175,55,0.15)", color: BRAND.gold, borderColor: "rgba(212,175,55,0.30)" }}>
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
