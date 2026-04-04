"use client";

import React, { useState } from "react";
import { useToast } from "@/components/shared/toast";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type Section = "profile" | "notifications" | "password" | "security";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "profile",       label: "Profile"       },
  { id: "notifications", label: "Notifications" },
  { id: "password",      label: "Password"      },
  { id: "security",      label: "Security"      },
];

const SESSIONS = [
  { device: "MacBook Air",  browser: "Chrome 122", location: "Lagos, Nigeria", last_active: "Now"         },
  { device: "Android Phone",browser: "Firefox 124",location: "Lagos, Nigeria", last_active: "1 hour ago" },
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

export default function StaffSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const { toast } = useToast();

  const [profile, setProfile] = useState({ name: "Mark Chen", email: "mark@accubridge.com", phone: "+44 7700 900123" });
  const [notifs, setNotifs]   = useState({ compliance_update: true, new_client_assigned: true, document_submitted: false });
  const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });

  const handleSave = () => toast({ title: "Settings saved", variant: "success" });

  const handlePasswordSave = () => {
    if (!passwords.current || !passwords.newPw) return;
    if (passwords.newPw !== passwords.confirm) { toast({ title: "Passwords do not match", variant: "success" }); return; }
    toast({ title: "Password updated", variant: "success" });
    setPasswords({ current: "", newPw: "", confirm: "" });
  };

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
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Staff</div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Manage your profile and account preferences.</p>
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
                <InputField label="Full Name"     value={profile.name}  onChange={(v) => setProfile((p) => ({ ...p, name: v }))}  />
                <InputField label="Email Address" type="email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} />
                <InputField label="Phone Number"  value={profile.phone} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} />
                <button type="button" onClick={handleSave} className="self-end px-5 py-2.5 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Save Changes</button>
              </>
            )}

            {activeSection === "notifications" && sectionCard(
              <>
                <h2 className="font-bold">Notification Preferences</h2>
                <Toggle label="Compliance Update"      desc="Alert when a client's compliance changes"     value={notifs.compliance_update}    onChange={(v) => setNotifs((n) => ({ ...n, compliance_update: v }))} />
                <Toggle label="New Client Assigned"    desc="Alert when you are assigned a new client"     value={notifs.new_client_assigned}  onChange={(v) => setNotifs((n) => ({ ...n, new_client_assigned: v }))} />
                <Toggle label="Document Submitted"     desc="Alert when a client submits a document"       value={notifs.document_submitted}   onChange={(v) => setNotifs((n) => ({ ...n, document_submitted: v }))} />
                <button type="button" onClick={handleSave} className="self-end px-5 py-2.5 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Save Preferences</button>
              </>
            )}

            {activeSection === "password" && sectionCard(
              <>
                <h2 className="font-bold">Change Password</h2>
                <InputField label="Current Password" type="password" value={passwords.current}  onChange={(v) => setPasswords((p) => ({ ...p, current: v }))}  placeholder="••••••••" />
                <InputField label="New Password"      type="password" value={passwords.newPw}    onChange={(v) => setPasswords((p) => ({ ...p, newPw: v }))}    placeholder="••••••••" />
                <InputField label="Confirm Password"  type="password" value={passwords.confirm}  onChange={(v) => setPasswords((p) => ({ ...p, confirm: v }))}  placeholder="••••••••" />
                <button type="button" onClick={handlePasswordSave} className="self-end px-5 py-2.5 rounded-xl text-sm font-bold" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>Update Password</button>
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
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
