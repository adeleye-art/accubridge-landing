"use client";

import React, { useState } from "react";
import { Plus, CheckCircle2, Clock, FileText, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/accubridge/shared/page-header";
import { RegistrationHistoryTable } from "./_components/registration-history-table";
import { NewRegistrationSheet } from "./_components/new-registration-sheet";
import { BusinessDetailsSheet } from "./_components/business-details-sheet";
import { BusinessRegistration, RegistrationStatus } from "@/types/accubridge/tools";
import {
  useGetBusinessRegistrationsQuery,
  ApiBusinessRegistration,
} from "@/lib/accubridge/api/businessRegistrationApi";

const BRAND = {
  primary: "#0A2463",
  gold: "#D4AF37",
  green: "#06D6A0",
  accent: "#3E92CC",
  muted: "#6B7280",
};

// ─── Map API response → UI type ───────────────────────────────────────────────

const STATUS_MAP: Record<string, RegistrationStatus> = {
  Draft: "draft",
  Submitted: "pending_review",
  UnderReview: "in_progress",
  Completed: "completed",
  Rejected: "rejected",
  Cancelled: "rejected",
};

function mapApiToUI(reg: ApiBusinessRegistration): BusinessRegistration {
  return {
    id: String(reg.id),
    country: reg.jurisdiction === 1 ? "uk" : "nigeria",
    business_name: reg.businessName || "Untitled Registration",
    structure: reg.structure || "",
    status: STATUS_MAP[reg.status] ?? "draft",
    initiated_at: reg.createdAt?.split("T")[0] ?? "",
    last_updated: reg.updatedAt?.split("T")[0] ?? "",
    reference: reg.referenceNumber,
    estimated_completion: reg.estimatedCompletion,
    current_step: reg.currentStep ?? 1,
    total_steps: 4,
    notes: reg.notes,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegistrationPage() {
  const { data: listData, isLoading, isError } = useGetBusinessRegistrationsQuery({});

  const registrations: BusinessRegistration[] = (listData?.registrations ?? []).map(mapApiToUI);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<BusinessRegistration | null>(null);
  const [viewingReg, setViewingReg] = useState<BusinessRegistration | null>(null);
  const [auditedRegId, setAuditedRegId] = useState<string | null>(null);

  const handleNewComplete = () => {
    setEditingReg(null);
    setSheetOpen(false);
  };

  const handleResume = (reg: BusinessRegistration) => {
    setEditingReg(reg);
    setSheetOpen(true);
  };

  const handleViewDetails = (reg: BusinessRegistration) => {
    setViewingReg(reg);
  };

  const handleRequestAudit = (reg: BusinessRegistration) => {
    setAuditedRegId(reg.id);
    setTimeout(() => setAuditedRegId(null), 3000);
  };

  const completed = registrations.filter((r) => r.status === "completed").length;
  const inProgress = registrations.filter((r) =>
    ["in_progress", "draft", "pending_review"].includes(r.status)
  ).length;
  const total = registrations.length;

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          badge="Tools"
          title="Business Registration"
          description="Register your business with Companies House (UK) or CAC (Nigeria) — guided step-by-step"
          actions={
            <button
              type="button"
              onClick={() => {
                setEditingReg(null);
                setSheetOpen(true);
              }}
              className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#c49b30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = BRAND.gold;
              }}
            >
              <Plus size={15} />
              New Registration
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Total Registrations",
              value: total,
              color: "rgba(255,255,255,0.7)",
              icon: <FileText size={16} />,
            },
            {
              label: "In Progress",
              value: inProgress,
              color: BRAND.gold,
              icon: <Clock size={16} />,
            },
            {
              label: "Completed",
              value: completed,
              color: BRAND.green,
              icon: <CheckCircle2 size={16} />,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border p-4 flex flex-col gap-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-2xl font-bold" style={{ color: s.color }}>
                {isLoading ? "—" : s.value}
              </span>
              <span className="text-xs" style={{ color: BRAND.muted }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* History table */}
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-white font-bold text-base">
              Registration History
            </h3>
            <p className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
              {isLoading ? "Loading…" : `${total} registration${total !== 1 ? "s" : ""}`}
              {!isLoading && (
                <>
                  {" "}·<span style={{ color: BRAND.gold }}> eye</span> = view details ·
                  <span style={{ color: BRAND.gold }}> ↺</span> = continue ·
                  <span style={{ color: BRAND.gold }}> shield</span> = request audit
                </>
              )}
            </p>
          </div>

          {auditedRegId && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl border"
              style={{ backgroundColor: `${BRAND.gold}10`, borderColor: `${BRAND.gold}25` }}
            >
              <CheckCircle2 size={15} style={{ color: BRAND.gold }} />
              <span className="text-sm font-medium" style={{ color: BRAND.gold }}>
                Audit request submitted — our team will review and be in touch.
              </span>
            </div>
          )}

          {isLoading ? (
            <div
              className="rounded-2xl border p-12 flex flex-col items-center gap-3"
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <Loader2 size={24} className="animate-spin" style={{ color: BRAND.muted }} />
              <p className="text-sm" style={{ color: BRAND.muted }}>Loading registrations…</p>
            </div>
          ) : isError ? (
            <div
              className="rounded-2xl border p-12 flex flex-col items-center gap-3"
              style={{
                backgroundColor: "rgba(239,68,68,0.04)",
                borderColor: "rgba(239,68,68,0.15)",
              }}
            >
              <p className="text-sm text-red-400 font-medium">Failed to load registrations</p>
              <p className="text-xs" style={{ color: BRAND.muted }}>
                Please refresh the page or try again later.
              </p>
            </div>
          ) : (
            <RegistrationHistoryTable
              registrations={registrations}
              onViewDetails={handleViewDetails}
              onResume={handleResume}
              onRequestAudit={handleRequestAudit}
            />
          )}
        </div>

        <NewRegistrationSheet
          isOpen={sheetOpen}
          onClose={() => {
            setSheetOpen(false);
            setEditingReg(null);
          }}
          onComplete={handleNewComplete}
          editRegistration={editingReg}
        />

        <BusinessDetailsSheet
          reg={viewingReg}
          onClose={() => setViewingReg(null)}
        />
      </div>
    </div>
  );
}
