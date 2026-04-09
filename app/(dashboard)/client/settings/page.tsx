"use client";

import React, { useState, useCallback } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsNav } from "./_components/settings-nav";
import { ProfileSection } from "./_components/profile-section";
import { BusinessSection } from "./_components/business-section";
import { BusinessData } from "./_components/business-section";
import { NotificationsSection } from "./_components/notifications-section";
import { PasswordSection } from "./_components/password-section";
import { SubscriptionSection } from "./_components/subscription-section";
import { SecuritySection } from "./_components/security-section";
import { SettingsSaveBar } from "./_components/settings-save-bar";
import { ToastBanner } from "./_components/toast-banner";
import {
  SettingsSection,
  ProfileSettings,
  NotificationSettings,
  SubscriptionInfo,
} from "@/types/settings";

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_PROFILE: ProfileSettings = {
  full_name: "Jane Okonkwo",
  email: "jane@apexsolutions.co.uk",
  phone: "+44 7700 900123",
  role: "Client — Business Owner",
  member_since: "2026-01-10",
};

const MOCK_BUSINESS: BusinessData = {
  business_name: "Apex Solutions Ltd",
  business_type: "private_limited",
  operating_country: "uk",
  registration_number: "15234789",
  owner_full_name: "Jane Okonkwo",
  owner_email: "jane@apexsolutions.co.uk",
  owner_phone: "+44 7700 900123",
  business_address: "123 Business Street",
  city: "London",
  postcode: "EC1A 1BB",
  tax_id: "1234567890",
  vat_registered: true,
  vat_number: "GB123456789",
  financial_year_end: "March",
};

const MOCK_NOTIFICATIONS: NotificationSettings = {
  email_master: true,
  email_compliance_alerts: true,
  email_funding_updates: true,
  email_transaction_alerts: false,
  email_report_ready: true,
  email_weekly_summary: true,
  email_marketing: false,
  inapp_master: true,
  inapp_compliance: true,
  inapp_transactions: true,
  inapp_funding: true,
};


const MOCK_SUBSCRIPTION: SubscriptionInfo = {
  plan: "standard",
  started_at: "2026-01-10",
  next_billing: "2026-04-10",
  amount: 69,
  status: "active",
};

// ── Section metadata ───────────────────────────────────────────────────────────
const SECTION_META: Record<
  SettingsSection,
  { title: string; subtitle: string }
> = {
  profile: {
    title: "Profile",
    subtitle: "Manage your personal information and account avatar",
  },
  business: {
    title: "Business Details",
    subtitle: "Update your company information and tax settings",
  },
  notifications: {
    title: "Notifications",
    subtitle: "Choose which alerts and updates you receive",
  },
  password: {
    title: "Change Password",
    subtitle: "Keep your account secure with a strong password",
  },
  subscription: {
    title: "Subscription",
    subtitle: "Manage your current plan and billing details",
  },
  security: {
    title: "Security",
    subtitle: "Active sessions, two-factor authentication, and more",
  },
};

// ── Page ───────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  // Editable state
  const [profile, setProfile] = useState<ProfileSettings>(MOCK_PROFILE);
  const [business, setBusiness] = useState<BusinessData>(MOCK_BUSINESS);
  const [notifications, setNotifs] =
    useState<NotificationSettings>(MOCK_NOTIFICATIONS);

  // Original snapshots for dirty detection
  const [origProfile] = useState<ProfileSettings>(MOCK_PROFILE);
  const [origBusiness] = useState<BusinessData>(MOCK_BUSINESS);
  const [origNotifs] = useState<NotificationSettings>(MOCK_NOTIFICATIONS);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Dirty checks
  const isProfileDirty =
    JSON.stringify(profile) !== JSON.stringify(origProfile);
  const isBusinessDirty =
    JSON.stringify(business) !== JSON.stringify(origBusiness);
  const isNotifsDirty =
    JSON.stringify(notifications) !== JSON.stringify(origNotifs);

  const isDirty =
    (activeSection === "profile" && isProfileDirty) ||
    (activeSection === "business" && isBusinessDirty) ||
    (activeSection === "notifications" && isNotifsDirty);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 900));
    setIsSaving(false);
    setToast({ message: "Settings saved successfully", type: "success" });
  };

  const handleDiscard = () => {
    if (activeSection === "profile") setProfile(origProfile);
    if (activeSection === "business") setBusiness(origBusiness);
    if (activeSection === "notifications") setNotifs(origNotifs);
  };

  const handlePasswordSave = useCallback(
    async (_current: string, _next: string) => {
      await new Promise((res) => setTimeout(res, 1000));
      setToast({ message: "Password updated successfully", type: "success" });
    },
    []
  );

  const meta = SECTION_META[activeSection];
  const showSaveBar = ["profile", "business", "notifications"].includes(
    activeSection
  );

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          badge="Client Dashboard"
          title="Settings"
          description="Manage your account, business details, and preferences"
        />

        {/* Toast */}
        {toast && (
          <ToastBanner
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}

        {/* Settings layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left nav */}
          <SettingsNav
            active={activeSection}
            onChange={(s) => setActiveSection(s)}
          />

          {/* Right content */}
          <div className="flex-1 min-w-0">
            {/* Section heading */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {meta.title}
              </h2>
              <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                {meta.subtitle}
              </p>
            </div>

            {/* Section content */}
            {activeSection === "profile" && (
              <ProfileSection data={profile} onChange={setProfile} />
            )}
            {activeSection === "business" && (
              <BusinessSection data={business} onChange={setBusiness} />
            )}
            {activeSection === "notifications" && (
              <NotificationsSection
                data={notifications}
                onChange={setNotifs}
              />
            )}
            {activeSection === "password" && (
              <PasswordSection onSave={handlePasswordSave} />
            )}
            {activeSection === "subscription" && (
              <SubscriptionSection subscription={MOCK_SUBSCRIPTION} />
            )}
            {activeSection === "security" && <SecuritySection />}

            {/* Sticky save bar */}
            {showSaveBar && (
              <SettingsSaveBar
                isDirty={isDirty}
                isSaving={isSaving}
                onSave={handleSave}
                onDiscard={handleDiscard}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
