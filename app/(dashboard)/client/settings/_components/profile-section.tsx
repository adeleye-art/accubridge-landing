"use client";

import React, { useState, useRef } from "react";
import { Camera, User, Mail, Phone, Calendar, Tag } from "lucide-react";
import { ProfileSettings } from "@/types/settings";

const BRAND = {
  primary: "#0A2463",
  accent: "#3E92CC",
  gold: "#D4AF37",
  green: "#06D6A0",
  muted: "#6B7280",
};

const inputBase =
  "w-full h-11 px-4 rounded-xl text-sm text-white border outline-none transition-all duration-200 placeholder-[#6B7280]";
const inputStyle = {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderColor: "rgba(255,255,255,0.1)",
};
const focusFns = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(62,146,204,0.6)";
    e.target.style.boxShadow = "0 0 0 3px rgba(62,146,204,0.12)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow = "none";
  },
};

function FField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5"
        style={{ color: BRAND.muted }}
      >
        {icon && <span style={{ color: BRAND.muted }}>{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

interface ProfileSectionProps {
  data: ProfileSettings;
  onChange: (d: ProfileSettings) => void;
}

export function ProfileSection({ data, onChange }: ProfileSectionProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    data.avatar_url || null
  );
  const avatarRef = useRef<HTMLInputElement>(null);

  const set =
    (k: keyof ProfileSettings) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...data, [k]: e.target.value });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    onChange({ ...data, avatar_url: url });
  };

  const initials = data.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar upload */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: BRAND.accent }}
        >
          Profile Photo
        </div>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-2"
              style={{
                backgroundColor: avatarPreview
                  ? "transparent"
                  : `${BRAND.gold}20`,
                borderColor: `${BRAND.gold}40`,
              }}
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="text-xl font-bold"
                  style={{ color: BRAND.gold }}
                >
                  {initials}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 border-2"
              style={{
                backgroundColor: BRAND.gold,
                borderColor: "#0A2463",
                color: BRAND.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#c49b30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = BRAND.gold;
              }}
              aria-label="Change avatar"
            >
              <Camera size={13} />
            </button>
          </div>

          <div>
            <p className="text-sm text-white font-medium">
              {data.full_name || "Your Name"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
              {data.role}
            </p>
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="text-xs mt-2 transition-colors duration-200"
              style={{ color: BRAND.accent }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = BRAND.accent;
              }}
            >
              Upload new photo →
            </button>
          </div>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleAvatarChange}
          />
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          JPG, PNG or WebP · Max 5MB · Recommended 400×400px
        </p>
      </div>

      {/* Personal details */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-5"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: BRAND.accent }}
        >
          Personal Information
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FField label="Full Name" icon={<User size={13} />}>
            <input
              type="text"
              placeholder="Jane Okonkwo"
              value={data.full_name}
              onChange={set("full_name")}
              className={inputBase}
              style={inputStyle}
              {...focusFns}
            />
          </FField>

          <FField label="Email Address" icon={<Mail size={13} />}>
            <input
              type="email"
              placeholder="jane@company.com"
              value={data.email}
              onChange={set("email")}
              className={inputBase}
              style={inputStyle}
              {...focusFns}
            />
          </FField>

          <FField label="Phone Number" icon={<Phone size={13} />}>
            <input
              type="tel"
              placeholder="+44 7700 900000"
              value={data.phone}
              onChange={set("phone")}
              className={inputBase}
              style={inputStyle}
              {...focusFns}
            />
          </FField>
        </div>
      </div>

      {/* Read-only account info */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: BRAND.muted }}
        >
          Account Information
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: "Account Role",
              value: data.role,
              icon: <Tag size={13} />,
            },
            {
              label: "Member Since",
              value: new Date(data.member_since).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
              icon: <Calendar size={13} />,
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span
                className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                <span>{item.icon}</span>
                {item.label}
              </span>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
