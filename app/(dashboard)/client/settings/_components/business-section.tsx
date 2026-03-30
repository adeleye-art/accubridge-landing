"use client";

import React from "react";
import { Building2, FileText, MapPin } from "lucide-react";

const BRAND = { accent: "#3E92CC", gold: "#D4AF37", muted: "#6B7280" };

const inputBase =
  "w-full h-11 px-4 rounded-xl text-sm text-white border outline-none transition-all duration-200 placeholder-[#6B7280]";
const inputStyle = {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.1)",
};
const focusFns = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(62,146,204,0.6)";
    e.target.style.boxShadow = "0 0 0 3px rgba(62,146,204,0.12)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow = "none";
  },
};

function FField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: BRAND.muted }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function FInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={inputBase} style={inputStyle} {...focusFns} {...props} />
  );
}

function FSelect({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${inputBase} appearance-none cursor-pointer`}
      style={{ ...inputStyle, colorScheme: "dark" as const }}
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
        borderColor: checked ? `${BRAND.gold}30` : "rgba(255,255,255,0.08)",
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
        style={{
          backgroundColor: checked ? BRAND.gold : "rgba(255,255,255,0.12)",
        }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
          style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        />
      </div>
    </div>
  );
}

export interface BusinessData {
  business_name: string;
  business_type: string;
  operating_country: string;
  registration_number: string;
  owner_full_name: string;
  owner_email: string;
  owner_phone: string;
  business_address: string;
  city: string;
  postcode: string;
  tax_id: string;
  vat_registered: boolean;
  vat_number: string;
  financial_year_end: string;
}

interface BusinessSectionProps {
  data: BusinessData;
  onChange: (d: BusinessData) => void;
}

export function BusinessSection({ data, onChange }: BusinessSectionProps) {
  const set =
    (k: keyof BusinessData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...data, [k]: e.target.value });

  return (
    <div className="flex flex-col gap-6">
      {/* Business identity */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-5"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2">
          <Building2 size={15} style={{ color: BRAND.accent }} />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: BRAND.accent }}
          >
            Business Identity
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FField label="Business Name">
            <FInput
              placeholder="Apex Solutions Ltd"
              value={data.business_name || ""}
              onChange={set("business_name")}
            />
          </FField>
          <FField label="Business Type">
            <FSelect value={data.business_type || ""} onChange={set("business_type")}>
              <option value="sole_trader" style={{ backgroundColor: "#0f1e3a" }}>Sole Trader</option>
              <option value="private_limited" style={{ backgroundColor: "#0f1e3a" }}>Private Limited Company (Ltd)</option>
              <option value="llp" style={{ backgroundColor: "#0f1e3a" }}>LLP</option>
              <option value="partnership" style={{ backgroundColor: "#0f1e3a" }}>Partnership</option>
              <option value="charity" style={{ backgroundColor: "#0f1e3a" }}>Charity / Non-Profit</option>
            </FSelect>
          </FField>
          <FField label="Operating Country">
            <FSelect value={data.operating_country || ""} onChange={set("operating_country")}>
              <option value="uk" style={{ backgroundColor: "#0f1e3a" }}>🇬🇧 United Kingdom</option>
              <option value="nigeria" style={{ backgroundColor: "#0f1e3a" }}>🇳🇬 Nigeria</option>
              <option value="both" style={{ backgroundColor: "#0f1e3a" }}>🌍 Both UK & Nigeria</option>
            </FSelect>
          </FField>
          <FField label="Registration Number">
            <FInput
              placeholder="e.g. 15234789"
              value={data.registration_number || ""}
              onChange={set("registration_number")}
            />
          </FField>
        </div>
      </div>

      {/* Contact & address */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-5"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={15} style={{ color: BRAND.accent }} />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: BRAND.accent }}
          >
            Contact & Address
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FField label="Owner Full Name">
            <FInput
              placeholder="Jane Okonkwo"
              value={data.owner_full_name || ""}
              onChange={set("owner_full_name")}
            />
          </FField>
          <FField label="Owner Email">
            <FInput
              type="email"
              placeholder="jane@company.com"
              value={data.owner_email || ""}
              onChange={set("owner_email")}
            />
          </FField>
          <FField label="Owner Phone">
            <FInput
              type="tel"
              placeholder="+44 7700 900000"
              value={data.owner_phone || ""}
              onChange={set("owner_phone")}
            />
          </FField>
          <FField label="Registered Address">
            <FInput
              placeholder="123 Business Street"
              value={data.business_address || ""}
              onChange={set("business_address")}
            />
          </FField>
          <FField label="City">
            <FInput
              placeholder="London"
              value={data.city || ""}
              onChange={set("city")}
            />
          </FField>
          <FField label="Postcode / ZIP">
            <FInput
              placeholder="EC1A 1BB"
              value={data.postcode || ""}
              onChange={set("postcode")}
            />
          </FField>
        </div>
      </div>

      {/* Tax details */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-5"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2">
          <FileText size={15} style={{ color: BRAND.accent }} />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: BRAND.accent }}
          >
            Tax Information
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FField
            label={
              data.operating_country === "nigeria"
                ? "TIN — Tax Identification Number"
                : "UTR — Unique Taxpayer Reference"
            }
          >
            <FInput
              placeholder={
                data.operating_country === "nigeria"
                  ? "12345678-0001"
                  : "1234567890"
              }
              value={data.tax_id || ""}
              onChange={set("tax_id")}
            />
          </FField>
          <FField label="Financial Year End">
            <FSelect
              value={data.financial_year_end || ""}
              onChange={set("financial_year_end")}
            >
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December",
              ].map((m) => (
                <option key={m} value={m} style={{ backgroundColor: "#0f1e3a" }}>
                  {m}
                </option>
              ))}
            </FSelect>
          </FField>
        </div>
        <FToggle
          label="VAT Registered"
          hint={
            data.operating_country === "nigeria"
              ? "Registered for VAT with FIRS?"
              : "Registered for VAT with HMRC?"
          }
          checked={!!data.vat_registered}
          onChange={(v) => onChange({ ...data, vat_registered: v })}
        />
        {data.vat_registered && (
          <FField label="VAT Number">
            <FInput
              placeholder={
                data.operating_country === "nigeria"
                  ? "VAT-0012345"
                  : "GB123456789"
              }
              value={data.vat_number || ""}
              onChange={set("vat_number")}
            />
          </FField>
        )}
      </div>
    </div>
  );
}
