"use client";

import React, { useState } from "react";
import {
  Lightbulb,
  Loader2,
  Sparkles,
  MapPin,
  Briefcase,
  DollarSign,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { AIIdeaInput } from "@/types/tools";

const BRAND = {
  primary: "#0A2463",
  accent: "#3E92CC",
  gold: "#D4AF37",
  muted: "#6B7280",
};

const INDUSTRIES = [
  "No preference",
  "Technology",
  "Finance & Fintech",
  "Healthcare",
  "Education",
  "Retail & E-commerce",
  "Food & Hospitality",
  "Agriculture",
  "Manufacturing",
  "Creative & Media",
  "Professional Services",
  "Real Estate",
];

interface IdeaInputFormProps {
  onGenerate: (input: AIIdeaInput) => Promise<void>;
  isGenerating: boolean;
}

const inputBase =
  "w-full px-4 py-3 rounded-xl text-sm text-white border outline-none transition-all duration-200 placeholder-[#6B7280]";
const inputStyle = {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.1)",
};
const focusHandlers = {
  onFocus: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    e.target.style.borderColor = "rgba(62,146,204,0.6)";
    e.target.style.boxShadow = "0 0 0 3px rgba(62,146,204,0.12)";
  },
  onBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow = "none";
  },
};

export function IdeaInputForm({ onGenerate, isGenerating }: IdeaInputFormProps) {
  const [form, setForm] = useState<AIIdeaInput>({
    skills: "",
    experience: "",
    location: "",
    capital: "",
    industry_preference: "",
  });
  const [error, setError] = useState("");

  const set =
    (k: keyof AIIdeaInput) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleGenerate = async () => {
    if (!form.skills.trim() || !form.location.trim() || !form.capital.trim()) {
      setError("Please fill in your skills, location, and available capital.");
      return;
    }
    setError("");
    await onGenerate(form);
  };

  const fields = [
    {
      key: "skills" as const,
      label: "Your Skills",
      placeholder: "e.g. marketing, software development, cooking, accounting",
      icon: <BookOpen size={15} />,
      required: true,
      hint: "List your top skills — the more specific, the better",
    },
    {
      key: "experience" as const,
      label: "Your Experience",
      placeholder:
        "e.g. 5 years in retail management, former teacher, self-taught developer",
      icon: <Briefcase size={15} />,
      required: false,
      hint: "Describe your work background or relevant experience",
    },
    {
      key: "location" as const,
      label: "Your Location",
      placeholder: "e.g. Lagos, Nigeria or London, UK",
      icon: <MapPin size={15} />,
      required: true,
      hint: "Your city and country — impacts market recommendations",
    },
    {
      key: "capital" as const,
      label: "Available Capital",
      placeholder: "e.g. £5,000 or ₦500,000",
      icon: <DollarSign size={15} />,
      required: true,
      hint: "The amount you can invest to start — be realistic",
    },
  ];

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-5"
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${BRAND.accent}18`, color: BRAND.accent }}
        >
          <Lightbulb size={20} />
        </div>
        <div>
          <h3 className="text-white font-bold text-base">
            Tell us about yourself
          </h3>
          <p className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
            The more detail you provide, the more tailored your ideas will be
          </p>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: BRAND.muted }}
            >
              <span className="flex items-center gap-1.5">
                <span style={{ color: BRAND.accent }}>{field.icon}</span>
                {field.label}
                {field.required && (
                  <span style={{ color: BRAND.gold }}>*</span>
                )}
              </span>
            </label>
            <input
              type="text"
              placeholder={field.placeholder}
              value={form[field.key]}
              onChange={set(field.key)}
              className={inputBase}
              style={inputStyle}
              {...focusHandlers}
            />
            <span
              className="text-[11px]"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {field.hint}
            </span>
          </div>
        ))}
      </div>

      {/* Industry preference */}
      <div className="flex flex-col gap-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: BRAND.muted }}
        >
          Industry Preference (optional)
        </label>
        <div className="relative">
          <select
            value={form.industry_preference}
            onChange={set("industry_preference")}
            className={`${inputBase} appearance-none cursor-pointer`}
            style={{ ...inputStyle, colorScheme: "dark" }}
            {...focusHandlers}
          >
            {INDUSTRIES.map((ind) => (
              <option
                key={ind}
                value={ind === "No preference" ? "" : ind}
                style={{ backgroundColor: "#0f1e3a" }}
              >
                {ind}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: BRAND.muted }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="text-sm text-red-400 px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            borderColor: "rgba(239,68,68,0.2)",
          }}
        >
          {error}
        </div>
      )}

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-sm font-bold transition-all duration-200"
        style={{
          backgroundColor: isGenerating ? `${BRAND.accent}60` : BRAND.accent,
          color: "#ffffff",
          cursor: isGenerating ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!isGenerating)
            e.currentTarget.style.backgroundColor = "#3480b8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isGenerating
            ? `${BRAND.accent}60`
            : BRAND.accent;
        }}
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating ideas...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate Business Ideas
          </>
        )}
      </button>
    </div>
  );
}
