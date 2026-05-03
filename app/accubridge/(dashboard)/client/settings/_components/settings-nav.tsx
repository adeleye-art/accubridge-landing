"use client";

import React from "react";
import { User, Building2, Bell, Lock, CreditCard, Shield } from "lucide-react";
import { SettingsSection } from "@/types/accubridge/settings";

const BRAND = {
  gold: "#D4AF37",
  muted: "#6B7280",
};

const NAV_ITEMS: {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  { id: "profile",       label: "Profile",          icon: <User size={16} />,       description: "Name, email, avatar"    },
  { id: "business",      label: "Business Details", icon: <Building2 size={16} />,  description: "Company info & tax"     },
  { id: "notifications", label: "Notifications",    icon: <Bell size={16} />,       description: "Alerts & preferences"   },
  { id: "password",      label: "Change Password",  icon: <Lock size={16} />,       description: "Update your password"   },
  { id: "subscription",  label: "Subscription",     icon: <CreditCard size={16} />, description: "Plan & billing"         },
  { id: "security",      label: "Security",         icon: <Shield size={16} />,     description: "Sessions & 2FA"         },
];

interface SettingsNavProps {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}

export function SettingsNav({ active, onChange }: SettingsNavProps) {
  return (
    <>
      {/* Desktop vertical rail */}
      <nav className="hidden md:flex flex-col w-52 flex-shrink-0 gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 border-l-2"
              style={{
                backgroundColor: isActive ? `${BRAND.gold}12` : "transparent",
                borderLeftColor: isActive ? BRAND.gold : "transparent",
                color: isActive ? BRAND.gold : "rgba(255,255,255,0.55)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                }
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{item.label}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Mobile select */}
      <div className="md:hidden mb-5">
        <select
          value={active}
          onChange={(e) => onChange(e.target.value as SettingsSection)}
          className="w-full h-11 px-4 rounded-xl text-sm text-white border outline-none appearance-none"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            borderColor: "rgba(255,255,255,0.1)",
            colorScheme: "dark",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <option key={item.id} value={item.id} style={{ backgroundColor: "#0f1e3a" }}>
              {item.label} — {item.description}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
