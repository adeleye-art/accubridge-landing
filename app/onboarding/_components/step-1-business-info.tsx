"use client";

import React, { useState } from "react";
import type { Step1Data } from "@/types/onboarding";
import { FormField, FormInput, FormSelect, StepNav } from "./form-primitives";

const BUSINESS_TYPES = [
  { value: "sole_trader",     label: "Sole Trader"           },
  { value: "limited_company", label: "Limited Company (Ltd)" },
  { value: "llp",             label: "LLP"                   },
  { value: "partnership",     label: "Partnership"           },
  { value: "charity",         label: "Charity / Non-Profit"  },
  { value: "other",           label: "Other"                 },
];

const COUNTRIES = [
  { value: "uk",      label: "🇬🇧 United Kingdom"  },
  { value: "nigeria", label: "🇳🇬 Nigeria"          },
  { value: "both",    label: "🌍 Both UK & Nigeria" },
];

const OPT = { backgroundColor: "#0f1e3a" };

interface Props {
  data: Partial<Step1Data>;
  onComplete: (data: Step1Data) => void;
}

export function Step1BusinessInfo({ data, onComplete }: Props) {
  const [form, setForm] = useState<Step1Data>({
    business_name:       data.business_name       ?? "",
    business_type:       data.business_type       ?? "",
    operating_country:   data.operating_country   ?? "",
    registration_number: data.registration_number ?? "",
    owner_full_name:     data.owner_full_name     ?? "",
    owner_email:         data.owner_email         ?? "",
    owner_phone:         data.owner_phone         ?? "",
    business_address:    data.business_address    ?? "",
    city:                data.city                ?? "",
    postcode:            data.postcode            ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Step1Data, string>>>({});

  const set = (k: keyof Step1Data) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e: typeof errors = {};
    if (!form.business_name.trim())   e.business_name     = "Business name is required";
    if (!form.business_type)          e.business_type     = "Please select a business type";
    if (!form.operating_country)      e.operating_country = "Please select where you operate";
    if (!form.owner_full_name.trim()) e.owner_full_name   = "Owner name is required";
    if (!form.owner_email.trim())     e.owner_email       = "Email is required";
    if (!form.owner_phone.trim())     e.owner_phone       = "Phone number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const sectionStyle = {
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  };

  const sectionLabel = {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "#3E92CC",
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Business details */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>Business Details</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Business Name" required error={errors.business_name} className="sm:col-span-2">
            <FormInput placeholder="e.g. Apex Foods Ltd" value={form.business_name} onChange={set("business_name")} />
          </FormField>
          <FormField label="Business Type" required error={errors.business_type}>
            <FormSelect value={form.business_type} onChange={set("business_type")}>
              <option value="" style={OPT}>Select type…</option>
              {BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value} style={OPT}>{t.label}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Where do you operate?" required error={errors.operating_country}>
            <FormSelect value={form.operating_country} onChange={set("operating_country")}>
              <option value="" style={OPT}>Select country…</option>
              {COUNTRIES.map((c) => <option key={c.value} value={c.value} style={OPT}>{c.label}</option>)}
            </FormSelect>
          </FormField>
          <FormField
            label="Registration Number"
            className="sm:col-span-2"
            hint={form.operating_country === "nigeria" ? "CAC registration number" : "Companies House number (optional)"}
          >
            <FormInput
              placeholder={form.operating_country === "nigeria" ? "e.g. RC1234567" : "e.g. 12345678"}
              value={form.registration_number}
              onChange={set("registration_number")}
            />
          </FormField>
        </div>
      </div>

      {/* Owner details */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>Owner / Director Details</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required error={errors.owner_full_name} className="sm:col-span-2">
            <FormInput placeholder="e.g. Jane Okonkwo" value={form.owner_full_name} onChange={set("owner_full_name")} />
          </FormField>
          <FormField label="Email Address" required error={errors.owner_email}>
            <FormInput type="email" placeholder="jane@company.com" value={form.owner_email} onChange={set("owner_email")} />
          </FormField>
          <FormField label="Phone Number" required error={errors.owner_phone}>
            <FormInput type="tel" placeholder="+44 7700 900000" value={form.owner_phone} onChange={set("owner_phone")} />
          </FormField>
        </div>
      </div>

      {/* Address */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>Business Address</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Street Address" className="sm:col-span-2">
            <FormInput placeholder="123 Business Street" value={form.business_address} onChange={set("business_address")} />
          </FormField>
          <FormField label="City">
            <FormInput placeholder="London" value={form.city} onChange={set("city")} />
          </FormField>
          <FormField label="Postcode / Zip">
            <FormInput placeholder="EC1A 1BB" value={form.postcode} onChange={set("postcode")} />
          </FormField>
        </div>
      </div>

      <StepNav isFirstStep onContinue={() => { if (validate()) onComplete(form); }} />
    </div>
  );
}
