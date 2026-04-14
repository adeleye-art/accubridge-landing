export type VerificationStatus = "not_started" | "in_progress" | "pending" | "verified" | "failed";

// ── New section-score types (PDF spec) ──────────────────────────────────────
export type CheckStatus = "pass" | "fail" | "pending" | "review";
export type SourceType = "user_input" | "internal_logic" | "api";

export interface EvidenceCheck {
  label: string;
  status: CheckStatus;
  points: number;
  max: number;
  source: string;         // e.g. "Sumsub", "Companies House", "User upload"
  source_type: SourceType;
  detail?: string;        // human-readable context sentence
  checked_at: string;     // ISO timestamp
}

export interface SectionScore {
  earned: number;
  max: number;
  passed: string[];
  missing: string[];
  checks: EvidenceCheck[];
  action_label: string;   // CTA label e.g. "Verify Identity"
  action_type: "upload" | "connect" | "review" | "fix";
}

export interface ComplianceBreakdown {
  identity:     SectionScore;   // max 20
  registration: SectionScore;   // max 15
  tax:          SectionScore;   // max 15
  financial:    SectionScore;   // max 20
  risk:         SectionScore;   // max 15
  documents:    SectionScore;   // max 10
  behaviour:    SectionScore;   // max 5
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  action_type: "upload" | "connect" | "review" | "fix";
  priority: "high" | "medium" | "low";
  due_date?: string;
  section: keyof ComplianceBreakdown;
}
export type RiskLevel = "low" | "medium" | "high" | "very_high";
export type PassportStatus = "locked" | "not_generated" | "generated";
export type ComplianceStepId = "identity" | "company" | "risk" | "passport";

export interface ComplianceStep {
  id: ComplianceStepId;
  title: string;
  description: string;
  status: VerificationStatus | "locked" | "complete" | "calculating";
  actionLabel: string;
  isLocked: boolean;
}

export interface KYCData {
  full_name: string;
  dob: string;
  nationality: string;
  phone_number: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  country: "uk" | "nigeria";
  id_type: "passport" | "drivers_licence" | "national_id";
  id_number: string;
  id_expiry: string;
  id_document_url: string;
}

export interface CompanyVerification {
  business_name: string;
  registration_number: string;
  country: "uk" | "nigeria";
  verified_at?: string;
  companies_house_data?: {
    company_status: string;
    company_type: string;
    date_of_creation: string;
    registered_office: string;
  };
}

export interface RiskScore {
  score: number;
  level: RiskLevel;
  calculated_at: string;
  aml_status: "not_checked" | "clear" | "flagged" | "under_review";
  pep_flag: boolean;
  sanctions_flag: boolean;
  adverse_media_flag: boolean;
}

export interface CompliancePassport {
  passport_id: string;
  issued_at: string;
  expires_at: string;
  status: PassportStatus;
  verification_badges: {
    identity: boolean;
    company: boolean;
    tax: boolean;
    aml: boolean;
  };
  pdf_url?: string;
}

export interface MissingDocument {
  id: string;
  label: string;
  description: string;
  required: boolean;
  category: "identity" | "business" | "tax" | "compliance";
  uploaded?: boolean;
}

export interface ComplianceProfile {
  overall_status: "unverified" | "in_progress" | "verified";
  compliance_score: number;

  kyc_status: VerificationStatus;
  company_status: VerificationStatus;
  risk_calculated: boolean;
  passport_status: PassportStatus;

  kyc_data?: Partial<KYCData>;
  company_verification?: CompanyVerification;
  risk_score?: RiskScore;
  passport?: CompliancePassport;

  company_name: string;
  industry: string;
  business_type: string;
  operating_country: "uk" | "nigeria" | "both";

  missing_documents: MissingDocument[];
  last_reviewed?: string;
  reviewed_by?: string;
}
