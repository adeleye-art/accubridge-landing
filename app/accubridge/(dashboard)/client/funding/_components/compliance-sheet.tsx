"use client";

import React, { useState } from "react";
import { SystemSheet } from "@/components/accubridge/shared/system-sheet";
import type { ComplianceEligibility } from "@/types/accubridge/funding";
import { ShieldCheck, CheckCircle2, XCircle, Loader2, Upload } from "lucide-react";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  eligibility: ComplianceEligibility;
  onCheckEligibility: () => Promise<void>;
  onApply: (amount: string, notes: string) => Promise<void>;
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.1)",
  colorScheme: "dark",
};

export function ComplianceSheet({ isOpen, onClose, eligibility, onCheckEligibility, onApply }: Props) {
  const [isChecking, setIsChecking] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [amount, setAmount]         = useState("");
  const [notes, setNotes]           = useState("");
  const [showForm, setShowForm]     = useState(false);
  const { is_eligible } = eligibility;

  return (
    <SystemSheet
      open={isOpen}
      onClose={onClose}
      title="Compliance-Based Grants"
      description="Earn funding through consistent compliance and platform activity"
      footer={
        is_eligible && showForm ? (
          <button type="button"
            onClick={async () => { setIsApplying(true); await onApply(amount, notes); setIsApplying(false); setShowForm(false); }}
            disabled={isApplying || !amount}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all duration-200"
            style={{ backgroundColor: amount ? BRAND.gold : "rgba(255,255,255,0.08)", color: amount ? BRAND.primary : BRAND.muted }}>
            {isApplying ? <><Loader2 size={15} className="animate-spin" />Submitting…</> : <>Submit Application</>}
          </button>
        ) : is_eligible ? (
          <button type="button" onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all duration-200"
            style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
            <ShieldCheck size={15} />Apply Now
          </button>
        ) : (
          <button type="button"
            onClick={async () => { setIsChecking(true); await onCheckEligibility(); setIsChecking(false); }}
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all duration-200"
            style={{ backgroundColor: `${BRAND.accent}20`, color: BRAND.accent }}>
            {isChecking ? <><Loader2 size={15} className="animate-spin" />Checking…</> : <><ShieldCheck size={15} />Re-check Eligibility</>}
          </button>
        )
      }
    >
      <div className="flex flex-col gap-5">
        {/* Eligibility status */}
        <div className="rounded-2xl border p-5 flex flex-col gap-4"
          style={{
            backgroundColor: is_eligible ? `${BRAND.green}06` : "rgba(239,68,68,0.04)",
            borderColor: is_eligible ? `${BRAND.green}25` : "rgba(239,68,68,0.2)",
          }}>
          <div className="flex items-center gap-3">
            {is_eligible
              ? <CheckCircle2 size={20} style={{ color: BRAND.green }} />
              : <XCircle size={20} style={{ color: "#ef4444" }} />}
            <div>
              <div className="text-sm font-bold" style={{ color: is_eligible ? BRAND.green : "#ef4444" }}>
                {is_eligible ? "You are eligible to apply" : "Not yet eligible"}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Last checked: {new Date(eligibility.checked_at).toLocaleDateString("en-GB")}
              </div>
            </div>
          </div>

          {[
            { label: "Compliance Score", value: eligibility.compliance_score, min: eligibility.min_score_required, max: 100, unit: "",    passes: eligibility.compliance_score >= eligibility.min_score_required },
            { label: "Months Active",    value: eligibility.months_active,    min: eligibility.min_months_required, max: 24,  unit: " mo", passes: eligibility.months_active >= eligibility.min_months_required    },
          ].map((c) => (
            <div key={c.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs" style={{ color: BRAND.muted }}>{c.label}</span>
                <span className="text-xs font-bold" style={{ color: c.passes ? BRAND.green : "#ef4444" }}>
                  {c.value}{c.unit} / {c.min}{c.unit} required
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((c.value / c.max) * 100, 100)}%`, backgroundColor: c.passes ? BRAND.green : "#ef4444" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Application form */}
        {is_eligible && showForm && (
          <div className="rounded-2xl border p-5 flex flex-col gap-4"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.accent }}>Grant Application</div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>
                Amount Requested (£) <span style={{ color: BRAND.gold }}>*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: BRAND.muted }}>£</span>
                <input type="number" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-11 pl-7 pr-4 rounded-xl text-sm text-white border outline-none transition-all duration-200"
                  style={inputStyle} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>Business Case / Notes</label>
              <textarea placeholder="Briefly describe how you'll use this funding…" value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm text-white border outline-none transition-all duration-200 resize-none"
                style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>Supporting Documents (optional)</label>
              <button type="button"
                className="flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-medium border transition-all duration-200"
                style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,255,255,0.04)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}>
                <Upload size={13} />Upload Supporting Documents
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        {!showForm && (
          <div className="rounded-2xl border p-4 flex flex-col gap-3"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>How It Works</div>
            {[
              "Maintain a compliance score of 70+ for 12+ months",
              "Submit an application with your intended use of funds",
              "AccuBridge reviews your compliance history and application",
              "Approved grants are disbursed directly to your business account",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${BRAND.green}20`, color: BRAND.green }}>{i + 1}</div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </SystemSheet>
  );
}
