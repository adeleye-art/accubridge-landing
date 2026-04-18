"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronRight, Upload, CheckCircle2, BookmarkCheck } from "lucide-react";
import { SystemSheet } from "@/components/shared/system-sheet";
import { useCurrency } from "@/lib/currency-context";
import {
  RegistrationCountry,
  UKRegistrationData,
  NigeriaRegistrationData,
  BusinessRegistration,
} from "@/types/tools";
import {
  useCreateBusinessRegistrationMutation,
  useUpdateUKRegistrationMutation,
  useUpdateNGRegistrationMutation,
  useSubmitBusinessRegistrationMutation,
  useSaveDraftBusinessRegistrationMutation,
  UpdateUKRegistrationInput,
  UpdateNGRegistrationInput,
} from "@/lib/api/businessRegistrationApi";

const BRAND = {
  primary: "#0A2463",
  gold: "#D4AF37",
  green: "#06D6A0",
  accent: "#3E92CC",
  muted: "#6B7280",
};

// ── Shared form primitives ──────────────────────────────────────────────────────
const baseInput =
  "w-full h-11 px-4 rounded-xl text-sm text-white border outline-none transition-all duration-200";
const baseStyle = {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.1)",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const focusFns = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(62,146,204,0.6)";
    e.target.style.boxShadow = "0 0 0 3px rgba(62,146,204,0.12)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow = "none";
  },
};

function FField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: BRAND.muted }}
      >
        {label}
        {required && <span style={{ color: BRAND.gold }}> *</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

function FInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={baseInput} style={baseStyle} {...focusFns} {...props} />
  );
}

function FSelect({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${baseInput} appearance-none cursor-pointer`}
      style={{ ...baseStyle, colorScheme: "dark" as const }}
      {...focusFns}
      {...props}
    >
      {children}
    </select>
  );
}

function FToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: checked ? `${BRAND.gold}08` : "rgba(255,255,255,0.04)",
        borderColor: checked ? `${BRAND.gold}30` : "rgba(255,255,255,0.1)",
      }}
      onClick={() => onChange(!checked)}
    >
      <div>
        <div className="text-sm text-white font-medium">{label}</div>
        {hint && (
          <div
            className="text-xs mt-0.5"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {hint}
          </div>
        )}
      </div>
      <div
        className="w-10 h-5 rounded-full relative flex-shrink-0 transition-all duration-300"
        style={{ backgroundColor: checked ? BRAND.gold : "rgba(255,255,255,0.12)" }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
          style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        />
      </div>
    </div>
  );
}

function FFileUpload({
  label,
  hint,
  uploaded,
  onChange,
}: {
  label: string;
  hint?: string;
  uploaded: boolean;
  onChange: (uploaded: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200"
      style={{
        backgroundColor: uploaded ? `${BRAND.green}08` : "rgba(255,255,255,0.04)",
        borderColor: uploaded ? `${BRAND.green}30` : "rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex-1 min-w-0 pr-3">
        <div className="text-sm text-white font-medium">{label}</div>
        {fileName ? (
          <div className="text-xs mt-0.5 truncate" style={{ color: BRAND.green }}>{fileName}</div>
        ) : (
          hint && <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{hint}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold flex-shrink-0 transition-all duration-200"
        style={{
          backgroundColor: uploaded ? `${BRAND.green}20` : "rgba(255,255,255,0.08)",
          color: uploaded ? BRAND.green : "#fff",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        {uploaded ? <CheckCircle2 size={12} /> : <Upload size={12} />}
        {uploaded ? "Uploaded" : "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setFileName(file.name);
            onChange(true);
          }
        }}
      />
    </div>
  );
}

// ── Step nav buttons ────────────────────────────────────────────────────────────
function StepNav({
  onBack,
  onNext,
  isFirst,
  isLast,
  isLoading,
}: {
  onBack: () => void;
  onNext: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div
      className="flex justify-between pt-6 mt-6 border-t"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
    >
      {!isFirst ? (
        <button
          type="button"
          onClick={onBack}
          className="px-5 h-10 rounded-xl text-sm font-medium border transition-all duration-200"
          style={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          ← Back
        </button>
      ) : (
        <div />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 h-10 rounded-xl text-sm font-bold transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
        onMouseEnter={(e) => {
          if (!isLoading) e.currentTarget.style.backgroundColor = "#c49b30";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = BRAND.gold;
        }}
      >
        {isLast
          ? isLoading
            ? "Submitting..."
            : "Submit Application"
          : "Continue →"}
        {!isLast && <ChevronRight size={14} />}
      </button>
    </div>
  );
}

// ── Step indicator ──────────────────────────────────────────────────────────────
function MiniStepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
      {steps.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300"
                style={{
                  backgroundColor: isDone
                    ? `${BRAND.green}20`
                    : isActive
                    ? BRAND.gold
                    : "rgba(255,255,255,0.06)",
                  borderColor: isDone
                    ? `${BRAND.green}40`
                    : isActive
                    ? BRAND.gold
                    : "rgba(255,255,255,0.1)",
                  color: isDone
                    ? BRAND.green
                    : isActive
                    ? BRAND.primary
                    : BRAND.muted,
                }}
              >
                {isDone ? <Check size={11} /> : i + 1}
              </div>
              <span
                className="text-[11px] font-medium hidden sm:block"
                style={{
                  color: isActive
                    ? "#fff"
                    : isDone
                    ? BRAND.green
                    : "rgba(255,255,255,0.3)",
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px mx-1"
                style={{
                  backgroundColor: isDone
                    ? `${BRAND.green}30`
                    : "rgba(255,255,255,0.08)",
                  minWidth: "16px",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Country selection ───────────────────────────────────────────────────────────
function CountrySelectStep({
  onSelect,
}: {
  onSelect: (country: RegistrationCountry) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
        Select the country where you want to register your business. AccuBridge
        will guide you through the exact steps required by each jurisdiction.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            country: "uk" as RegistrationCountry,
            flag: "🇬🇧",
            title: "United Kingdom",
            body: "Companies House",
            details:
              "Register a Ltd, LLP, or Sole Trader. Certificate issued within 24 hours.",
            accentColor: BRAND.accent,
            steps: ["Choose structure", "Company details", "Directors & shares", "Submit"],
          },
          {
            country: "nigeria" as RegistrationCountry,
            flag: "🇳🇬",
            title: "Nigeria",
            body: "Corporate Affairs Commission (CAC)",
            details:
              "Register a Business Name, LLC, or Incorporated Trustee. Approval in 3–10 days.",
            accentColor: BRAND.green,
            steps: ["Choose type", "Name reservation", "Proprietor details", "Submit"],
          },
        ].map((opt) => (
          <button
            key={opt.country}
            type="button"
            onClick={() => onSelect(opt.country)}
            className="rounded-2xl border p-5 flex flex-col gap-4 text-left transition-all duration-300"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${opt.accentColor}08`;
              e.currentTarget.style.borderColor = `${opt.accentColor}35`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{opt.flag}</span>
              <div>
                <div className="text-white font-bold text-base">{opt.title}</div>
                <div className="text-xs" style={{ color: opt.accentColor }}>
                  {opt.body}
                </div>
              </div>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {opt.details}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {opt.steps.map((s, i) => (
                <span
                  key={s}
                  className="text-[10px] px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${opt.accentColor}10`,
                    color: `${opt.accentColor}cc`,
                    borderColor: `${opt.accentColor}20`,
                  }}
                >
                  Step {i + 1}: {s}
                </span>
              ))}
            </div>
            <div
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: opt.accentColor }}
            >
              Start {opt.title} registration <ChevronRight size={13} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── UK steps ────────────────────────────────────────────────────────────────────
const UK_STEPS = ["Structure", "Company Details", "Directors & Shares", "Review & Submit"];

const UK_STRUCTURES = [
  { value: "private_limited", label: "Private Limited Company (Ltd)" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "sole_trader", label: "Sole Trader" },
  { value: "partnership", label: "Partnership" },
  { value: "community_interest", label: "Community Interest Company (CIC)" },
];

function UKStep1({
  data,
  onChange,
  onNext,
}: {
  data: Partial<UKRegistrationData>;
  onChange: (d: Partial<UKRegistrationData>) => void;
  onNext: () => void;
}) {
  const [error, setError] = useState("");
  return (
    <div className="flex flex-col gap-5">
      <MiniStepIndicator steps={UK_STEPS} current={0} />
      <FField label="Business Structure" required error={error}>
        <FSelect
          value={data.business_structure || ""}
          onChange={(e) => {
            onChange({ ...data, business_structure: e.target.value as UKRegistrationData["business_structure"] });
            setError("");
          }}
        >
          <option value="" style={{ backgroundColor: "#0f1e3a" }}>
            Select structure...
          </option>
          {UK_STRUCTURES.map((s) => (
            <option key={s.value} value={s.value} style={{ backgroundColor: "#0f1e3a" }}>
              {s.label}
            </option>
          ))}
        </FSelect>
      </FField>
      {data.business_structure && (
        <div
          className="rounded-xl border p-4 text-xs leading-relaxed"
          style={{
            backgroundColor: `${BRAND.accent}08`,
            borderColor: `${BRAND.accent}20`,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {data.business_structure === "private_limited" &&
            "Most popular structure. Provides limited liability protection. Directors manage the company, shareholders own it."}
          {data.business_structure === "llp" &&
            "Combines partnership flexibility with limited liability. Ideal for professional services firms."}
          {data.business_structure === "sole_trader" &&
            "Simplest structure. You are the business. No separate legal entity — unlimited personal liability."}
          {data.business_structure === "partnership" &&
            "Two or more people sharing profits. Partners have unlimited liability unless LLP structure is chosen."}
          {data.business_structure === "community_interest" &&
            "For businesses with a social purpose. Assets locked for community benefit."}
        </div>
      )}
      <StepNav
        isFirst
        onBack={() => {}}
        onNext={() => {
          if (!data.business_structure) {
            setError("Please select a structure");
            return;
          }
          onNext();
        }}
      />
    </div>
  );
}

function UKStep2({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: Partial<UKRegistrationData>;
  onChange: (d: Partial<UKRegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof UKRegistrationData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [k]: e.target.value });

  const SIC_CODES = [
    "62012 – Business and domestic software development",
    "69201 – Accounting and auditing activities",
    "74909 – Other professional, scientific and technical activities",
    "47910 – Retail sale via internet",
    "70229 – Management consultancy",
    "Other",
  ];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.proposed_company_name?.trim()) e.proposed_company_name = "Company name is required";
    if (!data.registered_address?.trim()) e.registered_address = "Address is required";
    if (!data.city?.trim()) e.city = "City is required";
    if (!data.postcode?.trim()) e.postcode = "Postcode is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="flex flex-col gap-5">
      <MiniStepIndicator steps={UK_STEPS} current={1} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FField label="Proposed Company Name" required error={errors.proposed_company_name}>
          <FInput
            placeholder="e.g. Apex Solutions Ltd"
            value={data.proposed_company_name || ""}
            onChange={set("proposed_company_name")}
          />
        </FField>
        <FField label="Alternative Name (if taken)">
          <FInput
            placeholder="e.g. Apex Group Ltd"
            value={data.alternative_name || ""}
            onChange={set("alternative_name")}
          />
        </FField>
        <FField label="Registered Address" required error={errors.registered_address}>
          <FInput
            placeholder="123 Business Street"
            value={data.registered_address || ""}
            onChange={set("registered_address")}
          />
        </FField>
        <FField label="City" required error={errors.city}>
          <FInput placeholder="London" value={data.city || ""} onChange={set("city")} />
        </FField>
        <FField label="Postcode" required error={errors.postcode}>
          <FInput placeholder="EC1A 1BB" value={data.postcode || ""} onChange={set("postcode")} />
        </FField>
        <FField label="SIC Code (Business Activity)">
          <FSelect
            value={data.sic_code || ""}
            onChange={(e) => onChange({ ...data, sic_code: e.target.value })}
          >
            <option value="" style={{ backgroundColor: "#0f1e3a" }}>
              Select activity...
            </option>
            {SIC_CODES.map((s) => (
              <option key={s} value={s.split(" – ")[0]} style={{ backgroundColor: "#0f1e3a" }}>
                {s}
              </option>
            ))}
          </FSelect>
        </FField>
      </div>
      <StepNav onBack={onBack} onNext={() => { if (validate()) onNext(); }} />
    </div>
  );
}

function UKStep3({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: Partial<UKRegistrationData>;
  onChange: (d: Partial<UKRegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { symbol } = useCurrency();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof UKRegistrationData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [k]: e.target.value });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.director_full_name?.trim()) e.director_full_name = "Director name is required";
    if (!data.director_dob) e.director_dob = "Date of birth is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="flex flex-col gap-5">
      <MiniStepIndicator steps={UK_STEPS} current={2} />
      <div className="text-xs font-bold uppercase tracking-widest pb-1" style={{ color: BRAND.accent }}>
        Director Details
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FField label="Director Full Name" required error={errors.director_full_name}>
          <FInput
            placeholder="Jane Okonkwo"
            value={data.director_full_name || ""}
            onChange={set("director_full_name")}
          />
        </FField>
        <FField label="Date of Birth" required error={errors.director_dob}>
          <FInput
            type="date"
            value={data.director_dob || ""}
            onChange={set("director_dob")}
            style={{ ...baseStyle, colorScheme: "dark" as const }}
          />
        </FField>
        <FField label="Nationality">
          <FInput
            placeholder="British"
            value={data.director_nationality || ""}
            onChange={set("director_nationality")}
          />
        </FField>
        <FField label="Director's Home Address">
          <FInput
            placeholder="Same or different from registered address"
            value={data.director_address || ""}
            onChange={set("director_address")}
          />
        </FField>
      </div>
      <div className="text-xs font-bold uppercase tracking-widest pb-1 pt-2" style={{ color: BRAND.accent }}>
        Share Capital
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FField label={`Share Capital (${symbol})`}>
          <FInput
            type="number"
            placeholder="100"
            value={data.share_capital || ""}
            onChange={set("share_capital")}
          />
        </FField>
        <FField label="Number of Shares">
          <FInput
            type="number"
            placeholder="100"
            value={data.number_of_shares || ""}
            onChange={set("number_of_shares")}
          />
        </FField>
      </div>
      <StepNav onBack={onBack} onNext={() => { if (validate()) onNext(); }} />
    </div>
  );
}

function UKStep4({
  data,
  onChange,
  onSubmit,
  onBack,
  isSubmitting,
}: {
  data: Partial<UKRegistrationData>;
  onChange: (d: Partial<UKRegistrationData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const { symbol } = useCurrency();
  return (
    <div className="flex flex-col gap-5">
      <MiniStepIndicator steps={UK_STEPS} current={3} />
      {/* Summary */}
      <div
        className="rounded-2xl border p-4 flex flex-col gap-3"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.accent }}>
          Application Summary
        </div>
        {[
          { label: "Structure", value: data.business_structure?.replace(/_/g, " ").toUpperCase() },
          { label: "Company Name", value: data.proposed_company_name },
          { label: "Address", value: `${data.registered_address || ""}, ${data.city || ""}, ${data.postcode || ""}`.replace(/^,\s*|,\s*$|,\s*,/g, "") || undefined },
          { label: "Director", value: data.director_full_name },
        ]
          .filter((r) => r.value)
          .map((row) => (
            <div key={row.label} className="flex justify-between text-xs">
              <span style={{ color: BRAND.muted }}>{row.label}</span>
              <span className="text-white font-medium text-right max-w-[55%] truncate">
                {row.value}
              </span>
            </div>
          ))}
      </div>
      <FToggle
        label="Adopt Model Articles of Association"
        hint="Standard articles are suitable for most companies. Recommended for first-time registrations."
        checked={!!data.agree_model_articles}
        onChange={(v) => onChange({ ...data, agree_model_articles: v })}
      />
      <FToggle
        label="Confirmation Statement"
        hint="I confirm all information provided is accurate and I am authorised to submit this application."
        checked={!!data.confirmation_statement}
        onChange={(v) => onChange({ ...data, confirmation_statement: v })}
      />
      <div
        className="rounded-xl border p-4 text-xs"
        style={{
          backgroundColor: `${BRAND.gold}08`,
          borderColor: `${BRAND.gold}20`,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        🏛️ Companies House filing fee:{" "}
        <strong style={{ color: BRAND.gold }}>{symbol}50</strong> (standard online) ·
        Processed within 24 hours · Certificate of Incorporation issued digitally
      </div>
      <StepNav isLast onBack={onBack} onNext={onSubmit} isLoading={isSubmitting} />
    </div>
  );
}

// ── Nigeria steps ───────────────────────────────────────────────────────────────
const NG_STEPS = ["Business Type", "Name Reservation", "Proprietor Details", "Documents & Submit"];

const NG_TYPES = [
  { value: "business_name", label: "Business Name (Sole Trader / Partnership)" },
  { value: "limited_liability", label: "Limited Liability Company (LLC)" },
  { value: "incorporated_trustee", label: "Incorporated Trustee (NGO / Charity)" },
  { value: "unlimited_company", label: "Unlimited Company" },
];

const NG_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

function NGStep1({
  data,
  onChange,
  onNext,
}: {
  data: Partial<NigeriaRegistrationData>;
  onChange: (d: Partial<NigeriaRegistrationData>) => void;
  onNext: () => void;
}) {
  const [error, setError] = useState("");
  return (
    <div className="flex flex-col gap-5">
      <MiniStepIndicator steps={NG_STEPS} current={0} />
      <FField label="Business Type" required error={error}>
        <FSelect
          value={data.business_type || ""}
          onChange={(e) => {
            onChange({ ...data, business_type: e.target.value as NigeriaRegistrationData["business_type"] });
            setError("");
          }}
        >
          <option value="" style={{ backgroundColor: "#0f1e3a" }}>
            Select type...
          </option>
          {NG_TYPES.map((t) => (
            <option key={t.value} value={t.value} style={{ backgroundColor: "#0f1e3a" }}>
              {t.label}
            </option>
          ))}
        </FSelect>
      </FField>
      {data.business_type && (
        <div
          className="rounded-xl border p-3 text-xs leading-relaxed"
          style={{
            backgroundColor: `${BRAND.green}08`,
            borderColor: `${BRAND.green}20`,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {data.business_type === "business_name" &&
            "Simplest registration. Suitable for individuals and small businesses. No separate legal entity. Registration fee: ~₦10,000."}
          {data.business_type === "limited_liability" &&
            "Separate legal entity with limited liability protection. Minimum of 2 directors. Registration fee: ~₦35,000+."}
          {data.business_type === "incorporated_trustee" &&
            "For non-profit organisations, NGOs, and charities. Board of trustees required. Registration fee: ~₦50,000+."}
          {data.business_type === "unlimited_company" &&
            "No limit on member liability. Rarely used. Suitable for specific professional services."}
        </div>
      )}
      <StepNav
        isFirst
        onBack={() => {}}
        onNext={() => {
          if (!data.business_type) {
            setError("Please select a business type");
            return;
          }
          onNext();
        }}
      />
    </div>
  );
}

function NGStep2({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: Partial<NigeriaRegistrationData>;
  onChange: (d: Partial<NigeriaRegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.proposed_name_1?.trim()) e.proposed_name_1 = "At least one proposed name is required";
    if (!data.business_nature?.trim()) e.business_nature = "Business nature is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="flex flex-col gap-5">
      <MiniStepIndicator steps={NG_STEPS} current={1} />
      <div
        className="text-xs rounded-xl border p-3 leading-relaxed"
        style={{
          backgroundColor: `${BRAND.gold}08`,
          borderColor: `${BRAND.gold}20`,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        ℹ️ CAC requires two proposed names in order of preference. The system will check
        availability. Name reservation typically takes 24–48 hours.
      </div>
      <FField label="Proposed Business Name 1" required error={errors.proposed_name_1}>
        <FInput
          placeholder="e.g. GreenPath Ventures Limited"
          value={data.proposed_name_1 || ""}
          onChange={(e) => onChange({ ...data, proposed_name_1: e.target.value })}
        />
      </FField>
      <FField label="Proposed Business Name 2">
        <FInput
          placeholder="e.g. GreenPath Solutions Limited"
          value={data.proposed_name_2 || ""}
          onChange={(e) => onChange({ ...data, proposed_name_2: e.target.value })}
        />
      </FField>
      <FField label="Nature of Business" required error={errors.business_nature}>
        <textarea
          placeholder="Brief description of your business activities e.g. Technology consulting, retail trading, food production..."
          value={data.business_nature || ""}
          onChange={(e) => onChange({ ...data, business_nature: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm text-white border outline-none transition-all duration-200 resize-none placeholder-[#6B7280]"
          style={{ ...baseStyle, colorScheme: "dark" as const }}
          {...focusFns}
        />
      </FField>
      <StepNav onBack={onBack} onNext={() => { if (validate()) onNext(); }} />
    </div>
  );
}

function NGStep3({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: Partial<NigeriaRegistrationData>;
  onChange: (d: Partial<NigeriaRegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof NigeriaRegistrationData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [k]: e.target.value });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.proprietor_full_name?.trim()) e.proprietor_full_name = "Full name is required";
    if (!data.proprietor_dob) e.proprietor_dob = "Date of birth is required";
    if (!data.proprietor_email?.trim()) e.proprietor_email = "Email is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="flex flex-col gap-5">
      <MiniStepIndicator steps={NG_STEPS} current={2} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FField label="Full Name" required error={errors.proprietor_full_name}>
          <FInput
            placeholder="Emeka Okafor"
            value={data.proprietor_full_name || ""}
            onChange={set("proprietor_full_name")}
          />
        </FField>
        <FField label="Date of Birth" required error={errors.proprietor_dob}>
          <FInput
            type="date"
            value={data.proprietor_dob || ""}
            onChange={set("proprietor_dob")}
            style={{ ...baseStyle, colorScheme: "dark" as const }}
          />
        </FField>
        <FField label="Phone Number">
          <FInput
            placeholder="+234 801 234 5678"
            value={data.proprietor_phone || ""}
            onChange={set("proprietor_phone")}
          />
        </FField>
        <FField label="Email Address" required error={errors.proprietor_email}>
          <FInput
            type="email"
            placeholder="emeka@business.com"
            value={data.proprietor_email || ""}
            onChange={set("proprietor_email")}
          />
        </FField>
        <FField label="Residential Address">
          <FInput
            placeholder="15 Allen Avenue, Ikeja"
            value={data.proprietor_address || ""}
            onChange={set("proprietor_address")}
          />
        </FField>
      </div>
      <StepNav onBack={onBack} onNext={() => { if (validate()) onNext(); }} />
    </div>
  );
}

function NGStep4({
  data,
  onChange,
  onSubmit,
  onBack,
  isSubmitting,
}: {
  data: Partial<NigeriaRegistrationData>;
  onChange: (d: Partial<NigeriaRegistrationData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <MiniStepIndicator steps={NG_STEPS} current={3} />
      {/* Summary */}
      <div
        className="rounded-2xl border p-4 flex flex-col gap-3"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.green }}>
          Application Summary
        </div>
        {[
          { label: "Business Type", value: data.business_type?.replace(/_/g, " ").toUpperCase() },
          { label: "Proposed Name", value: data.proposed_name_1 },
          { label: "Proprietor", value: data.proprietor_full_name },
          { label: "Email", value: data.proprietor_email },
        ]
          .filter((r) => r.value)
          .map((row) => (
            <div key={row.label} className="flex justify-between text-xs">
              <span style={{ color: BRAND.muted }}>{row.label}</span>
              <span className="text-white font-medium text-right max-w-[55%] truncate">
                {row.value}
              </span>
            </div>
          ))}
      </div>
      <FField label="Business Address in Nigeria">
        <FInput
          placeholder="15 Allen Avenue, Ikeja"
          value={data.registered_address || ""}
          onChange={(e) => onChange({ ...data, registered_address: e.target.value })}
        />
      </FField>
      <FField label="State">
        <FSelect
          value={data.state || ""}
          onChange={(e) => onChange({ ...data, state: e.target.value })}
        >
          <option value="" style={{ backgroundColor: "#0f1e3a" }}>
            Select state...
          </option>
          {NG_STATES.map((s) => (
            <option key={s} value={s} style={{ backgroundColor: "#0f1e3a" }}>
              {s}
            </option>
          ))}
        </FSelect>
      </FField>
      <FFileUpload
        label="Valid ID"
        hint="Upload international passport, NIN slip, or driver's licence (PDF/JPG/PNG)"
        uploaded={!!data.id_uploaded}
        onChange={(v) => onChange({ ...data, id_uploaded: v })}
      />
      <FFileUpload
        label="Memorandum & Articles of Association"
        hint="Required for LLC — upload your document or AccuBridge can generate a template"
        uploaded={!!data.memorandum_uploaded}
        onChange={(v) => onChange({ ...data, memorandum_uploaded: v })}
      />
      <FToggle
        label="Registration Fee Payment Confirmed"
        hint="CAC fees vary by business type — payment reference required"
        checked={!!data.payment_confirmed}
        onChange={(v) => onChange({ ...data, payment_confirmed: v })}
      />
      <div
        className="rounded-xl border p-3 text-xs"
        style={{
          backgroundColor: `${BRAND.green}08`,
          borderColor: `${BRAND.green}20`,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        🇳🇬 CAC processing time:{" "}
        <strong style={{ color: BRAND.green }}>3–10 business days</strong> ·
        AccuBridge will track status in real-time and notify you of any updates
      </div>
      <StepNav isLast onBack={onBack} onNext={onSubmit} isLoading={isSubmitting} />
    </div>
  );
}

// ── Structure / type mappings ──────────────────────────────────────────────────

const UK_STRUCTURE_API_MAP: Record<string, string> = {
  private_limited: "LimitedCompany",
  llp: "LimitedLiabilityPartnership",
  sole_trader: "SoleTrader",
  partnership: "Partnership",
  community_interest: "Other",
};

const NG_TYPE_API_MAP: Record<string, string> = {
  business_name: "Business Name",
  limited_liability: "Private Limited Company",
  incorporated_trustee: "Incorporated Trustee",
  unlimited_company: "Unlimited Company",
};

// ── Main sheet component ────────────────────────────────────────────────────────
interface NewRegistrationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  editRegistration?: BusinessRegistration | null;
}

export function NewRegistrationSheet({
  isOpen,
  onClose,
  onComplete,
  editRegistration,
}: NewRegistrationSheetProps) {
  const [country, setCountry] = useState<RegistrationCountry | null>(
    editRegistration?.country || null
  );
  const [step, setStep] = useState(
    editRegistration ? Math.max(0, editRegistration.current_step - 1) : 0
  );
  const [ukData, setUkData] = useState<Partial<UKRegistrationData>>(
    editRegistration?.uk_data || {}
  );
  const [ngData, setNgData] = useState<Partial<NigeriaRegistrationData>>(
    editRegistration?.nigeria_data || {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [createRegistration] = useCreateBusinessRegistrationMutation();
  const [updateUK] = useUpdateUKRegistrationMutation();
  const [updateNG] = useUpdateNGRegistrationMutation();
  const [submitRegistration] = useSubmitBusinessRegistrationMutation();
  const [saveDraftRegistration] = useSaveDraftBusinessRegistrationMutation();

  // Sync state whenever the sheet opens (handles resume / switching registrations)
  useEffect(() => {
    if (isOpen) {
      setCountry(editRegistration?.country || null);
      setStep(editRegistration ? Math.max(0, editRegistration.current_step - 1) : 0);
      setUkData(editRegistration?.uk_data || {});
      setNgData(editRegistration?.nigeria_data || {});
      setDraftSaved(false);
      setApiError(null);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setCountry(null);
    setStep(0);
    setUkData({});
    setNgData({});
    setDraftSaved(false);
    setApiError(null);
    onClose();
  };

  // ── Shared: get or create the API registration ID ──────────────────────────
  const getOrCreateId = async (jurisdiction: number): Promise<number | null> => {
    if (editRegistration?.id) return Number(editRegistration.id);
    try {
      const created = await createRegistration({ jurisdiction }).unwrap();
      return created.id;
    } catch {
      setApiError("Failed to create registration. Please try again.");
      return null;
    }
  };

  // ── Build UK payload from collected form data ──────────────────────────────
  const buildUKPayload = (currentStep: number): UpdateUKRegistrationInput => ({
    step: currentStep,
    structure: ukData.business_structure
      ? UK_STRUCTURE_API_MAP[ukData.business_structure] ?? undefined
      : undefined,
    businessName: ukData.proposed_company_name || undefined,
    alternativeName: ukData.alternative_name || undefined,
    registeredAddress: ukData.registered_address || undefined,
    city: ukData.city || undefined,
    postcode: ukData.postcode || undefined,
    sicCode: ukData.sic_code || undefined,
    directorFullName: ukData.director_full_name || undefined,
    directorNationality: ukData.director_nationality || undefined,
    directorDateOfBirth: ukData.director_dob || undefined,
    shareCapital: ukData.share_capital ? Number(ukData.share_capital) : undefined,
    numberOfShares: ukData.number_of_shares ? Number(ukData.number_of_shares) : undefined,
    modelArticles: ukData.agree_model_articles,
    confirmationStatement: ukData.confirmation_statement,
  });

  // ── Build NG payload from collected form data ──────────────────────────────
  const buildNGPayload = (currentStep: number): UpdateNGRegistrationInput => ({
    step: currentStep,
    businessType: ngData.business_type
      ? NG_TYPE_API_MAP[ngData.business_type] ?? undefined
      : undefined,
    proposedName1: ngData.proposed_name_1 || undefined,
    proposedName2: ngData.proposed_name_2 || undefined,
    natureOfBusiness: ngData.business_nature || undefined,
    proprietorFullName: ngData.proprietor_full_name || undefined,
    proprietorDateOfBirth: ngData.proprietor_dob || undefined,
    proprietorPhone: ngData.proprietor_phone || undefined,
    proprietorEmail: ngData.proprietor_email || undefined,
    residentialAddress: ngData.proprietor_address || undefined,
    state: ngData.state || undefined,
    businessAddress: ngData.registered_address || undefined,
    paymentConfirmed: ngData.payment_confirmed,
  });

  // ── Save Draft ─────────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!country) return;
    setIsSavingDraft(true);
    setApiError(null);
    try {
      const jurisdiction = country === "uk" ? 1 : 2;
      const id = await getOrCreateId(jurisdiction);
      if (!id) return;

      if (country === "uk") {
        await updateUK({ id, body: buildUKPayload(step + 1) }).unwrap();
      } else {
        await updateNG({ id, body: buildNGPayload(step + 1) }).unwrap();
      }
      await saveDraftRegistration(id).unwrap();

      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch {
      setApiError("Failed to save draft. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!country) return;
    setIsSubmitting(true);
    setApiError(null);
    try {
      const jurisdiction = country === "uk" ? 1 : 2;
      const id = await getOrCreateId(jurisdiction);
      if (!id) return;

      if (country === "uk") {
        await updateUK({ id, body: buildUKPayload(4) }).unwrap();
      } else {
        await updateNG({ id, body: buildNGPayload(4) }).unwrap();
      }
      await submitRegistration(id).unwrap();

      onComplete();
      handleClose();
    } catch {
      setApiError("Submission failed. Please check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sheetTitle = !country
    ? "New Business Registration"
    : country === "uk"
    ? "🇬🇧 UK Registration — Companies House"
    : "🇳🇬 Nigeria Registration — CAC";

  const sheetDescription = !country
    ? "Choose your registration jurisdiction to begin"
    : `Step ${step + 1} of 4 — ${country === "uk" ? UK_STEPS[step] : NG_STEPS[step]}`;

  return (
    <SystemSheet
      open={isOpen}
      onClose={handleClose}
      title={sheetTitle}
      description={sheetDescription}
      width={520}
      footer={country ? (
        <div className="flex flex-col gap-2">
          {apiError && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}
            >
              <span className="text-xs font-medium text-red-400">{apiError}</span>
            </div>
          )}
          {draftSaved && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ backgroundColor: `${BRAND.gold}12`, borderColor: `${BRAND.gold}30` }}
            >
              <BookmarkCheck size={13} style={{ color: BRAND.gold }} />
              <span className="text-xs font-medium" style={{ color: BRAND.gold }}>Draft saved — you can resume any time</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold border transition-all duration-200 disabled:opacity-50"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)", backgroundColor: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <BookmarkCheck size={14} />
            {isSavingDraft ? "Saving…" : "Save as Draft"}
          </button>
        </div>
      ) : undefined}
    >
      {/* Country select */}
      {!country && (
        <CountrySelectStep
          onSelect={(c) => {
            setCountry(c);
            setStep(0);
          }}
        />
      )}

      {/* UK flow */}
      {country === "uk" && step === 0 && (
        <UKStep1 data={ukData} onChange={setUkData} onNext={() => setStep(1)} />
      )}
      {country === "uk" && step === 1 && (
        <UKStep2
          data={ukData}
          onChange={setUkData}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {country === "uk" && step === 2 && (
        <UKStep3
          data={ukData}
          onChange={setUkData}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {country === "uk" && step === 3 && (
        <UKStep4
          data={ukData}
          onChange={setUkData}
          onSubmit={handleSubmit}
          onBack={() => setStep(2)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Nigeria flow */}
      {country === "nigeria" && step === 0 && (
        <NGStep1 data={ngData} onChange={setNgData} onNext={() => setStep(1)} />
      )}
      {country === "nigeria" && step === 1 && (
        <NGStep2
          data={ngData}
          onChange={setNgData}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {country === "nigeria" && step === 2 && (
        <NGStep3
          data={ngData}
          onChange={setNgData}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {country === "nigeria" && step === 3 && (
        <NGStep4
          data={ngData}
          onChange={setNgData}
          onSubmit={handleSubmit}
          onBack={() => setStep(2)}
          isSubmitting={isSubmitting}
        />
      )}
    </SystemSheet>
  );
}
