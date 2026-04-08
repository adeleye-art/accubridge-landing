"use client";

import React, { useState, useMemo } from "react";
import { Search, Eye, Building2, Mail, Phone, Globe, Briefcase, Hash, FileText } from "lucide-react";
import { SystemSheet } from "@/components/shared/system-sheet";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

interface AssignedClient {
  id: string; business: string; owner: string; email: string; score: number; status: string; since: string;
  country: string; phone: string; registrationNo: string; taxRef: string; companyType: string; industry: string;
}

const ASSIGNED_CLIENTS: AssignedClient[] = [
  { id: "1", business: "Apex Solutions Ltd",  owner: "Jane Okonkwo",  email: "jane@apex.co.uk",      score: 92, status: "Active",  since: "10 Jan 2026", country: "United Kingdom", phone: "+44 20 7946 0958", registrationNo: "12345678",  taxRef: "UTR-2025-001", companyType: "Limited Company",    industry: "Technology" },
  { id: "2", business: "Nova Consulting UK",  owner: "Daniel Obi",    email: "d@nova.co.uk",         score: 78, status: "Active",  since: "20 Feb 2026", country: "United Kingdom", phone: "+44 20 7946 0912", registrationNo: "23456789",  taxRef: "UTR-2025-002", companyType: "Limited Company",    industry: "Consulting" },
  { id: "3", business: "Bright Path Ltd",     owner: "Chidi Eze",     email: "c@brightpath.co.uk",   score: 65, status: "Active",  since: "1 Mar 2026",  country: "United Kingdom", phone: "+44 20 7946 0934", registrationNo: "34567890",  taxRef: "UTR-2025-003", companyType: "Limited Company",    industry: "Education"  },
  { id: "4", business: "TechBridge NG Ltd",   owner: "Ade Adeyemi",   email: "ade@techbridge.ng",    score: 45, status: "Pending", since: "15 Jan 2026", country: "Nigeria",        phone: "+234 802 123 4567", registrationNo: "RC-567890", taxRef: "TIN-2025-004", companyType: "Limited Liability", industry: "Technology" },
  { id: "5", business: "Lagos First Capital", owner: "Emeka Nwosu",   email: "e@lagosfirst.ng",      score: 30, status: "Pending", since: "10 Mar 2026", country: "Nigeria",        phone: "+234 803 987 6543", registrationNo: "RC-678901", taxRef: "TIN-2025-005", companyType: "Limited Liability", industry: "Finance"    },
];

function scoreColor(s: number) {
  if (s >= 70) return "#06D6A0";
  if (s >= 40) return "#D4AF37";
  return "#ef4444";
}

function statusStyle(st: string) {
  if (st === "Active")  return { color: "#06D6A0", bg: "rgba(6,214,160,0.1)"  };
  if (st === "Pending") return { color: "#D4AF37", bg: "rgba(212,175,55,0.1)" };
  return { color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
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

function ClientDetailSheet({ client, onClose }: { client: AssignedClient | null; onClose: () => void }) {
  if (!client) return null;
  const ss = statusStyle(client.status);
  return (
    <SystemSheet open={!!client} title={client.business} description={`Client profile — ${client.owner}`} onClose={onClose} width={520}>
      {/* Score card */}
      <div className="flex items-center gap-5 mb-6 p-4 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <ScoreRing score={client.score} />
        <div className="flex flex-col gap-2">
          <div className="text-white font-bold text-base">{client.business}</div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit" style={{ color: ss.color, backgroundColor: ss.bg }}>{client.status}</span>
          <div className="text-xs" style={{ color: BRAND.muted }}>Compliance Score</div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-2">
        <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: BRAND.muted }}>Contact Information</div>
        <InfoRow icon={<Mail size={14} />}    label="Email"   value={client.email} />
        <InfoRow icon={<Phone size={14} />}   label="Phone"   value={client.phone} />
        <InfoRow icon={<Globe size={14} />}   label="Country" value={client.country} />
      </div>

      {/* Business Details */}
      <div className="mb-2">
        <div className="text-xs font-semibold uppercase tracking-widest mb-1 mt-4" style={{ color: BRAND.muted }}>Business Details</div>
        <InfoRow icon={<Building2 size={14} />} label="Company Type"   value={client.companyType} />
        <InfoRow icon={<Briefcase size={14} />} label="Industry"       value={client.industry} />
        <InfoRow icon={<Hash size={14} />}      label="Reg. Number"    value={client.registrationNo} />
        <InfoRow icon={<FileText size={14} />}  label="Tax Reference"  value={client.taxRef} />
      </div>

      {/* Assignment */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest mb-1 mt-4" style={{ color: BRAND.muted }}>Assignment</div>
        <InfoRow icon={<Building2 size={14} />} label="Assigned Since"    value={client.since} />
        <InfoRow icon={<Briefcase size={14} />} label="Assigned To"       value="You (Staff Accountant)" />
      </div>
    </SystemSheet>
  );
}

export default function StaffClientsPage() {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<AssignedClient | null>(null);

  const filtered = useMemo(() =>
    ASSIGNED_CLIENTS.filter((c) =>
      c.business.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
          <h1 className="text-2xl font-bold tracking-tight">My Clients</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Businesses assigned to your portfolio.</p>
        </div>

        {/* Search + count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border max-w-xs flex-1" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color: BRAND.muted }} />
            <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] flex-1" />
          </div>
          <span className="text-xs" style={{ color: BRAND.muted }}>{filtered.length} assigned</span>
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Business", "Owner", "Email", "Score", "Status", "Assigned Since", ""].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const ss = statusStyle(c.status);
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td className="px-5 py-3.5 font-medium">{c.business}</td>
                      <td className="px-5 py-3.5" style={{ color: "rgba(255,255,255,0.8)" }}>{c.owner}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{c.email}</td>
                      <td className="px-5 py-3.5 font-bold" style={{ color: scoreColor(c.score) }}>{c.score}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: ss.color, backgroundColor: ss.bg }}>{c.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: BRAND.muted }}>{c.since}</td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedClient(c)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white/10"
                          style={{ borderColor: `${BRAND.accent}40`, color: BRAND.accent }}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>No clients match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <ClientDetailSheet client={selectedClient} onClose={() => setSelectedClient(null)} />
    </div>
  );
}
