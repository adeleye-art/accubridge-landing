"use client";

import React from "react";
import { Eye, RotateCcw, ExternalLink, ShieldCheck } from "lucide-react";
import { BusinessRegistration, RegistrationStatus } from "@/types/accubridge/tools";

const BRAND = {
  gold: "#D4AF37",
  green: "#06D6A0",
  accent: "#3E92CC",
  muted: "#6B7280",
};

export function RegStatusBadge({ status }: { status: RegistrationStatus }) {
  const cfg = {
    draft: {
      label: "Draft",
      bg: "rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.55)",
      border: "rgba(255,255,255,0.12)",
    },
    in_progress: {
      label: "In Progress",
      bg: "rgba(212,175,55,0.15)",
      color: "#D4AF37",
      border: "rgba(212,175,55,0.30)",
    },
    pending_review: {
      label: "Pending Review",
      bg: "rgba(62,146,204,0.15)",
      color: "#3E92CC",
      border: "rgba(62,146,204,0.30)",
    },
    approved: {
      label: "Approved",
      bg: "rgba(6,214,160,0.15)",
      color: "#06D6A0",
      border: "rgba(6,214,160,0.30)",
    },
    completed: {
      label: "Completed",
      bg: "rgba(6,214,160,0.15)",
      color: "#06D6A0",
      border: "rgba(6,214,160,0.30)",
    },
    rejected: {
      label: "Rejected",
      bg: "rgba(239,68,68,0.12)",
      color: "#ef4444",
      border: "rgba(239,68,68,0.25)",
    },
  }[status];

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderColor: cfg.border,
      }}
    >
      {cfg.label}
    </span>
  );
}

interface RegistrationHistoryTableProps {
  registrations: BusinessRegistration[];
  onViewDetails: (reg: BusinessRegistration) => void;
  onResume: (reg: BusinessRegistration) => void;
  onRequestAudit: (reg: BusinessRegistration) => void;
}

export function RegistrationHistoryTable({
  registrations,
  onViewDetails,
  onResume,
  onRequestAudit,
}: RegistrationHistoryTableProps) {
  if (registrations.length === 0) {
    return (
      <div
        className="rounded-2xl border p-12 flex flex-col items-center gap-3 text-center"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.06)",
          borderStyle: "dashed",
        }}
      >
        <p className="text-sm font-semibold text-white">No registrations yet</p>
        <p className="text-xs" style={{ color: BRAND.muted }}>
          Click &quot;New Registration&quot; above to start your first business
          registration
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {/* Table header */}
      <div
        className="grid grid-cols-[1fr_100px_120px_80px_130px] px-4 py-3 border-b"
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        {["Business", "Country", "Status", "Progress", "Actions"].map((h) => (
          <span
            key={h}
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: BRAND.muted }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {registrations.map((reg) => {
        const progressPct = Math.round(
          (reg.current_step / reg.total_steps) * 100
        );
        const canResume = ["draft", "in_progress"].includes(reg.status);

        return (
          <div
            key={reg.id}
            className="grid grid-cols-[1fr_100px_120px_80px_130px] px-4 py-4 border-b transition-colors duration-150"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255,255,255,0.025)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {/* Business name + structure */}
            <div className="min-w-0 pr-3">
              <div className="text-sm font-medium text-white truncate">
                {reg.business_name}
              </div>
              <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
                {reg.structure}
              </div>
              {reg.reference && (
                <div
                  className="text-[10px] font-mono mt-0.5"
                  style={{ color: BRAND.accent }}
                >
                  Ref: {reg.reference}
                </div>
              )}
            </div>

            {/* Country flag */}
            <div className="flex items-center">
              <span className="text-sm">
                {reg.country === "uk" ? "🇬🇧 UK" : "🇳🇬 Nigeria"}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <RegStatusBadge status={reg.status} />
            </div>

            {/* Progress bar */}
            <div className="flex flex-col justify-center gap-1">
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background:
                      reg.status === "completed"
                        ? BRAND.green
                        : `linear-gradient(to right, ${BRAND.gold}, ${BRAND.accent})`,
                  }}
                />
              </div>
              <span className="text-[10px]" style={{ color: BRAND.muted }}>
                Step {reg.current_step}/{reg.total_steps}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onViewDetails(reg)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: BRAND.muted,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${BRAND.accent}20`;
                  e.currentTarget.style.color = BRAND.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = BRAND.muted;
                }}
                title="View business details"
              >
                <Eye size={13} />
              </button>
              {canResume && (
                <button
                  type="button"
                  onClick={() => onResume(reg)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: BRAND.muted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${BRAND.gold}20`;
                    e.currentTarget.style.color = BRAND.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = BRAND.muted;
                  }}
                  title="Continue application"
                >
                  <RotateCcw size={13} />
                </button>
              )}
              {reg.status === "completed" && reg.reference && (
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200"
                  style={{
                    backgroundColor: `${BRAND.green}10`,
                    borderColor: `${BRAND.green}25`,
                    color: BRAND.green,
                  }}
                  title="View certificate"
                >
                  <ExternalLink size={13} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onRequestAudit(reg)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: BRAND.muted,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${BRAND.gold}20`;
                  e.currentTarget.style.color = BRAND.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = BRAND.muted;
                }}
                title="Request audit"
              >
                <ShieldCheck size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
