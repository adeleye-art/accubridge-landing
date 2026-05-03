"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Smartphone, Globe, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/accubridge/shared/toast";
import { ConfirmDialog } from "@/components/accubridge/shared/confirm-dialog";
import {
  useGetActiveSessionsQuery,
  useSignOutAllDevicesMutation,
  ApiSession,
} from "@/lib/accubridge/api/authApi";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/lib/accubridge/api/notificationApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type Section = "profile" | "notifications" | "password" | "security";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "profile",       label: "Profile"       },
  { id: "notifications", label: "Notifications" },
  { id: "password",      label: "Password"      },
  { id: "security",      label: "Security"      },
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

function formatLastActive(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function DeviceIcon({ deviceType }: { deviceType: string }) {
  const isMobile = /mobile|phone|ios|android/i.test(deviceType);
  return isMobile ? <Smartphone size={16} /> : <Monitor size={16} />;
}

export default function StaffSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const { toast } = useToast();

  // Profile (no API endpoint — cosmetic)
  const [profile, setProfile] = useState({ name: "Mark Chen", email: "mark@accubridge.com", phone: "+44 7700 900123" });
  const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });

  // Notifications API
  const { data: apiPrefs } = useGetNotificationPreferencesQuery();
  const [updatePrefs, { isLoading: savingPrefs }] = useUpdateNotificationPreferencesMutation();
  const [notifs, setNotifs] = useState({ compliance_update: true, new_client_assigned: true, document_submitted: false });

  useEffect(() => {
    if (!apiPrefs) return;
    setNotifs({
      compliance_update:    apiPrefs.complianceAlert,
      new_client_assigned:  apiPrefs.newClientSignup,
      document_submitted:   apiPrefs.staffAction,
    });
  }, [apiPrefs]);

  // Sessions API
  const { data: sessionsRes, isLoading: sessionsLoading } = useGetActiveSessionsQuery();
  const [signOutAll, { isLoading: signingOut }] = useSignOutAllDevicesMutation();
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  const sessions: ApiSession[] = sessionsRes?.data ?? [];
  const otherSessions = sessions.filter((s) => !s.isCurrentDevice);

  const handleSave = () => toast({ title: "Settings saved", variant: "success" });

  const handleNotifsSave = async () => {
    try {
      await updatePrefs({
        complianceAlert:  notifs.compliance_update,
        newClientSignup:  notifs.new_client_assigned,
        staffAction:      notifs.document_submitted,
        fundingSubmitted: false,
      }).unwrap();
      toast({ title: "Notification preferences saved", variant: "success" });
    } catch {
      toast({ title: "Failed to save preferences", variant: "error" });
    }
  };

  const handlePasswordSave = () => {
    if (!passwords.current || !passwords.newPw) return;
    if (passwords.newPw !== passwords.confirm) { toast({ title: "Passwords do not match", variant: "error" }); return; }
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
                <button
                  type="button"
                  onClick={handleNotifsSave}
                  disabled={savingPrefs}
                  className="self-end px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-60"
                  style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
                >
                  {savingPrefs && <Loader2 size={13} className="animate-spin" />}
                  Save Preferences
                </button>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={15} style={{ color: BRAND.accent }} />
                    <h2 className="font-bold">Active Sessions</h2>
                  </div>
                  {otherSessions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setRevokeAllOpen(true)}
                      disabled={signingOut}
                      className="text-xs transition-colors duration-200 disabled:opacity-50"
                      style={{ color: "#ef4444" }}
                    >
                      Sign out all other devices
                    </button>
                  )}
                </div>

                {sessionsLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 size={14} className="animate-spin" style={{ color: BRAND.accent }} />
                    <span className="text-xs" style={{ color: BRAND.muted }}>Loading sessions…</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-xs" style={{ color: BRAND.muted }}>No active sessions found.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {sessions.map((sess) => (
                      <div key={sess.sessionId} className="flex items-center justify-between gap-4 p-3 rounded-xl border"
                        style={{
                          borderColor: sess.isCurrentDevice ? "rgba(6,214,160,0.2)" : "rgba(255,255,255,0.08)",
                          backgroundColor: sess.isCurrentDevice ? "rgba(6,214,160,0.05)" : "rgba(255,255,255,0.03)",
                        }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: sess.isCurrentDevice ? "rgba(6,214,160,0.15)" : "rgba(255,255,255,0.06)", color: sess.isCurrentDevice ? "#06D6A0" : BRAND.muted }}>
                            <DeviceIcon deviceType={sess.deviceType} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{sess.deviceType}</span>
                              {sess.isCurrentDevice && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
                                  style={{ backgroundColor: "rgba(6,214,160,0.15)", color: "#06D6A0" }}>
                                  <CheckCircle2 size={9} /> This device
                                </span>
                              )}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
                              {sess.browser} · {sess.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs" style={{ color: sess.isCurrentDevice ? "#06D6A0" : BRAND.muted }}>
                          {formatLastActive(sess.lastActiveAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <ConfirmDialog
                  open={revokeAllOpen}
                  onCancel={() => setRevokeAllOpen(false)}
                  onConfirm={async () => {
                    await signOutAll().unwrap();
                    setRevokeAllOpen(false);
                  }}
                  variant="danger"
                  title="Sign Out All Other Devices"
                  description="All sessions except this one will be immediately terminated. Other devices will need to log in again."
                  confirmLabel="Sign Out All"
                  cancelLabel="Cancel"
                />
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
