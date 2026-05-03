"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, RotateCcw } from "lucide-react";
import type { FundingApplication, FundingType, ApplicationStatus } from "@/types/accubridge/funding";
import { AppStatusBadge, FundingTypeBadge } from "./funding-badges";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };
const softSpring = "cubic-bezier(0.25, 1.1, 0.4, 1)";
const PAGE_SIZE = 8;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  applications: FundingApplication[];
}

function PaginationBtn({ children, onClick, disabled, isActive }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; isActive?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="min-w-[28px] h-7 px-1.5 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200"
      style={{
        backgroundColor: isActive ? BRAND.gold : disabled ? "transparent" : "rgba(255,255,255,0.04)",
        color: isActive ? BRAND.primary : disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
        cursor: disabled ? "not-allowed" : "pointer",
        border: isActive ? "none" : "1px solid rgba(255,255,255,0.08)",
      }}
      onMouseEnter={(e) => { if (!isActive && !disabled) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; }}
      onMouseLeave={(e) => { if (!isActive && !disabled) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
    >
      {children}
    </button>
  );
}

export function ViewAllModal({ isOpen, onClose, applications }: Props) {
  const [currentPage, setCurrentPage]   = useState(1);
  const [filterType, setFilterType]     = useState<FundingType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">("all");

  useEffect(() => { setCurrentPage(1); }, [filterType, filterStatus]);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const filtered = applications.filter((a) => {
    if (filterType !== "all" && a.type !== filterType) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!isOpen) return null;

  const selectStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.8)",
    colorScheme: "dark",
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(10,36,99,0.75)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #0f1e3a 0%, #0D0D0D 100%)",
            borderColor: "rgba(255,255,255,0.1)",
            animation: `modalIn 0.35s ${softSpring} forwards`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 rounded-full" style={{ backgroundColor: BRAND.gold }} />
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">All Funding Applications</h2>
                <p className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
                  {filtered.length} of {applications.length} showing
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200"
              style={{ color: BRAND.muted }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = BRAND.muted; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b flex-shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)" }}>
            <Filter size={13} style={{ color: BRAND.muted }} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as FundingType | "all")}
              className="h-8 px-3 rounded-lg text-xs border outline-none appearance-none cursor-pointer" style={selectStyle}>
              <option value="all" style={{ backgroundColor: "#0f1e3a" }}>All Types</option>
              <option value="raffle" style={{ backgroundColor: "#0f1e3a" }}>Raffle</option>
              <option value="compliance" style={{ backgroundColor: "#0f1e3a" }}>Compliance</option>
              <option value="investor" style={{ backgroundColor: "#0f1e3a" }}>Investor Pitch</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | "all")}
              className="h-8 px-3 rounded-lg text-xs border outline-none appearance-none cursor-pointer" style={selectStyle}>
              <option value="all" style={{ backgroundColor: "#0f1e3a" }}>All Statuses</option>
              <option value="entered" style={{ backgroundColor: "#0f1e3a" }}>Entered</option>
              <option value="pending" style={{ backgroundColor: "#0f1e3a" }}>Pending</option>
              <option value="under_review" style={{ backgroundColor: "#0f1e3a" }}>In Review</option>
              <option value="approved" style={{ backgroundColor: "#0f1e3a" }}>Approved</option>
              <option value="rejected" style={{ backgroundColor: "#0f1e3a" }}>Rejected</option>
            </select>
            {(filterType !== "all" || filterStatus !== "all") && (
              <button type="button" onClick={() => { setFilterType("all"); setFilterStatus("all"); }}
                className="flex items-center gap-1 text-xs transition-colors duration-200"
                style={{ color: BRAND.accent }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = BRAND.accent; }}>
                <RotateCcw size={11} />Reset
              </button>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse" style={{ minWidth: "640px" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 10 }}>
                  {[{ label: "Application", w: "auto" }, { label: "Reference", w: "130px" }, { label: "Type", w: "110px" }, { label: "Amount", w: "110px" }, { label: "Status", w: "130px" }, { label: "Date", w: "100px" }].map((col) => (
                    <th key={col.label} className="px-4 py-3 text-left" style={{ width: col.w }}>
                      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>{col.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <p className="text-sm" style={{ color: BRAND.muted }}>No applications match the selected filters</p>
                    </td>
                  </tr>
                ) : paged.map((app) => (
                  <tr key={app.id} className="transition-colors duration-150"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.025)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white">{app.title}</div>
                      {app.notes && <div className="text-[11px] mt-0.5 truncate max-w-[220px]" style={{ color: BRAND.muted }}>{app.notes}</div>}
                      {app.raffle_id && <div className="text-[10px] font-mono mt-0.5" style={{ color: BRAND.gold }}>ID: {app.raffle_id} · #{app.raffle_number}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>{app.reference ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3"><FundingTypeBadge type={app.type} /></td>
                    <td className="px-4 py-3">
                      {app.amount_awarded ? (
                        <span className="text-sm font-bold" style={{ color: BRAND.green }}>£{app.amount_awarded.toLocaleString("en-GB")}</span>
                      ) : app.amount_requested ? (
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>£{app.amount_requested.toLocaleString("en-GB")}</span>
                      ) : app.entry_fee ? (
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>£{app.entry_fee} fee</span>
                      ) : (
                        <span style={{ color: BRAND.muted }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><AppStatusBadge status={app.status} /></td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: BRAND.muted }}>
                        {new Date(app.submitted_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t flex-shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.02)" }}>
            <span className="text-xs" style={{ color: BRAND.muted }}>
              {filtered.length === 0 ? "No records" : `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-1">
              <PaginationBtn onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft size={13} /></PaginationBtn>
              <PaginationBtn onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}><ChevronLeft size={13} /></PaginationBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(p); return acc;
                }, [])
                .map((p, i) => p === "…" ? (
                  <span key={`dot-${i}`} className="w-7 text-center text-xs" style={{ color: BRAND.muted }}>…</span>
                ) : (
                  <PaginationBtn key={p} onClick={() => setCurrentPage(p as number)} isActive={p === currentPage}>{p}</PaginationBtn>
                ))}
              <PaginationBtn onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}><ChevronRight size={13} /></PaginationBtn>
              <PaginationBtn onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight size={13} /></PaginationBtn>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
