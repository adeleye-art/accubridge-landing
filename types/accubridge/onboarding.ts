export type OnboardingStep = 1 | 2 | 3 | 4 | 5;
export type PlanType = "basic" | "standard" | "premium";
export type BusinessType =
  | "sole_trader"
  | "limited_company"
  | "llp"
  | "partnership"
  | "charity"
  | "other";
export type OperatingCountry = "uk" | "nigeria" | "both";

export interface Step1Data {
  business_name: string;
  business_type: BusinessType | "";
  operating_country: OperatingCountry | "";
  registration_number: string;
  owner_full_name: string;
  owner_email: string;
  owner_phone: string;
  business_address: string;
  city: string;
  postcode: string;
}

export interface Step2Data {
  tax_id: string;
  vat_registered: boolean;
  vat_number: string;
  payroll_required: boolean;
  employee_count: string;
  financial_year_end: string;
  accounting_basis: "cash" | "accrual" | "";
}

export interface Step3Data {
  selected_plan: PlanType | "";
}

export interface Step4Data {
  bank_connected: boolean;
  bank_name: string;
  statement_uploaded: boolean;
  statement_file_name: string;
  receipts_uploaded: boolean;
  receipts_count: number;
}

export interface Step5Data {
  id_uploaded: boolean;
  id_file_name: string;
  id_type: "passport" | "drivers_licence" | "national_id" | "";
  business_doc_uploaded: boolean;
  business_doc_file_name: string;
  business_doc_type: "certificate_of_incorporation" | "cac_certificate" | "vat_certificate" | "other" | "";
  terms_accepted: boolean;
}

export interface OnboardingProgress {
  current_step: OnboardingStep;
  completed_steps: OnboardingStep[];
  step1: Partial<Step1Data>;
  step2: Partial<Step2Data>;
  step3: Partial<Step3Data>;
  step4: Partial<Step4Data>;
  step5: Partial<Step5Data>;
  last_saved: string;
  onboarding_complete: boolean;
}

export const EMPTY_ONBOARDING: OnboardingProgress = {
  current_step: 1,
  completed_steps: [],
  step1: {},
  step2: { vat_registered: false, payroll_required: false },
  step3: {},
  step4: { bank_connected: false, statement_uploaded: false, receipts_uploaded: false, receipts_count: 0 },
  step5: { id_uploaded: false, business_doc_uploaded: false, terms_accepted: false },
  last_saved: "",
  onboarding_complete: false,
};
