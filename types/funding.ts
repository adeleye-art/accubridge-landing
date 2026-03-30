export type FundingType = "raffle" | "compliance" | "investor";

export type ApplicationStatus =
  | "entered"
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "eligible"
  | "ineligible";

export interface FundingApplication {
  id: string;
  type: FundingType;
  title: string;
  submitted_at: string;
  status: ApplicationStatus;
  amount_requested?: number;
  amount_awarded?: number;
  raffle_id?: string;
  raffle_number?: number;
  entry_fee?: number;
  notes?: string;
  reference?: string;
}

export interface RaffleEntry {
  id: string;
  raffle_id: string;
  raffle_number: number;
  entry_date: string;
  draw_date: string;
  status: "active" | "drawn" | "won" | "not_won";
  entry_fee: number;
}

export interface ComplianceEligibility {
  months_active: number;
  compliance_score: number;
  min_months_required: number;
  min_score_required: number;
  is_eligible: boolean;
  checked_at: string;
}

export interface InvestorSubmission {
  id: string;
  pitch_deck_name: string;
  submitted_at: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  reviewer_notes?: string;
  meeting_scheduled?: string;
}

export interface FundingSummaryStats {
  total_applied: number;
  active_applications: number;
  total_awarded: number;
  raffle_entries: number;
}
