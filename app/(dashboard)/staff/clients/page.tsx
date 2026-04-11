"use client";

import React, { useState } from "react";
import { Search, Eye, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { SystemSheet } from "@/components/shared/system-sheet";
import { useGetClientsQuery, ApiClient } from "@/lib/api/clientApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const STATUS_TABS = [
  { label: "All",       value: undefined  },
  { label: "Active",    value: 1          },
  { label: "Pending",   value: 0          },
  { label: "Suspended", value: 2          },
];

function scoreColor(s: number) {
  if (s >= 70) return "#06D6A0";
  if (s >= 40) return "#D4AF37";
  return "#ef4444";
}

function statusStyle(statusValue: number) {
  if (statusValue === 1) return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)",   label: "Active"    };
  if (statusValue === 0) return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)",  label: "Pending"   };
  return                        { color: "#6B7280", bg: "rgba(107,114,128,0.1)", label: "Suspended" };
}

function ScoreRing({ score }: { score: number }) {
  const r = 36, circ = 2 * Math.PI * r, filled = (score / 100) * circ;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="flex-shrink-0">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
      <circle cx="44" cy="44" r={r} fill="none" stroke={scoreColor(score)} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`} strokeDashoffset={circ / 4} />
      <text x="44" y="50" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">{score}</text>
    </svg>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex-shrink-0 mt-0.5" style={{ color: BRAND.muted }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs mb-0.5" style={{ color: BRAND.muted }}>{label}</div>
        <div className="text-sm text-white break-all">{value}</div>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className ?? ""}`} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />;
}

function ClientDetailSheet({ client, onClose }: { client: ApiClient | null; onClose: () => void }) {
  if (!client) return null;
  const ss = statusStyle(client.statusValue);
  return (
    <SystemSheet open={!!client} title={client.businessName} description={`Client profile — ${client.ownerName}`} onClose={onClose} width={480}>
      {/* Score card */}
      <div className="flex items-center gap-5 mb-6 p-4 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <ScoreRing score={client.score} />
        <div className="flex flex-col gap-2">
          <div className="text-white font-bold text-base">{client.businessName}</div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit" style={{ color: ss.color, backgroundColor: ss.bg }}>{ss.label}</span>
          <div className="text-xs" style={{ color: BRAND.muted }}>Compliance Score</div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-2">
        <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: BRAND.muted }}>Contact Information</div>
        <InfoRow icon={<Mail size={14} />} label="Owner" value={client.ownerName} />
        <InfoRow icon={<Mail size={14} />} label="Email" value={client.ownerEmail} />
      </div>

      {/* Assignment */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest mb-1 mt-4" style={{ color: BRAND.muted }}>Assignment</div>
        <InfoRow icon={<Mail size={14} />} label="Joined"         value={client.joinedDateFormatted} />
        <InfoRow icon={<Mail size={14} />} label="Assigned Staff" value={client.assignedStaffName ?? "Unassigned"} />
      </div>
    </SystemSheet>
  );
}

export default function StaffClientsPage() {
  const [search, setSearch]           = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [page, setPage]               = useState(1);
  const [selectedClient, setSelectedClient] = useState<ApiClient | null>(null);

  // Debounce search
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebounced(val); setPage(1); }, 300);
  }

  const { data, isLoading, isFetching } = useGetClientsQuery({
    search: debouncedSearch || undefined,
    status: statusFilter,
    page,
    pageSize: 20,
    sortDesc: true,
  });

  const clients = data?.clients ?? [];

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
          <h1 className="text-2xl font-bold tracking-tight">My Clients</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Businesses assigned to your portfolio.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border max-w-xs flex-1" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color: BRAND.muted }} />
            <input type="text" placeholder="Search clients..." value={search} onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] flex-1" />
          </div>
          <div className="flex gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button key={tab.label} type="button" onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{ backgroundColor: statusFilter === tab.value ? BRAND.gold : "rgba(255,255,255,0.06)", color: statusFilter === tab.value ? BRAND.primary : "rgba(255,255,255,0.6)" }}>
                {tab.label}
              </button>
            ))}
          </div>
          {data && (
            <span className="text-xs ml-auto" style={{ color: BRAND.muted }}>{data.totalCount} clients</span>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Business", "Owner", "Email", "Score", "Status", "Joined", ""].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading || isFetching
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : clients.map((c) => {
                      const ss = statusStyle(c.statusValue);
                      return (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td className="px-5 py-3.5 font-medium">{c.businessName}</td>
                          <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.8)" }}>{c.ownerName}</td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{c.ownerEmail}</td>
                          <td className="px-5 py-3.5 font-bold" style={{ color: scoreColor(c.score) }}>{c.score}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{ss.label}</span>
                          </td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{c.joinedDateFormatted}</td>
                          <td className="px-5 py-3.5">
                            <button type="button" onClick={() => setSelectedClient(c)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white/10"
                              style={{ borderColor: `${BRAND.accent}40`, color: BRAND.accent }}>
                              <Eye size={13} /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                }
                {!isLoading && !isFetching && clients.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No clients found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalCount > 20 && (
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="text-xs" style={{ color: BRAND.muted }}>Page {page} of {data.totalPages}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((p) => p - 1)} disabled={!data.hasPreviousPage}
                  className="p-1.5 rounded-lg border transition-colors hover:bg-white/10 disabled:opacity-30"
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <ChevronLeft size={14} />
                </button>
                <button type="button" onClick={() => setPage((p) => p + 1)} disabled={!data.hasNextPage}
                  className="p-1.5 rounded-lg border transition-colors hover:bg-white/10 disabled:opacity-30"
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <ClientDetailSheet client={selectedClient} onClose={() => setSelectedClient(null)} />
    </div>
  );
}
