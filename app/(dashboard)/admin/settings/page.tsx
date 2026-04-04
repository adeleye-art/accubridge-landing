"use client";

import React, { useState } from "react";
import { useToast } from "@/components/shared/toast";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type Section = "profile" | "notifications" | "platform" | "security";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "profile",       label: "Profile"       },
  { id: "notifications", label: "Notifications" },
  { id: "platform",      label: "Platform"      },
  { id: "security",      label: "Security"      },
];

const SESSIONS = [
  { device: "MacBook Pro", browser: "Chrome 122",  location: "London, UK",    last_active: "Now"          },
  { device: "iPhone 15",   browser: "Safari 17",   location: "London, UK",    last_active: "2 hours ago"  },
];

function InputField({ label, type = "text", value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none placeholder-[#6B7280]"
        style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }} />
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>{desc}</div>
      </div>
      <button type="button" onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 relative"
        style={{ backgroundColor: value ? BRAND.gold : "rgba(255,255,255,0.15)" }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 bg-white shadow"
          style={{ left: value ? "calc(100% - 22px)" : "2px" }} />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const { toast } = useToast();

  // Profile
  const [profile, setProfile] = useState({ name: "Admin User", email: "admin@accubridge.com", phone: "+44 7700 900000" });

  // Notifications
  const [notifs, setNotifs] = useState({ new_client: true, compliance_alert: true, funding_submitted: true, staff_action: false });

  // Platform
  const [platform, setPlatform] = useState({ platform_name: "AccuBridge", support_email: "support@accubridge.com", max_staff: "50" });

  const handleSave = () => toast({ title: "Settings saved", variant: "success" });

  const sectionCard = (children: React.ReactNode) => (
    <div className="rounded-2xl border p-6 flex flex-col gap-5" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
      {children}
    </div>
  );

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Manage your account and platform preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left nav */}
          <div className="lg:w-52 flex-shrink-0">
            <div className="flex flex-row lg:flex-col gap-1">
              {SECTIONS.map((s) => (
                <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
                  className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                  style={{ backgroundColor: activeSection === s.id ? `${BRAND.gold}18` : "transparent", color: activeSection === s.id ? BRAND.gold : "rgba(255,255,255,0.6)" }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1">
            {activeSection === "profile" && sectionCard(
              <>
                <h2 className="font-bold">Profile Information</h2>
                <InputField label="Full Name" value={profile.name} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} />
                <InputField label="Email Address" type="email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} />
                <InputField label="Phone Number" value={profile.phone} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} />
                <button type="button" onClick={handleSave} className="self-end px-5 py-2.5 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Save Changes</button>
              </>
            )}

            {activeSection === "notifications" && sectionCard(
              <>
                <h2 className="font-bold">Notification Preferences</h2>
                <Toggle label="New Client Signup"       desc="Alert when a new business registers"           value={notifs.new_client}       onChange={(v) => setNotifs((n) => ({ ...n, new_client: v }))} />
                <Toggle label="Compliance Alert"        desc="Alert when a client's compliance drops"        value={notifs.compliance_alert} onChange={(v) => setNotifs((n) => ({ ...n, compliance_alert: v }))} />
                <Toggle label="Funding Submitted"       desc="Alert when a funding application is submitted" value={notifs.funding_submitted} onChange={(v) => setNotifs((n) => ({ ...n, funding_submitted: v }))} />
                <Toggle label="Staff Action"            desc="Alert on any staff account changes"            value={notifs.staff_action}     onChange={(v) => setNotifs((n) => ({ ...n, staff_action: v }))} />
                <button type="button" onClick={handleSave} className="self-end px-5 py-2.5 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Save Preferences</button>
              </>
            )}

            {activeSection === "platform" && sectionCard(
              <>
                <h2 className="font-bold">Platform Configuration</h2>
                <InputField label="Platform Name" value={platform.platform_name} onChange={(v) => setPlatform((p) => ({ ...p, platform_name: v }))} />
                <InputField label="Support Email" type="email" value={platform.support_email} onChange={(v) => setPlatform((p) => ({ ...p, support_email: v }))} />
                <InputField label="Max Staff Per Tenant" value={platform.max_staff} onChange={(v) => setPlatform((p) => ({ ...p, max_staff: v }))} />
                <button type="button" onClick={handleSave} className="self-end px-5 py-2.5 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Save Configuration</button>
              </>
            )}

            {activeSection === "security" && sectionCard(
              <>
                <h2 className="font-bold">Active Sessions</h2>
                <div className="flex flex-col gap-3">
                  {SESSIONS.map((sess, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
                      <div>
                        <div className="text-sm font-medium">{sess.device}</div>
                        <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>{sess.browser} · {sess.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs" style={{ color: i === 0 ? "#06D6A0" : BRAND.muted }}>{sess.last_active}</div>
                        {i !== 0 && (
                          <button type="button" className="text-xs mt-1" style={{ color: "#ef4444" }}>Revoke</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl border text-sm" style={{ borderColor: "rgba(212,175,55,0.2)", backgroundColor: "rgba(212,175,55,0.06)", color: "rgba(255,255,255,0.7)" }}>
                  Two-factor authentication (2FA) — coming soon
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
