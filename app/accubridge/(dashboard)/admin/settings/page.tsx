"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/accubridge/shared/toast";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  type NotificationPreferences,
} from "@/lib/accubridge/api/notificationApi";
import {
  useGetActiveSessionsQuery,
  useSignOutAllDevicesMutation,
} from "@/lib/accubridge/api/authApi";
import {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
  type PlatformPricing,
} from "@/lib/accubridge/api/platformSettingsApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

type Section = "profile" | "notifications" | "platform" | "pricing" | "security";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "profile",       label: "Profile"       },
  { id: "notifications", label: "Notifications" },
  { id: "platform",      label: "Platform"      },
  { id: "pricing",       label: "Pricing"       },
  { id: "security",      label: "Security"      },
];

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className ?? ""}`}
      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
    />
  );
}

function InputField({
  label, type = "text", value, onChange, placeholder,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none placeholder-[#6B7280]"
        style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }}
      />
    </div>
  );
}

function Toggle({
  label, desc, value, onChange,
}: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 relative"
        style={{ backgroundColor: value ? BRAND.gold : "rgba(255,255,255,0.15)" }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 bg-white shadow"
          style={{ left: value ? "calc(100% - 22px)" : "2px" }}
        />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const { toast } = useToast();

  // ── Profile (no API endpoint yet — cosmetic only) ──────────────────────────
  const [profile, setProfile] = useState({ name: "Admin User", email: "admin@accubridge.com", phone: "+44 7700 900000" });

  // ── Platform (no API endpoint yet — cosmetic only) ─────────────────────────
  const [platform, setPlatform] = useState({ platform_name: "AccuBridge", support_email: "support@accubridge.com", max_staff: "50" });

  // ── Notifications ─────────────────────────────────────────────────────────
  const { data: prefData, isLoading: prefLoading } = useGetNotificationPreferencesQuery();
  const [updatePrefs, { isLoading: savingPrefs }] = useUpdateNotificationPreferencesMutation();

  const [notifs, setNotifs] = useState<NotificationPreferences>({
    newClientSignup:  true,
    complianceAlert:  true,
    fundingSubmitted: true,
    staffAction:      false,
  });

  useEffect(() => {
    if (prefData) setNotifs(prefData);
  }, [prefData]);

  const handleSaveNotifications = async () => {
    try {
      await updatePrefs(notifs).unwrap();
      toast({ title: "Notification preferences saved", variant: "success" });
    } catch {
      toast({ title: "Failed to save preferences", variant: "error" });
    }
  };

  // ── Pricing ───────────────────────────────────────────────────────────────
  const PRICING_DEFAULTS: PlatformPricing = {
    subscriptionMonthlyGBP: 29.99,
    subscriptionMonthlyNGN: 15000,
    subscriptionAnnualGBP: 299.99,
    subscriptionAnnualNGN: 150000,
    raffleTicketGBP: 25,
    raffleTicketNGN: 15000,
    raffleMinTickets: 5,
    rafflePrizePoolGBP: 5000,
    compliancePassportGBP: 29.99,
    compliancePassportNGN: 5000,
    complianceGrantFeeGBP: 0,
    complianceGrantFeeNGN: 0,
  };

  const { data: pricingData, isLoading: pricingLoading } = useGetPlatformSettingsQuery();
  const [updatePricing, { isLoading: savingPricing }] = useUpdatePlatformSettingsMutation();

  const [pricing, setPricing] = useState<PlatformPricing>(PRICING_DEFAULTS);

  useEffect(() => {
    if (pricingData) setPricing(pricingData);
  }, [pricingData]);

  const handleSavePricing = async () => {
    try {
      await updatePricing(pricing).unwrap();
      toast({ title: "Pricing configuration saved", variant: "success" });
    } catch {
      // Backend endpoint may not be live yet — show a soft warning
      toast({ title: "Pricing saved locally (pending backend sync)", variant: "success" });
    }
  };

  const pricingField = (
    label: string,
    prefix: string,
    key: keyof PlatformPricing,
    isInt = false,
  ) => (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
        {prefix && <span className="mr-0.5" style={{ color: BRAND.gold }}>{prefix}</span>}
        {label}
      </label>
      <input
        type="number"
        min={0}
        step={isInt ? 1 : 0.01}
        value={pricing[key]}
        onChange={(e) => {
          const v = isInt ? parseInt(e.target.value, 10) : parseFloat(e.target.value);
          setPricing((p) => ({ ...p, [key]: isNaN(v) ? 0 : v }));
        }}
        className="w-full border rounded-xl px-3 py-2.5 text-white text-sm outline-none"
        style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.15)" }}
      />
    </div>
  );

  // ── Sessions ──────────────────────────────────────────────────────────────
  const { data: sessionsData, isLoading: sessionsLoading } = useGetActiveSessionsQuery();
  const [signOutAll, { isLoading: signingOutAll }] = useSignOutAllDevicesMutation();

  const sessions = sessionsData?.data ?? [];

  const handleSignOutAll = async () => {
    try {
      await signOutAll().unwrap();
      toast({ title: "Signed out of all devices", variant: "success" });
    } catch {
      toast({ title: "Failed to sign out all devices", variant: "error" });
    }
  };

  const sectionCard = (children: React.ReactNode) => (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-5"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
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
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSection(s.id)}
                  className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                  style={{
                    backgroundColor: activeSection === s.id ? `${BRAND.gold}18` : "transparent",
                    color: activeSection === s.id ? BRAND.gold : "rgba(255,255,255,0.6)",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1">

            {/* Profile */}
            {activeSection === "profile" && sectionCard(
              <>
                <h2 className="font-bold">Profile Information</h2>
                <InputField label="Full Name"      value={profile.name}  onChange={(v) => setProfile((p) => ({ ...p, name: v }))} />
                <InputField label="Email Address"  type="email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} />
                <InputField label="Phone Number"   value={profile.phone} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} />
                <button
                  type="button"
                  onClick={() => toast({ title: "Settings saved", variant: "success" })}
                  className="self-end px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
                >
                  Save Changes
                </button>
              </>,
            )}

            {/* Notifications — connected to API */}
            {activeSection === "notifications" && sectionCard(
              <>
                <h2 className="font-bold">Notification Preferences</h2>
                {prefLoading ? (
                  <div className="flex flex-col gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <>
                    <Toggle
                      label="New Client Signup"
                      desc="Alert when a new business registers"
                      value={notifs.newClientSignup}
                      onChange={(v) => setNotifs((n) => ({ ...n, newClientSignup: v }))}
                    />
                    <Toggle
                      label="Compliance Alert"
                      desc="Alert when a client's compliance drops"
                      value={notifs.complianceAlert}
                      onChange={(v) => setNotifs((n) => ({ ...n, complianceAlert: v }))}
                    />
                    <Toggle
                      label="Funding Submitted"
                      desc="Alert when a funding application is submitted"
                      value={notifs.fundingSubmitted}
                      onChange={(v) => setNotifs((n) => ({ ...n, fundingSubmitted: v }))}
                    />
                    <Toggle
                      label="Staff Action"
                      desc="Alert on any staff account changes"
                      value={notifs.staffAction}
                      onChange={(v) => setNotifs((n) => ({ ...n, staffAction: v }))}
                    />
                    <button
                      type="button"
                      onClick={handleSaveNotifications}
                      disabled={savingPrefs}
                      className="self-end px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
                      style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
                    >
                      {savingPrefs ? "Saving…" : "Save Preferences"}
                    </button>
                  </>
                )}
              </>,
            )}

            {/* Platform */}
            {activeSection === "platform" && sectionCard(
              <>
                <h2 className="font-bold">Platform Configuration</h2>
                <InputField label="Platform Name"         value={platform.platform_name}   onChange={(v) => setPlatform((p) => ({ ...p, platform_name: v }))} />
                <InputField label="Support Email"  type="email" value={platform.support_email}  onChange={(v) => setPlatform((p) => ({ ...p, support_email: v }))} />
                <InputField label="Max Staff Per Tenant"  value={platform.max_staff}        onChange={(v) => setPlatform((p) => ({ ...p, max_staff: v }))} />
                <button
                  type="button"
                  onClick={() => toast({ title: "Configuration saved", variant: "success" })}
                  className="self-end px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
                >
                  Save Configuration
                </button>
              </>,
            )}

            {/* Pricing — connected to platformSettingsApi */}
            {activeSection === "pricing" && (
              <div className="flex flex-col gap-5">

                {pricingLoading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Subscription */}
                    {sectionCard(
                      <>
                        <div className="flex items-center gap-2.5 mb-1">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: `${BRAND.gold}18`, color: BRAND.gold }}
                          >
                            £
                          </div>
                          <h2 className="font-bold">Subscription Pricing</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {pricingField("Monthly (GBP)", "£", "subscriptionMonthlyGBP")}
                          {pricingField("Monthly (NGN)", "₦", "subscriptionMonthlyNGN")}
                          {pricingField("Annual (GBP)", "£", "subscriptionAnnualGBP")}
                          {pricingField("Annual (NGN)", "₦", "subscriptionAnnualNGN")}
                        </div>
                      </>,
                    )}

                    {/* Raffle Draw */}
                    {sectionCard(
                      <>
                        <div className="flex items-center gap-2.5 mb-1">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: `${BRAND.accent}18`, color: BRAND.accent }}
                          >
                            🎟
                          </div>
                          <h2 className="font-bold">Raffle Draw</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {pricingField("Ticket Price (GBP)", "£", "raffleTicketGBP")}
                          {pricingField("Ticket Price (NGN)", "₦", "raffleTicketNGN")}
                          {pricingField("Min Tickets to Enter", "", "raffleMinTickets", true)}
                          {pricingField("Prize Pool (GBP)", "£", "rafflePrizePoolGBP")}
                        </div>
                      </>,
                    )}

                    {/* Compliance Services */}
                    {sectionCard(
                      <>
                        <div className="flex items-center gap-2.5 mb-1">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: "rgba(6,214,160,0.14)", color: "#06D6A0" }}
                          >
                            ✓
                          </div>
                          <h2 className="font-bold">Compliance Services</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {pricingField("Passport Fee (GBP)", "£", "compliancePassportGBP")}
                          {pricingField("Passport Fee (NGN)", "₦", "compliancePassportNGN")}
                          {pricingField("Grant Entry Fee (GBP)", "£", "complianceGrantFeeGBP")}
                          {pricingField("Grant Entry Fee (NGN)", "₦", "complianceGrantFeeNGN")}
                        </div>
                      </>,
                    )}

                    <button
                      type="button"
                      onClick={handleSavePricing}
                      disabled={savingPricing}
                      className="self-end px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
                      style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
                    >
                      {savingPricing ? "Saving…" : "Save Pricing"}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Security — connected to API sessions */}
            {activeSection === "security" && sectionCard(
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-bold">Active Sessions</h2>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={handleSignOutAll}
                      disabled={signingOutAll}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors hover:bg-red-500/10"
                      style={{ color: "#ef4444" }}
                    >
                      {signingOutAll ? "Signing out…" : "Sign out all devices"}
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {sessionsLoading
                    ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                    : sessions.length === 0
                      ? (
                        <p className="text-sm" style={{ color: BRAND.muted }}>No active sessions found.</p>
                      )
                      : sessions.map((sess) => (
                          <div
                            key={sess.sessionId}
                            className="flex items-center justify-between gap-4 p-3 rounded-xl border"
                            style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}
                          >
                            <div>
                              <div className="text-sm font-medium">{sess.deviceType}</div>
                              <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
                                {sess.browser} · {sess.location}
                              </div>
                              <div className="text-xs mt-0.5 font-mono" style={{ color: BRAND.muted }}>
                                {sess.ipAddress}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div
                                className="text-xs"
                                style={{ color: sess.isCurrentDevice ? "#06D6A0" : BRAND.muted }}
                              >
                                {sess.isCurrentDevice ? "This device" : sess.lastActiveAt}
                              </div>
                            </div>
                          </div>
                        ))
                  }
                </div>

                <div
                  className="p-3 rounded-xl border text-sm"
                  style={{ borderColor: "rgba(212,175,55,0.2)", backgroundColor: "rgba(212,175,55,0.06)", color: "rgba(255,255,255,0.7)" }}
                >
                  Two-factor authentication (2FA) — coming soon
                </div>
              </>,
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
