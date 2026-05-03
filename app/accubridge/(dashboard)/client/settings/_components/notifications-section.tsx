"use client";

import React from "react";
import {
  Mail,
  Bell,
  Shield,
  Landmark,
  CreditCard,
  BarChart3,
  Megaphone,
} from "lucide-react";
import { NotificationSettings } from "@/types/accubridge/settings";

const BRAND = {
  accent: "#3E92CC",
  gold: "#D4AF37",
  green: "#06D6A0",
  muted: "#6B7280",
};

function Toggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
  icon,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 group"
      onClick={() => !disabled && onChange(!checked)}
      style={{
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span
            className="mt-0.5 flex-shrink-0"
            style={{ color: BRAND.muted }}
          >
            {icon}
          </span>
        )}
        <div>
          <p className="text-sm text-white font-medium group-hover:text-white/90">
            {label}
          </p>
          {hint && (
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {hint}
            </p>
          )}
        </div>
      </div>
      <div
        className="w-11 h-6 rounded-full relative flex-shrink-0 ml-4 transition-all duration-300"
        style={{
          backgroundColor: checked ? BRAND.gold : "rgba(255,255,255,0.12)",
        }}
      >
        <div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
          style={{ left: checked ? "calc(100% - 20px)" : "4px" }}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border p-5 flex flex-col"
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="flex items-center gap-2 mb-1 pb-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <span style={{ color: BRAND.accent }}>{icon}</span>
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: BRAND.accent }}
        >
          {title}
        </span>
      </div>
      <div
        className="divide-y"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {children}
      </div>
    </div>
  );
}

interface NotificationsSectionProps {
  data: NotificationSettings;
  onChange: (d: NotificationSettings) => void;
}

export function NotificationsSection({
  data,
  onChange,
}: NotificationsSectionProps) {
  const set = (k: keyof NotificationSettings) => (v: boolean) =>
    onChange({ ...data, [k]: v });

  return (
    <div className="flex flex-col gap-5">
      {/* Email notifications */}
      <Section title="Email Notifications" icon={<Mail size={15} />}>
        <Toggle
          label="Email Notifications"
          hint="Master switch — turns off all email notifications when disabled"
          checked={data.email_master}
          onChange={set("email_master")}
          icon={<Mail size={14} />}
        />
        <Toggle
          label="Compliance Alerts"
          hint="Notify me when my compliance score changes or action is required"
          checked={data.email_compliance_alerts}
          onChange={set("email_compliance_alerts")}
          disabled={!data.email_master}
          icon={<Shield size={14} />}
        />
        <Toggle
          label="Funding Updates"
          hint="Raffle draw results, grant applications, and investor responses"
          checked={data.email_funding_updates}
          onChange={set("email_funding_updates")}
          disabled={!data.email_master}
          icon={<Landmark size={14} />}
        />
        <Toggle
          label="Transaction Alerts"
          hint="Notify me when new transactions are added or reconciled"
          checked={data.email_transaction_alerts}
          onChange={set("email_transaction_alerts")}
          disabled={!data.email_master}
          icon={<CreditCard size={14} />}
        />
        <Toggle
          label="Report Ready"
          hint="Notify me when a new financial report is generated for my account"
          checked={data.email_report_ready}
          onChange={set("email_report_ready")}
          disabled={!data.email_master}
          icon={<BarChart3 size={14} />}
        />
        <Toggle
          label="Weekly Summary"
          hint="Every Monday — a snapshot of income, expenses, and compliance score"
          checked={data.email_weekly_summary}
          onChange={set("email_weekly_summary")}
          disabled={!data.email_master}
          icon={<Mail size={14} />}
        />
        <Toggle
          label="Product Updates & Tips"
          hint="New AccuBridge features, guides, and business tips"
          checked={data.email_marketing}
          onChange={set("email_marketing")}
          disabled={!data.email_master}
          icon={<Megaphone size={14} />}
        />
      </Section>

      {/* In-app notifications */}
      <Section title="In-App Notifications" icon={<Bell size={15} />}>
        <Toggle
          label="In-App Notifications"
          hint="Master switch for all in-app alerts and badges"
          checked={data.inapp_master}
          onChange={set("inapp_master")}
          icon={<Bell size={14} />}
        />
        <Toggle
          label="Compliance Alerts"
          hint="Banner alerts when your compliance score needs attention"
          checked={data.inapp_compliance}
          onChange={set("inapp_compliance")}
          disabled={!data.inapp_master}
          icon={<Shield size={14} />}
        />
        <Toggle
          label="Transaction Activity"
          hint="Real-time alerts for new transactions and reconciliation updates"
          checked={data.inapp_transactions}
          onChange={set("inapp_transactions")}
          disabled={!data.inapp_master}
          icon={<CreditCard size={14} />}
        />
        <Toggle
          label="Funding & Applications"
          hint="Updates on raffle draws, grant status, and pitch reviews"
          checked={data.inapp_funding}
          onChange={set("inapp_funding")}
          disabled={!data.inapp_master}
          icon={<Landmark size={14} />}
        />
      </Section>
    </div>
  );
}
