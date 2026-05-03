export type SettingsSection =
  | "profile"
  | "business"
  | "notifications"
  | "password"
  | "subscription"
  | "security";

export interface ProfileSettings {
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  role: string;
  member_since: string;
}

export interface NotificationSettings {
  // Email
  email_master: boolean;
  email_compliance_alerts: boolean;
  email_funding_updates: boolean;
  email_transaction_alerts: boolean;
  email_report_ready: boolean;
  email_weekly_summary: boolean;
  email_marketing: boolean;
  // In-app
  inapp_master: boolean;
  inapp_compliance: boolean;
  inapp_transactions: boolean;
  inapp_funding: boolean;
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  last_active: string;
  is_current: boolean;
  browser: string;
}

export interface SubscriptionInfo {
  plan: "basic" | "standard" | "premium";
  started_at: string;
  next_billing: string;
  amount: number;
  status: "active" | "cancelled" | "past_due";
}
