"use client";

import React, { useState, useRef, useEffect } from "react";
import { SystemSheet } from "@/components/accubridge/shared/system-sheet";
import {
  CheckCircle2, Loader2, Check, AlertCircle, RefreshCw,
  Upload, ShieldCheck, FileText, Plus, Trash2, Link2, X, Search,
} from "lucide-react";
import {
  useSubmitKybMultiEntryMutation,
  useFixLegalNameMutation,
  useUploadComplianceDocumentMutation,
  useResolveAlertMutation,
  useResolveAllAlertsMutation,
  useConnectBankMutation,
  useConnectTaxMutation,
  ComplianceCentreAlert,
  AmlReport,
  OperatingHistoryResponse,
} from "@/lib/accubridge/api/complianceCentreApi";
import {
  useLazySearchCompaniesQuery,
  useLazyGetCompanyOfficersQuery,
  CompanySearchItem,
} from "@/lib/accubridge/api/companiesHouseApi";
import { useLazyGetHmrcAuthorizeUrlQuery } from "@/lib/accubridge/api/hmrcApi";
import { useToast } from "@/components/accubridge/shared/toast";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };
const inputBase =
  "w-full h-11 px-4 rounded-xl text-sm text-white border outline-none transition-all duration-200 placeholder-[#6B7280]";
const inputStyle = { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" };

function onFocusIn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = "rgba(62,146,204,0.6)";
  e.target.style.boxShadow = "0 0 0 3px rgba(62,146,204,0.12)";
}
function onFocusOut(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = "rgba(255,255,255,0.1)";
  e.target.style.boxShadow = "none";
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>
      {children}
      {required && <span style={{ color: BRAND.gold }}> *</span>}
    </label>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: BRAND.accent }}>
      {label}
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TRANSACTIONS = [
  { id: "t1", date: "03 Apr", desc: "Stripe Payout", amount: "+£2,340.00", credit: true },
  { id: "t2", date: "02 Apr", desc: "AWS Invoice #5521", amount: "-£134.50", credit: false },
  { id: "t3", date: "01 Apr", desc: "Office Supplies – Staples", amount: "-£47.20", credit: false },
  { id: "t4", date: "31 Mar", desc: "Client Payment – Orbit Co.", amount: "+£5,000.00", credit: true },
  { id: "t5", date: "30 Mar", desc: "HMRC PAYE", amount: "-£1,200.00", credit: false },
];

const MOCK_UNCAT = [
  { id: "c1", desc: "AWS Cloud Services", amount: "-£134.50" },
  { id: "c2", desc: "Stripe Payout", amount: "+£2,340.00" },
  { id: "c3", desc: "Office Supplies – Staples", amount: "-£47.20" },
  { id: "c4", desc: "Freelancer – Dev Contract", amount: "-£800.00" },
  { id: "c5", desc: "Client Invoice #1042", amount: "+£3,500.00" },
  { id: "c6", desc: "Business Travel – Rail", amount: "-£89.00" },
];

const CATEGORIES = ["Revenue", "Operating Cost", "Payroll", "Tax", "Travel", "Other"];

const MOCK_ALERTS = [
  {
    id: "al1",
    title: "VAT Return Overdue",
    detail:
      "Your Q1 2026 VAT return was due 31 March 2026. Complete and submit to HMRC to clear this alert.",
    daysOpen: 6,
  },
  {
    id: "al2",
    title: "Director ID Expiring Soon",
    detail:
      "Your director's passport expires in 18 days. Upload a renewed document to avoid a score penalty.",
    daysOpen: 14,
  },
];

// ─── KYB Form ─────────────────────────────────────────────────────────────────

interface DirectorEntry {
  id: string;
  name: string;
}

interface KYBFormData {
  jurisdiction: string;
  companiesHouseNumber: string;
  submittedLegalName: string;
  directorsJson: string;
  certificateOfIncorporationUrl: string;
}

function KYBForm({ onSubmit }: { onSubmit: (data: KYBFormData) => void }) {
  const [country, setCountry] = useState<"uk" | "ng">("uk");
  const [regNumber, setRegNumber] = useState("");
  const [legalName, setLegalName] = useState("");
  const [directors, setDirectors] = useState<DirectorEntry[]>([{ id: "d1", name: "" }]);
  const [certFile, setCertFile] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Companies House search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CompanySearchItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [triggerSearch] = useLazySearchCompaniesQuery();
  const [triggerGetOfficers] = useLazyGetCompanyOfficersQuery();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search — only fires for UK when ≥3 chars
  useEffect(() => {
    if (country !== "uk" || searchQuery.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await triggerSearch(searchQuery).unwrap();
        setSearchResults(result.items ?? []);
        setShowDropdown((result.items?.length ?? 0) > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, country, triggerSearch]);

  const handleSelectCompany = async (item: CompanySearchItem) => {
    setRegNumber(item.companyNumber);
    setLegalName(item.companyName);
    setSearchQuery(item.companyName);
    setShowDropdown(false);
    setSearchResults([]);
    // Pre-fill directors from Companies House officers (best-effort)
    try {
      const officersResult = await triggerGetOfficers(item.companyNumber).unwrap();
      if (officersResult.officers?.length > 0) {
        setDirectors(
          officersResult.officers.map((o, i) => ({ id: `d${i}`, name: o.name }))
        );
      }
    } catch {
      // Non-critical — leave directors as-is
    }
  };

  const addDirector = () => {
    setDirectors((prev) => [...prev, { id: `d${Date.now()}`, name: "" }]);
  };

  const removeDirector = (id: string) => {
    if (directors.length > 1) {
      setDirectors((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const updateDirector = (id: string, name: string) => {
    setDirectors((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!regNumber.trim()) e.regNumber = "Required";
    if (!legalName.trim()) e.legalName = "Required";
    if (directors.some((d) => !d.name.trim())) e.directors = "All directors must have names";
    if (!certFile) e.certFile = "Please upload your Certificate of Incorporation";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.accent}08`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
      >
        🏢 KYB verifies your legal entity against official government records.
        Verification is processed via Sumsub and typically completes within 1 business day.
      </div>

      {/* Jurisdiction */}
      <div className="flex flex-col gap-2">
        <SectionHeading label="Business Jurisdiction" />
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["uk", "🇬🇧", "United Kingdom", "Companies House"] as const,
              ["ng", "🇳🇬", "Nigeria", "CAC Registry"] as const,
            ]
          ).map(([val, flag, label, sub]) => (
            <button
              key={val}
              type="button"
              onClick={() => { setCountry(val); setSearchQuery(""); setRegNumber(""); setLegalName(""); setSearchResults([]); setShowDropdown(false); }}
              className="rounded-xl border p-4 flex flex-col gap-1 transition-all duration-200 text-left"
              style={{
                backgroundColor: country === val ? `${BRAND.accent}12` : "rgba(255,255,255,0.04)",
                borderColor: country === val ? `${BRAND.accent}50` : "rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-xl">{flag}</span>
              <span className="text-sm font-bold text-white">{label}</span>
              <span className="text-[10px]" style={{ color: BRAND.muted }}>{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Registration number — searchable combobox for UK, plain input for NG */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel required>
          {country === "uk" ? "Companies House Number" : "CAC Registration Number"}
        </FieldLabel>

        {country === "uk" ? (
          <div className="relative" ref={dropdownRef}>
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by company name or number (min. 3 chars)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // If user clears the field, also clear selected value
                  if (!e.target.value) { setRegNumber(""); setLegalName(""); }
                }}
                className={inputBase}
                style={{
                  ...inputStyle,
                  paddingLeft: "2.75rem",
                  borderColor: errors.regNumber ? "#ef4444" : "rgba(255,255,255,0.1)",
                }}
                onFocus={(e) => { onFocusIn(e); if (searchResults.length > 0) setShowDropdown(true); }}
                onBlur={onFocusOut}
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                {isSearching
                  ? <Loader2 size={15} className="animate-spin" style={{ color: BRAND.muted }} />
                  : <Search size={15} style={{ color: BRAND.muted }} />}
              </div>
            </div>

            {/* Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div
                className="absolute z-50 w-full mt-1 rounded-xl border overflow-hidden shadow-xl"
                style={{ backgroundColor: "#0f1e3a", borderColor: "rgba(255,255,255,0.12)" }}
              >
                {searchResults.slice(0, 6).map((item) => (
                  <button
                    key={item.companyNumber}
                    type="button"
                    onMouseDown={() => handleSelectCompany(item)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors duration-150"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(62,146,204,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{item.companyName}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: BRAND.muted }}>
                        {item.companyNumber} · {item.companyStatus}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: item.companyStatus === "active" ? `${BRAND.green}15` : "rgba(255,255,255,0.08)",
                        color: item.companyStatus === "active" ? BRAND.green : BRAND.muted,
                      }}
                    >
                      {item.companyStatus}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected company number chip */}
            {regNumber && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                  style={{ backgroundColor: `${BRAND.green}10`, borderColor: `${BRAND.green}25`, color: BRAND.green }}
                >
                  <CheckCircle2 size={12} />
                  {regNumber}
                </div>
                <button
                  type="button"
                  onClick={() => { setRegNumber(""); setLegalName(""); setSearchQuery(""); }}
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <input
            type="text"
            placeholder="e.g. RC-1234567"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            className={inputBase}
            style={{ ...inputStyle, borderColor: errors.regNumber ? "#ef4444" : "rgba(255,255,255,0.1)" }}
            onFocus={onFocusIn}
            onBlur={onFocusOut}
          />
        )}
        {errors.regNumber && <span className="text-xs text-red-400">{errors.regNumber}</span>}
      </div>

      {/* Legal Name */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel required>Legal Business Name</FieldLabel>
        <input
          type="text"
          placeholder="Enter your registered legal business name"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          className={inputBase}
          style={{ ...inputStyle, borderColor: errors.legalName ? "#ef4444" : "rgba(255,255,255,0.1)" }}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
        />
        {errors.legalName && <span className="text-xs text-red-400">{errors.legalName}</span>}
        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Submit the official registered business name from {country === "uk" ? "Companies House" : "CAC"}
        </span>
      </div>

      {/* Directors */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <FieldLabel required>Authorised Directors / Signatories</FieldLabel>
          <button
            type="button"
            onClick={addDirector}
            className="text-xs font-semibold px-3 h-8 rounded-lg border transition-all duration-200 flex items-center gap-1"
            style={{ backgroundColor: `${BRAND.accent}10`, borderColor: `${BRAND.accent}25`, color: BRAND.accent }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}20`; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}10`; }}
          >
            <Plus size={13} />Add Director
          </button>
        </div>
        {errors.directors && <span className="text-xs text-red-400">{errors.directors}</span>}
        <div className="flex flex-col gap-2">
          {directors.map((director, idx) => (
            <div key={director.id} className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={idx === 0 ? "Primary director name" : "Additional director name"}
                  value={director.name}
                  onChange={(e) => updateDirector(director.id, e.target.value)}
                  className={inputBase}
                  style={inputStyle}
                  onFocus={onFocusIn}
                  onBlur={onFocusOut}
                />
              </div>
              {directors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDirector(director.id)}
                  className="h-11 px-3 rounded-xl border transition-all duration-200 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"; }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certificate upload */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel required>Certificate of Incorporation</FieldLabel>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-3 transition-all duration-200"
          style={{
            borderColor: errors.certFile ? "#ef4444" : certFile ? `${BRAND.green}40` : "rgba(255,255,255,0.12)",
            backgroundColor: certFile ? `${BRAND.green}06` : "rgba(255,255,255,0.02)",
          }}
        >
          {certFile ? (
            <>
              <CheckCircle2 size={24} style={{ color: BRAND.green }} />
              <span className="text-sm font-medium" style={{ color: BRAND.green }}>{certFile}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Click to replace</span>
            </>
          ) : (
            <>
              <Upload size={24} style={{ color: BRAND.accent }} />
              <div className="text-sm font-semibold text-white">Upload Certificate of Incorporation</div>
              <div className="text-xs" style={{ color: BRAND.muted }}>PDF, JPG, PNG · Max 10 MB</div>
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setCertFile(f.name);
          }}
        />
        {errors.certFile && <span className="text-xs text-red-400">{errors.certFile}</span>}
      </div>

      <button
        type="button"
        onClick={() => {
          if (validate()) {
            onSubmit({
              jurisdiction: country === "uk" ? "GB" : "NG",
              companiesHouseNumber: regNumber.trim(),
              submittedLegalName: legalName.trim(),
              directorsJson: JSON.stringify(directors.map((d) => d.name.trim())),
              certificateOfIncorporationUrl: certFile,
            });
          }
        }}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.accent, color: "#fff" }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <ShieldCheck size={15} />Submit for KYB Verification
      </button>
    </div>
  );
}

// ─── Name Match Form ──────────────────────────────────────────────────────────

function NameMatchForm({ onSubmit }: { onSubmit: (correctedName: string) => void }) {
  const [corrected, setCorrected] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!corrected.trim()) { setError("Please enter the corrected business name"); return; }
    setError("");
    onSubmit(corrected.trim());
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)", color: "rgba(255,255,255,0.55)" }}
      >
        ⚠️ Your submitted name does not match the official Companies House record. Update it below to
        confirm the correct legal name and unlock your registration score.
      </div>

      {/* Submitted name — error state */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Name Currently Submitted</FieldLabel>
        <div
          className="h-11 px-4 flex items-center rounded-xl border text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.25)", color: "#f87171" }}
        >
          Apex Solutions Ltd
        </div>
        <span className="text-xs" style={{ color: "rgba(239,68,68,0.7)" }}>⚠ Does not match official record</span>
      </div>

      {/* Official record — success state */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Official Companies House Record</FieldLabel>
        <div
          className="h-11 px-4 flex items-center rounded-xl border text-sm"
          style={{ backgroundColor: `${BRAND.green}06`, borderColor: `${BRAND.green}25`, color: BRAND.green }}
        >
          Apex Solutions Limited
        </div>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          Source: Companies House REST API · verified 01 Apr 2026
        </span>
      </div>

      {/* Correction input */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel required>Enter Corrected Business Name</FieldLabel>
        <input
          type="text"
          placeholder="Must match Companies House exactly"
          value={corrected}
          onChange={(e) => setCorrected(e.target.value)}
          className={inputBase}
          style={{ ...inputStyle, borderColor: error ? "#ef4444" : "rgba(255,255,255,0.1)" }}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
        />
        {error
          ? <span className="text-xs text-red-400">{error}</span>
          : <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              Tip: type &quot;Apex Solutions Limited&quot; to match the official record.
            </span>}
      </div>

      <button
        type="button"
        onClick={() => handleSubmit()}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <Check size={15} />Confirm Name Update
      </button>
    </div>
  );
}

// ─── Registration Number Form ─────────────────────────────────────────────────

function RegistrationNumberForm({ onSubmit }: { onSubmit: () => void }) {
  const [number, setNumber] = useState("");
  const [country, setCountry] = useState<"uk" | "ng">("uk");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!number.trim()) {
      setError(country === "uk" ? "Please enter your Companies House number" : "Please enter your CAC registration number");
      return;
    }
    setError("");
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.accent}06`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
      >
        🔍 Enter your business registration number so we can verify your entity details against official government records.
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel required>Country</FieldLabel>
        <select
          value={country}
          onChange={(e) => { setCountry(e.target.value as "uk" | "ng"); setError(""); }}
          className={inputBase}
          style={inputStyle}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
        >
          <option value="uk">🇬🇧 United Kingdom (Companies House)</option>
          <option value="ng">🇳🇬 Nigeria (CAC)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel required>{country === "uk" ? "Companies House Number" : "CAC Registration Number"}</FieldLabel>
        <input
          type="text"
          placeholder={country === "uk" ? "e.g., 12345678" : "e.g., BN1234567"}
          value={number}
          onChange={(e) => { setNumber(e.target.value); setError(""); }}
          className={inputBase}
          style={{ ...inputStyle, borderColor: error ? "#ef4444" : "rgba(255,255,255,0.1)" }}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <Check size={15} />Verify Registration Number
      </button>
    </div>
  );
}

// ─── Entity Status Form ────────────────────────────────────────────────────────

function EntityStatusForm({ onSubmit }: { onSubmit: () => void }) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!status) {
      setError("Please select an entity status");
      return;
    }
    setError("");
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.green}06`, borderColor: `${BRAND.green}20`, color: "rgba(255,255,255,0.55)" }}
      >
        ✓ Confirm your business entity is active and in good standing with the relevant authority.
      </div>

      <div className="flex flex-col gap-3">
        {["Active", "Active - In Good Standing", "Dormant", "Dissolved", "Other"].map((opt) => (
          <label
            key={opt}
            onClick={() => { setStatus(opt); setError(""); }}
            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: status === opt ? `${BRAND.green}12` : "rgba(255,255,255,0.03)",
              borderColor: status === opt ? BRAND.green : "rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="w-4 h-4 rounded border flex items-center justify-center"
              style={{
                backgroundColor: status === opt ? BRAND.green : "rgba(255,255,255,0.1)",
                borderColor: status === opt ? BRAND.green : "rgba(255,255,255,0.2)",
              }}
            >
              {status === opt && <Check size={12} style={{ color: BRAND.primary }} />}
            </div>
            <span className="text-sm text-white">{opt}</span>
          </label>
        ))}
      </div>

      {error && <span className="text-xs text-red-400">{error}</span>}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <Check size={15} />Confirm Entity Status
      </button>
    </div>
  );
}

// ─── Business Profile Form ────────────────────────────────────────────────────

function BusinessProfileForm({ onSubmit }: { onSubmit: () => void }) {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [type, setType] = useState("");
  const [country, setCountry] = useState("uk");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!businessName.trim() || !industry || !type || !country) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.accent}06`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
      >
        📋 Complete your business profile with name, industry, type, and operating country.
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel required>Business Name</FieldLabel>
        <input
          type="text"
          placeholder="e.g., Apex Solutions Ltd"
          value={businessName}
          onChange={(e) => { setBusinessName(e.target.value); setError(""); }}
          className={inputBase}
          style={inputStyle}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel required>Industry</FieldLabel>
        <select
          value={industry}
          onChange={(e) => { setIndustry(e.target.value); setError(""); }}
          className={inputBase}
          style={inputStyle}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
        >
          <option value="">Select an industry</option>
          <option value="technology">Technology</option>
          <option value="finance">Finance</option>
          <option value="retail">Retail</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="professional">Professional Services</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel required>Business Type</FieldLabel>
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setError(""); }}
          className={inputBase}
          style={inputStyle}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
        >
          <option value="">Select a business type</option>
          <option value="sole">Sole Trader</option>
          <option value="partnership">Partnership</option>
          <option value="llc">Private Limited Company</option>
          <option value="public">Public Limited Company</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel required>Operating Country</FieldLabel>
        <select
          value={country}
          onChange={(e) => { setCountry(e.target.value); setError(""); }}
          className={inputBase}
          style={inputStyle}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
        >
          <option value="uk">🇬🇧 United Kingdom</option>
          <option value="ng">🇳🇬 Nigeria</option>
        </select>
      </div>

      {error && <span className="text-xs text-red-400">{error}</span>}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <Check size={15} />Save Business Profile
      </button>
    </div>
  );
}

// ─── Tax ID Form ──────────────────────────────────────────────────────────────

function TaxIDForm({ onSubmit }: { onSubmit: () => void }) {
  const [taxID, setTaxID] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!taxID.trim()) {
      setError("Please enter your tax ID (UTR)");
      return;
    }
    setError("");
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.accent}06`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
      >
        🔢 Enter your Unique Taxpayer Reference (UTR) to enable tax verification and synchronization.
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel required>Tax ID (UTR)</FieldLabel>
        <input
          type="text"
          placeholder="e.g., 1234567890"
          value={taxID}
          onChange={(e) => { setTaxID(e.target.value); setError(""); }}
          className={inputBase}
          style={{ ...inputStyle, borderColor: error ? "#ef4444" : "rgba(255,255,255,0.1)" }}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <Check size={15} />Submit Tax ID
      </button>
    </div>
  );
}

// ─── VAT Setup Form ───────────────────────────────────────────────────────────

function VATSetupForm({ onSubmit }: { onSubmit: () => void }) {
  const [vatRegistered, setVATRegistered] = useState<"yes" | "no" | "">("");
  const [payrollSetup, setPayrollSetup] = useState<"yes" | "no" | "">("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!vatRegistered || !payrollSetup) {
      setError("Please answer all questions");
      return;
    }
    setError("");
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.accent}06`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
      >
        📋 Declare your VAT registration and payroll setup status to complete tax verification.
      </div>

      <div className="flex flex-col gap-3">
        <FieldLabel required>Are you VAT registered?</FieldLabel>
        <div className="flex gap-3">
          {(["yes", "no"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { setVATRegistered(opt); setError(""); }}
              className="flex-1 h-10 rounded-lg border font-medium transition-all duration-200"
              style={{
                backgroundColor: vatRegistered === opt ? `${BRAND.green}15` : "rgba(255,255,255,0.03)",
                borderColor: vatRegistered === opt ? BRAND.green : "rgba(255,255,255,0.1)",
                color: vatRegistered === opt ? BRAND.green : "rgba(255,255,255,0.7)",
              }}
            >
              {opt === "yes" ? "Yes" : "No"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <FieldLabel required>Do you have active payroll?</FieldLabel>
        <div className="flex gap-3">
          {(["yes", "no"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { setPayrollSetup(opt); setError(""); }}
              className="flex-1 h-10 rounded-lg border font-medium transition-all duration-200"
              style={{
                backgroundColor: payrollSetup === opt ? `${BRAND.green}15` : "rgba(255,255,255,0.03)",
                borderColor: payrollSetup === opt ? BRAND.green : "rgba(255,255,255,0.1)",
                color: payrollSetup === opt ? BRAND.green : "rgba(255,255,255,0.7)",
              }}
            >
              {opt === "yes" ? "Yes" : "No"}
            </button>
          ))}
        </div>
      </div>

      {error && <span className="text-xs text-red-400">{error}</span>}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <Check size={15} />Save VAT & Payroll Status
      </button>
    </div>
  );
}

// ─── Tax Authority Toggle ─────────────────────────────────────────────────────

function TaxAuthorityToggle({
  value, onChange,
}: { value: "HMRC" | "FIRS"; onChange: (v: "HMRC" | "FIRS") => void }) {
  const options = [
    { id: "HMRC" as const, flag: "🇬🇧", label: "HMRC", sub: "United Kingdom" },
    { id: "FIRS" as const, flag: "🇳🇬", label: "FIRS", sub: "Nigeria" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200"
            style={{
              backgroundColor: active ? `${BRAND.accent}15` : "rgba(255,255,255,0.04)",
              borderColor: active ? `${BRAND.accent}50` : "rgba(255,255,255,0.08)",
            }}
          >
            <span className="text-xl">{o.flag}</span>
            <div className="text-left">
              <div className="text-sm font-bold text-white">{o.label}</div>
              <div className="text-[11px]" style={{ color: BRAND.muted }}>{o.sub}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── HMRC / FIRS Connect Form ─────────────────────────────────────────────────

function HMRCConnectForm({ onSubmit }: { onSubmit: () => void }) {
  const [authority, setAuthority] = useState<"HMRC" | "FIRS">("HMRC");
  const [vatNumber, setVatNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectTax] = useConnectTaxMutation();
  const [triggerGetHmrcAuthorizeUrl] = useLazyGetHmrcAuthorizeUrlQuery();
  const { toast } = useToast();

  const isHMRC = authority === "HMRC";

  const handleConnect = async () => {
    setLoading(true);
    try {
      if (authority === "HMRC") {
        // Real OAuth flow: get HMRC authorization URL then redirect the browser
        const state = btoa(JSON.stringify({
          redirectTo: "/hmrc/callback",
          vatNumber: vatNumber.trim() || null,
          nonce: Math.random().toString(36).slice(2),
        }));
        const { authorizationUrl } = await triggerGetHmrcAuthorizeUrl(state).unwrap();
        window.location.href = authorizationUrl;
        // Page is navigating away — do not call setLoading(false) or onSubmit
      } else {
        // FIRS: direct POST (no OAuth defined for FIRS in the API)
        await connectTax({
          provider: "FIRS",
          jurisdiction: "NG",
          vatNumber: vatNumber.trim() || undefined,
        }).unwrap();
        onSubmit();
        setLoading(false);
      }
    } catch {
      toast({ title: `Failed to connect ${isHMRC ? "HMRC" : "FIRS"}. Please try again.`, variant: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <FieldLabel>Tax Authority</FieldLabel>
      <TaxAuthorityToggle value={authority} onChange={setAuthority} />

      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.green}06`, borderColor: `${BRAND.green}20`, color: "rgba(255,255,255,0.55)" }}
      >
        {isHMRC
          ? "🔗 Connect your HMRC account to automatically retrieve UK VAT obligations and filing deadlines."
          : "🔗 Connect your FIRS account to automatically retrieve Nigerian tax obligations and filing deadlines."}
      </div>

      {/* VAT number — optional for both providers */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>VAT Number <span style={{ color: BRAND.muted, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></FieldLabel>
        <input
          type="text"
          placeholder={isHMRC ? "e.g. GB123456789" : "e.g. 12345678-0001"}
          value={vatNumber}
          onChange={(e) => setVatNumber(e.target.value)}
          className={inputBase}
          style={inputStyle}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
        />
        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          {isHMRC ? "Speeds up obligation lookup once connected" : "Your FIRS TIN or VAT registration number"}
        </span>
      </div>

      {isHMRC && (
        <div
          className="rounded-xl border p-4 text-xs leading-relaxed"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <strong>Next step:</strong> You&apos;ll be redirected to HMRC to authorise access. Once authorised, you&apos;ll be returned here automatically.
        </div>
      )}

      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
        {loading ? (isHMRC ? "Redirecting to HMRC…" : "Connecting…") : `Connect to ${isHMRC ? "HMRC" : "FIRS"}`}
      </button>
    </div>
  );
}

// ─── HMRC / FIRS Sync Form ────────────────────────────────────────────────────

function HMRCSyncForm({ onSubmit }: { onSubmit: () => void }) {
  const [authority, setAuthority] = useState<"HMRC" | "FIRS">("HMRC");
  const [loading, setLoading] = useState(false);
  const [connectTax] = useConnectTaxMutation();
  const { toast } = useToast();

  const handleSync = async () => {
    setLoading(true);
    try {
      await connectTax({
        provider: authority,
        jurisdiction: authority === "HMRC" ? "GB" : "NG",
      }).unwrap();
      onSubmit();
    } catch (error) {
      toast({ title: "Failed to sync tax data. Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <FieldLabel>Tax Authority</FieldLabel>
      <TaxAuthorityToggle value={authority} onChange={setAuthority} />

      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.green}06`, borderColor: `${BRAND.green}20`, color: "rgba(255,255,255,0.55)" }}
      >
        {authority === "HMRC"
          ? "✓ Syncing your latest VAT and payroll obligations from HMRC. This may take a few moments."
          : "✓ Syncing your latest tax obligations from FIRS. This may take a few moments."}
      </div>

      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
        {loading ? "Syncing..." : `Sync from ${authority === "HMRC" ? "HMRC" : "FIRS"}`}
      </button>
    </div>
  );
}

// ─── Bank Connect Form ────────────────────────────────────────────────────────

function BankConnectForm({ onSubmit }: { onSubmit: () => void }) {
  const [tab, setTab] = useState<"bank" | "statement">("bank");
  const [selectedProvider, setSelectedProvider] = useState<"TrueLayer" | "Mono">("TrueLayer");
  const [statementFile, setStatementFile] = useState<File | null>(null);
  const [statementError, setStatementError] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectBank] = useConnectBankMutation();
  const { toast } = useToast();

  const handleBankConnect = async () => {
    setLoading(true);
    try {
      await connectBank({
        provider: selectedProvider,
        jurisdiction: selectedProvider === "TrueLayer" ? "GB" : "NG",
      }).unwrap();
      onSubmit();
    } catch (error) {
      toast({ title: "Failed to connect bank account. Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatementSubmit = () => {
    if (!statementFile) {
      setStatementError("Please select a file to upload");
      return;
    }
    setStatementError("");
    onSubmit();
  };

  const providers = [
    { id: "TrueLayer" as const, name: "TrueLayer", desc: "🇬🇧 UK banks — Barclays, HSBC, Monzo, Lloyds +60 more", flag: "🇬🇧", color: BRAND.accent },
    { id: "Mono" as const, name: "Mono", desc: "🇳🇬 Nigerian banks — GTBank, Access, Zenith +30 more", flag: "🇳🇬", color: BRAND.green },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {[
          { value: "bank" as const, label: "Link Bank Account" },
          { value: "statement" as const, label: "Upload Statement" },
        ].map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setTab(t.value);
              setStatementError("");
            }}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200"
            style={{
              color: tab === t.value ? BRAND.accent : "rgba(255,255,255,0.5)",
              borderColor: tab === t.value ? BRAND.accent : "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bank Account Tab */}
      {tab === "bank" && (
        <div className="flex flex-col gap-5">
          <div
            className="rounded-xl border p-4 text-xs leading-relaxed"
            style={{ backgroundColor: `${BRAND.green}06`, borderColor: `${BRAND.green}20`, color: "rgba(255,255,255,0.55)" }}
          >
            🔗 Connect your bank account via TrueLayer (UK) or Mono (Nigeria) for real-time transaction sync.
          </div>

          <div
            className="rounded-xl border p-4 text-xs leading-relaxed"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <strong>Next step:</strong> Click the button below to authorize access to your bank account. You'll be redirected to your bank's secure login.
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel required>Select Bank Provider</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => setSelectedProvider(provider.id)}
                  className="rounded-xl border p-4 flex flex-col gap-2 transition-all duration-200 text-left"
                  style={{
                    backgroundColor: selectedProvider === provider.id ? `${provider.color}12` : "rgba(255,255,255,0.04)",
                    borderColor: selectedProvider === provider.id ? `${provider.color}50` : "rgba(255,255,255,0.08)",
                  }}
                >
                  <span className="text-lg font-bold text-white">{provider.name}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{provider.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleBankConnect}
            disabled={loading}
            className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
            style={{ backgroundColor: BRAND.accent, color: "white" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
            {loading ? "Connecting..." : "Connect Bank Account"}
          </button>
        </div>
      )}

      {/* Statement Upload Tab */}
      {tab === "statement" && (
        <div className="flex flex-col gap-5">
          <div
            className="rounded-xl border p-4 text-xs leading-relaxed"
            style={{ backgroundColor: `${BRAND.accent}06`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
          >
            📤 Upload a bank statement (CSV, OFX, or PDF) to manually import your transactions.
          </div>

          <div
            className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200"
            style={{ borderColor: statementError ? "#ef4444" : `${BRAND.accent}30`, backgroundColor: statementError ? "rgba(239,68,68,0.06)" : `${BRAND.accent}06` }}
            onClick={() => document.getElementById("bank-statement-input")?.click()}
          >
            <Upload size={24} style={{ color: BRAND.accent, margin: "0 auto 8px" }} />
            <div className="text-sm font-medium text-white">Click to upload or drag and drop</div>
            <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>CSV, OFX, or PDF file (max 10MB)</div>
          </div>

          <input
            id="bank-statement-input"
            type="file"
            hidden
            accept=".csv,.ofx,.pdf"
            onChange={(e) => { setStatementFile(e.target.files?.[0] || null); setStatementError(""); }}
          />

          {statementFile && <div className="text-sm text-white">✓ {statementFile.name}</div>}
          {statementError && <span className="text-xs text-red-400">{statementError}</span>}

          <button
            type="button"
            onClick={handleStatementSubmit}
            className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
            style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <Check size={15} />Upload Statement
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Import Transactions Form ─────────────────────────────────────────────────

function ImportTransactionsForm({ onSubmit }: { onSubmit: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!file) {
      setError("Please select a file");
      return;
    }
    setError("");
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.accent}06`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
      >
        📤 Upload a bank statement (CSV, OFX, or PDF) to import transactions.
      </div>

      <div
        className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200"
        style={{ borderColor: error ? "#ef4444" : `${BRAND.accent}30`, backgroundColor: error ? "rgba(239,68,68,0.06)" : `${BRAND.accent}06` }}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <Upload size={24} style={{ color: BRAND.accent, margin: "0 auto 8px" }} />
        <div className="text-sm font-medium text-white">Click to upload or drag and drop</div>
        <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>CSV, OFX, or PDF file (max 10MB)</div>
      </div>

      <input
        id="file-input"
        type="file"
        hidden
        accept=".csv,.ofx,.pdf"
        onChange={(e) => { setFile(e.target.files?.[0] || null); setError(""); }}
      />

      {file && <div className="text-sm text-white">✓ {file.name}</div>}
      {error && <span className="text-xs text-red-400">{error}</span>}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <Check size={15} />Import Transactions
      </button>
    </div>
  );
}

// ─── Receipts Form ────────────────────────────────────────────────────────────

function ReceiptsForm({ onSubmit }: { onSubmit: () => void }) {
  const [receipts, setReceipts] = useState<File[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (receipts.length === 0) {
      setError("Please upload at least one receipt");
      return;
    }
    setError("");
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.accent}06`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
      >
        🧾 Upload receipts and invoices for transactions over £50 to support your financial records.
      </div>

      <div
        className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200"
        style={{ borderColor: error ? "#ef4444" : `${BRAND.accent}30`, backgroundColor: error ? "rgba(239,68,68,0.06)" : `${BRAND.accent}06` }}
        onClick={() => document.getElementById("receipts-input")?.click()}
      >
        <Upload size={24} style={{ color: BRAND.accent, margin: "0 auto 8px" }} />
        <div className="text-sm font-medium text-white">Click to upload receipts</div>
        <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>PDF, JPG, or PNG (max 5MB each)</div>
      </div>

      <input
        id="receipts-input"
        type="file"
        hidden
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => { setReceipts(Array.from(e.target.files || [])); setError(""); }}
      />

      {receipts.length > 0 && (
        <div className="flex flex-col gap-2">
          {receipts.map((f, i) => (
            <div key={i} className="text-sm text-white">✓ {f.name}</div>
          ))}
        </div>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <Check size={15} />Upload Receipts
      </button>
    </div>
  );
}

// ─── Documents Upload Form ────────────────────────────────────────────────────

const DOC_TYPES = [
  { value: "CertificateOfIncorporation", label: "Certificate of Incorporation" },
  { value: "BankStatement",              label: "Bank Statement" },
  { value: "VatCertificate",             label: "VAT Certificate" },
  { value: "ProofOfAddress",             label: "Proof of Address" },
  { value: "TaxReturn",                  label: "Tax Return" },
  { value: "FinancialStatements",        label: "Financial Statements" },
  { value: "Other",                      label: "Other" },
];

function DocumentsUploadForm({ onSubmit }: { onSubmit: () => void }) {
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploadDocument] = useUploadComplianceDocumentMutation();

  const handleSubmit = async () => {
    if (!docType || !file) return;
    setUploading(true);
    try {
      await uploadDocument({
        documentType: docType,
        file,
        fileName: file.name,
        fileSizeBytes: file.size,
      }).unwrap();
      onSubmit();
    } catch {
      toast({ title: "Upload failed. Please try again.", variant: "error" });
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = !!docType && !!file;

  return (
    <div className="flex flex-col gap-5">
      {/* Document Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>
          Document Type <span style={{ color: BRAND.gold }}>*</span>
        </label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="w-full h-11 px-4 rounded-xl text-sm text-white border outline-none transition-all duration-200 appearance-none cursor-pointer"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)", colorScheme: "dark" }}
          onFocus={(e) => { e.target.style.borderColor = "rgba(62,146,204,0.6)"; }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >
          <option value="" style={{ backgroundColor: "#0f1e3a" }}>Select document type…</option>
          {DOC_TYPES.map((d) => (
            <option key={d.value} value={d.value} style={{ backgroundColor: "#0f1e3a" }}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* File */}
      {file ? (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <FileText size={16} style={{ color: BRAND.accent, flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{file.name}</div>
            <div className="text-[11px]" style={{ color: BRAND.muted }}>{(file.size / 1024).toFixed(0)} KB</div>
          </div>
          <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="hover:opacity-70 transition-opacity">
            <X size={14} style={{ color: BRAND.muted }} />
          </button>
        </div>
      ) : (
        <div
          className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200"
          style={{ borderColor: dragOver ? BRAND.accent : `${BRAND.accent}30`, backgroundColor: dragOver ? `${BRAND.accent}08` : `${BRAND.accent}04` }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
        >
          <Upload size={22} style={{ color: BRAND.accent, margin: "0 auto 8px" }} />
          <div className="text-sm font-medium text-white">Drop file here or click to browse</div>
          <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>PDF, JPG, PNG · Max 10 MB</div>
        </div>
      )}
      <input ref={fileRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || uploading}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        {uploading ? "Uploading…" : "Upload Document"}
      </button>
    </div>
  );
}

// ─── Documents Check Form ─────────────────────────────────────────────────────

function DocumentsCheckForm({ onSubmit }: { onSubmit: () => void }) {
  const [verified, setVerified] = useState<Record<string, boolean>>({
    cert: false,
    address: false,
    id: false,
  });

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.green}06`, borderColor: `${BRAND.green}20`, color: "rgba(255,255,255,0.55)" }}
      >
        ✓ Verify the expiry dates on your submitted documents are current and valid.
      </div>

      <div className="flex flex-col gap-3">
        {[
          { key: "cert", label: "Certificate of Incorporation", expiry: "Permanent" },
          { key: "address", label: "Proof of Address", expiry: "30 Mar 2028" },
          { key: "id", label: "Director ID", expiry: "15 Jul 2029" },
        ].map((doc) => (
          <label
            key={doc.key}
            onClick={() => setVerified({ ...verified, [doc.key]: !verified[doc.key] })}
            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: verified[doc.key] ? `${BRAND.green}12` : "rgba(255,255,255,0.03)",
              borderColor: verified[doc.key] ? BRAND.green : "rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="w-4 h-4 rounded border flex items-center justify-center"
              style={{
                backgroundColor: verified[doc.key] ? BRAND.green : "rgba(255,255,255,0.1)",
                borderColor: verified[doc.key] ? BRAND.green : "rgba(255,255,255,0.2)",
              }}
            >
              {verified[doc.key] && <Check size={12} style={{ color: BRAND.primary }} />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{doc.label}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Expires: {doc.expiry}</div>
            </div>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <Check size={15} />Verify & Continue
      </button>
    </div>
  );
}

// ─── Activity Check Form ──────────────────────────────────────────────────────

function ActivityCheckForm({ onSubmit, historyData }: { onSubmit: () => void; historyData?: OperatingHistoryResponse }) {
  const hasHistory = (historyData?.history?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.green}06`, borderColor: `${BRAND.green}20`, color: "rgba(255,255,255,0.55)" }}
      >
        ✓ Your platform activity and engagement metrics are displayed below.
      </div>

      {hasHistory ? (
        <div className="flex flex-col gap-3">
          <FieldLabel>Recent Platform Activity</FieldLabel>
          {(historyData?.history ?? []).slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border p-4 flex items-start gap-3"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex-shrink-0 mt-1">
                {item.isPenalty ? (
                  <AlertCircle size={18} style={{ color: "#ef4444" }} />
                ) : (
                  <Check size={18} style={{ color: BRAND.green }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {new Date(item.occurredAt).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl border p-4 text-xs leading-relaxed text-center"
          style={{ backgroundColor: `${BRAND.accent}08`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
        >
          ℹ️ No platform activity recorded yet. Activity will appear here once you start using the platform.
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        <Check size={15} />Close
      </button>
    </div>
  );
}

// ─── Reconcile Form ───────────────────────────────────────────────────────────

function ReconcileForm({ onSubmit }: { onSubmit: () => void }) {
  const [status, setStatus] = useState<Record<string, "matched" | "flagged" | null>>(
    Object.fromEntries(MOCK_TRANSACTIONS.map((t) => [t.id, null]))
  );

  const actioned = Object.values(status).filter(Boolean).length;
  const canSubmit = actioned >= 3;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Showing 5 of 47 unreconciled transactions
        </span>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: canSubmit ? `${BRAND.green}15` : `${BRAND.gold}15`,
            color: canSubmit ? BRAND.green : BRAND.gold,
          }}
        >
          {actioned}/5 actioned {!canSubmit && "(min 3)"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {MOCK_TRANSACTIONS.map((tx) => {
          const s = status[tx.id];
          return (
            <div
              key={tx.id}
              className="rounded-xl border p-4 transition-all duration-200"
              style={{
                backgroundColor:
                  s === "matched" ? `${BRAND.green}06` : s === "flagged" ? `${BRAND.gold}06` : "rgba(255,255,255,0.03)",
                borderColor:
                  s === "matched" ? `${BRAND.green}25` : s === "flagged" ? `${BRAND.gold}25` : "rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-white">{tx.desc}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: BRAND.muted }}>{tx.date}</div>
                </div>
                <div className="text-sm font-bold" style={{ color: tx.credit ? BRAND.green : "#f87171" }}>
                  {tx.amount}
                </div>
              </div>

              {s ? (
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: s === "matched" ? `${BRAND.green}15` : `${BRAND.gold}15`,
                      color: s === "matched" ? BRAND.green : BRAND.gold,
                    }}
                  >
                    {s === "matched" ? "✓ Matched to record" : "⚑ Flagged for review"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStatus((p) => ({ ...p, [tx.id]: null }))}
                    className="text-[11px] underline"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    Undo
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus((p) => ({ ...p, [tx.id]: "matched" }))}
                    className="flex-1 h-8 rounded-lg text-xs font-semibold border transition-all duration-200"
                    style={{ backgroundColor: `${BRAND.green}10`, borderColor: `${BRAND.green}25`, color: BRAND.green }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.green}20`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.green}10`; }}
                  >
                    ✓ Match to record
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus((p) => ({ ...p, [tx.id]: "flagged" }))}
                    className="flex-1 h-8 rounded-lg text-xs font-semibold border transition-all duration-200"
                    style={{ backgroundColor: `${BRAND.gold}10`, borderColor: `${BRAND.gold}25`, color: BRAND.gold }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.gold}20`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.gold}10`; }}
                  >
                    ⚑ Flag for review
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: BRAND.accent, color: "#fff" }}
      >
        <RefreshCw size={15} />Submit Reconciliation ({actioned}/5 actioned)
      </button>
    </div>
  );
}

// ─── Categorise Form ──────────────────────────────────────────────────────────

function CategoriseForm({ onSubmit }: { onSubmit: () => void }) {
  const [cats, setCats] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_UNCAT.map((t) => [t.id, ""]))
  );

  const done = Object.values(cats).filter(Boolean).length;
  const canSubmit = done >= 4;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Showing 6 of 127 uncategorised transactions
        </span>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: canSubmit ? `${BRAND.green}15` : `${BRAND.gold}15`,
            color: canSubmit ? BRAND.green : BRAND.gold,
          }}
        >
          {done}/6 categorised {!canSubmit && "(min 4)"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {MOCK_UNCAT.map((tx) => (
          <div
            key={tx.id}
            className="rounded-xl border p-4 flex items-center gap-4 transition-all duration-200"
            style={{
              backgroundColor: cats[tx.id] ? `${BRAND.accent}06` : "rgba(255,255,255,0.03)",
              borderColor: cats[tx.id] ? `${BRAND.accent}25` : "rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{tx.desc}</div>
              <div
                className="text-xs mt-0.5 font-semibold"
                style={{ color: tx.amount.startsWith("+") ? BRAND.green : "#f87171" }}
              >
                {tx.amount}
              </div>
            </div>
            <select
              value={cats[tx.id]}
              onChange={(e) => setCats((p) => ({ ...p, [tx.id]: e.target.value }))}
              className="h-9 px-3 rounded-lg text-xs border outline-none appearance-none cursor-pointer flex-shrink-0"
              style={{
                backgroundColor: cats[tx.id] ? `${BRAND.accent}15` : "rgba(255,255,255,0.06)",
                borderColor: cats[tx.id] ? `${BRAND.accent}30` : "rgba(255,255,255,0.12)",
                color: cats[tx.id] ? "white" : BRAND.muted,
                colorScheme: "dark",
              }}
            >
              <option value="" style={{ backgroundColor: "#0f1e3a" }}>Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ backgroundColor: "#0f1e3a" }}>{c}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
      >
        Save Categorisation ({done}/6 done)
      </button>
    </div>
  );
}

// ─── Alerts Form ──────────────────────────────────────────────────────────────

function AlertsForm({ alerts, onSubmit }: { alerts?: ComplianceCentreAlert[]; onSubmit: () => void }) {
  const displayAlerts = alerts && alerts.length > 0 ? alerts : MOCK_ALERTS.map((a) => ({
    id: Number(a.id.replace("al", "")),
    title: a.title,
    description: a.detail,
    priority: "High",
    status: "Open",
    createdAt: new Date().toISOString(),
  }));

  const [resolveAlert] = useResolveAlertMutation();
  const [resolveAll] = useResolveAllAlertsMutation();
  const [resolvedIds, setResolvedIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const openAlerts = displayAlerts.filter((a) => a.status === "Open" && !resolvedIds.has(a.id));
  const allResolved = openAlerts.length === 0;

  const handleResolve = async (id: number) => {
    try {
      if (alerts && alerts.length > 0) {
        await resolveAlert(id).unwrap();
      }
      setResolvedIds((prev) => new Set(prev).add(id));
    } catch {
      toast({ title: "Failed to resolve alert. Please try again.", variant: "error" });
    }
  };

  const handleResolveAll = async () => {
    try {
      if (alerts && alerts.length > 0) {
        await resolveAll().unwrap();
      }
      setResolvedIds(new Set(displayAlerts.map((a) => a.id)));
    } catch {
      toast({ title: "Failed to resolve all alerts. Please try again.", variant: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Resolve all open alerts to improve your operating behaviour score.
        </p>
        {displayAlerts.length > 1 && !allResolved && (
          <button
            type="button"
            onClick={handleResolveAll}
            className="text-xs font-semibold px-3 h-8 rounded-lg border flex-shrink-0 transition-all duration-200"
            style={{ backgroundColor: `${BRAND.accent}10`, borderColor: `${BRAND.accent}25`, color: BRAND.accent }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}20`; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}10`; }}
          >
            Resolve All
          </button>
        )}
      </div>

      {displayAlerts.map((alert) => {
        const isResolved = resolvedIds.has(alert.id) || alert.status === "Resolved";
        const daysOpen = Math.floor((Date.now() - new Date(alert.createdAt).getTime()) / 86400000);
        return (
          <div
            key={alert.id}
            className="rounded-xl border p-5 transition-all duration-200"
            style={{
              backgroundColor: isResolved ? `${BRAND.green}06` : "rgba(255,255,255,0.03)",
              borderColor: isResolved ? `${BRAND.green}25` : "rgba(239,68,68,0.25)",
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: isResolved ? `${BRAND.green}15` : "rgba(239,68,68,0.12)" }}
              >
                {isResolved
                  ? <CheckCircle2 size={16} style={{ color: BRAND.green }} />
                  : <AlertCircle size={16} style={{ color: "#ef4444" }} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">{alert.title}</span>
                  {!isResolved && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#f87171" }}
                    >
                      Open {daysOpen}d
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {alert.description}
                </p>
              </div>
            </div>

            {isResolved ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: BRAND.green }}>
                  ✓ Resolved
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleResolve(alert.id)}
                className="w-full h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all duration-200"
                style={{ backgroundColor: `${BRAND.gold}12`, borderColor: `${BRAND.gold}30`, color: BRAND.gold }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.gold}20`; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.gold}12`; }}
              >
                <Check size={13} />Mark as Resolved
              </button>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!allResolved}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
      >
        <Check size={15} />Done — All Alerts Resolved
      </button>
      {!allResolved && (
        <p className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
          {openAlerts.length} open alert{openAlerts.length !== 1 ? "s" : ""} remaining
        </p>
      )}
    </div>
  );
}

// ─── AML Report View ──────────────────────────────────────────────────────────

function AMLReportView({ onClose, amlData, onReview }: { onClose: () => void; amlData?: AmlReport; onReview?: () => void }) {
  const checks = [
    {
      label: "Sanctions Screening",
      result: amlData?.sanctionsScreeningStatus ?? "Clear",
      passing: (amlData?.sanctionsScreeningStatus ?? "Clear") === "Clear",
      detail: amlData?.sanctionsScreeningStatus === "Clear"
        ? "No matches found across OFAC, UN, EU, and UK sanctions lists."
        : "Sanctions screening is pending or flagged. Contact support for details.",
    },
    {
      label: "PEP Check",
      result: amlData ? (amlData.hasPepFlags ? "Flagged" : "No Flags") : "No Flags",
      passing: amlData ? !amlData.hasPepFlags : true,
      detail: amlData && !amlData.hasPepFlags
        ? "Not identified as a Politically Exposed Person or close associate."
        : "PEP flags detected. Review required.",
    },
    {
      label: "Adverse Media",
      result: amlData?.adverseMediaStatus ?? "Clear",
      passing: (amlData?.adverseMediaStatus ?? "Clear") === "Clear",
      detail: amlData?.adverseMediaStatus === "Clear"
        ? "No relevant adverse media results from global news database scan."
        : "Adverse media check is pending or flagged.",
    },
    {
      label: "Ongoing Monitoring",
      result: amlData?.ongoingMonitoringActive ? "Active" : "Inactive",
      passing: amlData?.ongoingMonitoringActive ?? true,
      detail: amlData?.ongoingMonitoringActive
        ? `Automated re-screening every ${amlData.monitoringIntervalDays} days via Sumsub monitoring.`
        : "Ongoing monitoring is not yet active.",
    },
  ];

  const lastScan = amlData?.lastScannedAt
    ? new Date(amlData.lastScannedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "Pending";
  const nextScan = amlData?.nextScanAt
    ? new Date(amlData.nextScanAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "N/A";
  const allClear = checks.every((c) => c.passing);

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 flex items-start gap-3"
        style={{
          backgroundColor: allClear ? `${BRAND.green}08` : "rgba(239,68,68,0.06)",
          borderColor: allClear ? `${BRAND.green}20` : "rgba(239,68,68,0.25)",
        }}
      >
        <ShieldCheck size={20} style={{ color: allClear ? BRAND.green : "#ef4444", flexShrink: 0, marginTop: 1 }} />
        <div>
          <div className="text-sm font-bold text-white mb-1">
            AML Screening — {allClear ? "All Clear" : "Review Required"}
          </div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Last full scan: {lastScan} · Provider: Sumsub · Next scan: {nextScan}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {checks.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border p-4 flex items-start gap-4"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: c.passing ? `${BRAND.green}15` : "rgba(239,68,68,0.12)" }}
            >
              {c.passing
                ? <CheckCircle2 size={16} style={{ color: BRAND.green }} />
                : <AlertCircle size={16} style={{ color: "#ef4444" }} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{c.label}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: c.passing ? `${BRAND.green}15` : "rgba(239,68,68,0.12)",
                    color: c.passing ? BRAND.green : "#f87171",
                  }}
                >
                  {c.result}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{c.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => { onReview?.(); onClose(); }}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
        style={{ backgroundColor: `${BRAND.green}15`, color: BRAND.green, border: `1px solid ${BRAND.green}30` }}
      >
        <Check size={15} />Done — Report Reviewed
      </button>
    </div>
  );
}

// ─── Record Updates Form ──────────────────────────────────────────────────────

function RecordUpdatesForm({ onSubmit }: { onSubmit: () => void }) {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [synced, setSynced] = useState<string[]>([]);
  const [manualFile, setManualFile] = useState("");
  const [connectBank] = useConnectBankMutation();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSync = async (id: "truelayer" | "mono") => {
    setSyncing(id);
    try {
      await connectBank({
        provider: id === "truelayer" ? "TrueLayer" : "Mono",
        jurisdiction: id === "truelayer" ? "GB" : "NG",
      }).unwrap();
      setSynced((p) => [...p, id]);
      toast({ title: "Bank synced successfully", variant: "success" });
    } catch (error) {
      toast({ title: "Sync failed. Please try again.", variant: "error" });
    } finally {
      setSyncing(null);
    }
  };

  const canSubmit = synced.length > 0 || manualFile !== "";

  const providers = [
    { id: "truelayer", name: "TrueLayer", desc: "UK banks — Barclays, HSBC, Monzo, Lloyds +60 more", flag: "🇬🇧", color: BRAND.accent },
    { id: "mono", name: "Mono", desc: "Nigerian banks — GTBank, Access, Zenith +30 more", flag: "🇳🇬", color: BRAND.green },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-xl border p-4 text-xs leading-relaxed"
        style={{ backgroundColor: `${BRAND.accent}08`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
      >
        🔒 Sync uses read-only Open Banking access. AccuBridge cannot initiate payments or transfers.
      </div>

      {/* Option A */}
      <div className="flex flex-col gap-2">
        <SectionHeading label="Option A — Sync via Open Banking" />
        {providers.map((p) => {
          const isConnected = synced.includes(p.id);
          const isConnecting = syncing === p.id;
          return (
            <div
              key={p.id}
              className="rounded-xl border p-4 flex items-center gap-4 transition-all duration-200"
              style={{
                backgroundColor: isConnected ? `${p.color}06` : "rgba(255,255,255,0.03)",
                borderColor: isConnected ? `${p.color}25` : "rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: isConnected ? `${p.color}15` : `${p.color}10` }}
              >
                {p.flag}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{p.name}</span>
                  {isConnected && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: `${p.color}15`, color: p.color }}
                    >
                      Synced
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{p.desc}</div>
              </div>
              <button
                type="button"
                onClick={() => !isConnected && handleSync(p.id as "truelayer" | "mono")}
                disabled={isConnecting || isConnected}
                className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-xs font-bold flex-shrink-0 transition-all disabled:opacity-60"
                style={{ backgroundColor: isConnected ? `${p.color}15` : p.color, color: isConnected ? p.color : "#fff" }}
              >
                {isConnecting
                  ? <><Loader2 size={12} className="animate-spin" />Syncing…</>
                  : isConnected
                  ? <><CheckCircle2 size={12} />Synced</>
                  : <>Sync Now</>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Option B */}
      <div className="flex flex-col gap-2">
        <SectionHeading label="Option B — Manual Statement Import" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-3 transition-all duration-200"
          style={{
            borderColor: manualFile ? `${BRAND.gold}40` : "rgba(255,255,255,0.1)",
            backgroundColor: manualFile ? `${BRAND.gold}04` : "rgba(255,255,255,0.02)",
          }}
        >
          {manualFile ? (
            <>
              <FileText size={24} style={{ color: BRAND.gold }} />
              <span className="text-sm font-medium" style={{ color: BRAND.gold }}>{manualFile}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Click to replace</span>
            </>
          ) : (
            <>
              <Upload size={22} style={{ color: "rgba(255,255,255,0.3)" }} />
              <div className="text-sm font-semibold text-white">Drop or click to upload bank statement</div>
              <div className="text-xs" style={{ color: BRAND.muted }}>PDF, CSV, OFX · Last 3 months</div>
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.csv,.ofx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setManualFile(f.name);
          }}
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
      >
        <Check size={15} />Update Financial Records
      </button>
      {!canSubmit && (
        <p className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
          Sync a bank account or upload a statement to continue
        </p>
      )}
    </div>
  );
}

// ─── Sheet metadata ───────────────────────────────────────────────────────────

export type FixType =
  | "reconcile"
  | "categorise"
  | "name_match"
  | "registration_number"
  | "entity_status"
  | "business_profile"
  | "tax_id"
  | "vat_setup"
  | "hmrc_connect"
  | "hmrc_sync"
  | "bank_connect"
  | "import_transactions"
  | "receipts"
  | "documents_upload"
  | "documents_check"
  | "activity_check"
  | "kyb"
  | "alerts"
  | "alerts_review"
  | "record_updates";

const SHEET_META: Record<FixType, { title: string; description: string }> = {
  kyb: {
    title: "Business KYB Verification",
    description: "Verify your legal entity against official government records",
  },
  name_match: {
    title: "Fix Legal Name Mismatch",
    description: "Update your business name to match the Companies House record",
  },
  registration_number: {
    title: "Add Registration Number",
    description: "Enter your Companies House or CAC registration number",
  },
  entity_status: {
    title: "Verify Entity Status",
    description: "Confirm your business entity is active and in good standing",
  },
  business_profile: {
    title: "Complete Business Profile",
    description: "Fill in business name, industry, type, and operating country",
  },
  tax_id: {
    title: "Add Tax ID",
    description: "Enter your UTR or tax identification number",
  },
  vat_setup: {
    title: "Declare VAT & Payroll Status",
    description: "Confirm your VAT registration and payroll setup details",
  },
  hmrc_connect: {
    title: "Connect HMRC Account",
    description: "Link your HMRC account to sync tax obligations automatically",
  },
  hmrc_sync: {
    title: "Sync HMRC Obligations",
    description: "Retrieve your latest VAT and payroll obligations from HMRC",
  },
  bank_connect: {
    title: "Connect Bank Account",
    description: "Link your bank account or import a statement to get started",
  },
  import_transactions: {
    title: "Import Transactions",
    description: "Upload a bank statement or connect via TrueLayer to import transactions",
  },
  receipts: {
    title: "Upload Receipts",
    description: "Upload supporting receipts for transactions over £50",
  },
  documents_upload: {
    title: "Upload Documents",
    description: "Upload Certificate of Incorporation, proof of address, and director ID",
  },
  documents_check: {
    title: "Verify Document Expiry",
    description: "Check and verify expiry dates on your submitted documents",
  },
  activity_check: {
    title: "View Platform Activity",
    description: "Review your account activity and engagement metrics",
  },
  reconcile: {
    title: "Reconcile Transactions",
    description: "Match your bank transactions against your financial records",
  },
  categorise: {
    title: "Categorise Transactions",
    description: "Assign categories to unlock the full financial records score",
  },
  alerts: {
    title: "Resolve Compliance Alerts",
    description: "Review and close open alerts to improve your behaviour score",
  },
  alerts_review: {
    title: "AML / Risk Report",
    description: "Your AML and sanctions screening results — all checks passed",
  },
  record_updates: {
    title: "Update Financial Records",
    description: "Sync your latest bank data or import a statement manually",
  },
};

// ─── Main component ───────────────────────────────────────────────────────────

interface FixActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  fixType: FixType;
  alerts?: ComplianceCentreAlert[];
  amlData?: AmlReport;
  historyData?: OperatingHistoryResponse;
}

export function FixActionSheet({ isOpen, onClose, fixType, alerts, amlData, historyData }: FixActionSheetProps) {
  const [step, setStep] = useState<"form" | "processing" | "done">("form");
  const [openKey, setOpenKey] = useState(0);

  const [submitKybMultiEntry] = useSubmitKybMultiEntryMutation();
  const [fixLegalName] = useFixLegalNameMutation();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setOpenKey((k) => k + 1);
    }
  }, [isOpen, fixType]);

  const handleClose = () => {
    setStep("form");
    onClose();
  };

  // Generic handler for forms that have no API yet
  const handleSubmit = async () => {
    setStep("processing");
    await new Promise((res) => setTimeout(res, 1800));
    setStep("done");
  };

  const handleKYBSubmit = async (data: KYBFormData) => {
    setStep("processing");
    try {
      await submitKybMultiEntry({
        jurisdiction: data.jurisdiction,
        companiesHouseNumber: data.companiesHouseNumber,
        submittedLegalName: data.submittedLegalName,
        authorizedDirectorsJson: data.directorsJson,
        certificateOfIncorporationUrl: data.certificateOfIncorporationUrl,
      }).unwrap();
      setStep("done");
    } catch {
      setStep("form");
      toast({ title: "KYB submission failed. Please try again.", variant: "error" });
    }
  };

  const handleNameMatchSubmit = async (correctedName: string) => {
    setStep("processing");
    try {
      await fixLegalName({ correctedBusinessName: correctedName }).unwrap();
      setStep("done");
    } catch {
      setStep("form");
      toast({ title: "Failed to update legal name. Please try again.", variant: "error" });
    }
  };

  const meta = SHEET_META[fixType];

  // AML review has no form/processing/done flow — purely informational
  if (fixType === "alerts_review") {
    return (
      <SystemSheet open={isOpen} onClose={handleClose} title={meta.title} description={meta.description} width={520}>
        <AMLReportView onClose={handleClose} amlData={amlData} />
      </SystemSheet>
    );
  }

  return (
    <SystemSheet open={isOpen} onClose={handleClose} title={meta.title} description={meta.description} width={520}>
      {(step === "form" || step === "done") && (
        <button
          type="button"
          onClick={handleClose}
          className="mb-4 text-sm font-semibold flex items-center gap-1.5 transition-colors"
          style={{ color: BRAND.accent }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          ← Back to Summary
        </button>
      )}
      {step === "form" && (
        <div key={openKey}>
          {fixType === "kyb" && <KYBForm onSubmit={handleKYBSubmit} />}
          {fixType === "name_match" && <NameMatchForm onSubmit={handleNameMatchSubmit} />}
          {fixType === "registration_number" && <RegistrationNumberForm onSubmit={handleSubmit} />}
          {fixType === "entity_status" && <EntityStatusForm onSubmit={handleSubmit} />}
          {fixType === "business_profile" && <BusinessProfileForm onSubmit={handleSubmit} />}
          {fixType === "tax_id" && <TaxIDForm onSubmit={handleSubmit} />}
          {fixType === "vat_setup" && <VATSetupForm onSubmit={handleSubmit} />}
          {fixType === "hmrc_connect" && <HMRCConnectForm onSubmit={handleSubmit} />}
          {fixType === "hmrc_sync" && <HMRCSyncForm onSubmit={handleSubmit} />}
          {fixType === "bank_connect" && <BankConnectForm onSubmit={handleSubmit} />}
          {fixType === "import_transactions" && <ImportTransactionsForm onSubmit={handleSubmit} />}
          {fixType === "receipts" && <ReceiptsForm onSubmit={handleSubmit} />}
          {fixType === "documents_upload" && <DocumentsUploadForm onSubmit={handleSubmit} />}
          {fixType === "documents_check" && <DocumentsCheckForm onSubmit={handleSubmit} />}
          {fixType === "activity_check" && <ActivityCheckForm historyData={historyData} onSubmit={handleSubmit} />}
          {fixType === "reconcile" && <ReconcileForm onSubmit={handleSubmit} />}
          {fixType === "categorise" && <CategoriseForm onSubmit={handleSubmit} />}
          {fixType === "alerts" && <AlertsForm alerts={alerts} onSubmit={handleSubmit} />}
          {fixType === "record_updates" && <RecordUpdatesForm onSubmit={handleSubmit} />}
        </div>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center gap-6 py-20">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${BRAND.accent}15` }}
          >
            <Loader2 size={28} className="animate-spin" style={{ color: BRAND.accent }} />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold mb-1">Submitting…</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>This only takes a moment</p>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-5 py-20 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${BRAND.green}20`, border: `2px solid ${BRAND.green}` }}
          >
            <CheckCircle2 size={28} style={{ color: BRAND.green }} />
          </div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Submitted Successfully</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Your compliance profile will be updated. Score changes may take up to 24 hours to reflect.
            </p>
          </div>
        </div>
      )}
    </SystemSheet>
  );
}
