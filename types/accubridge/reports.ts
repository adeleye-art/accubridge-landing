export type ReportPeriod =
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "this_year"
  | "last_year"
  | "custom";

export interface ReportDateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

export interface LineItem {
  label: string;
  amount: number;
}

export interface LineItemGroup {
  title: string;
  totalLabel: string;
  total: number;
  items: LineItem[];
}

/* ── Profit & Loss ── */
export interface PnLReport {
  income: LineItemGroup;
  expenses: LineItemGroup;
  net_profit: number;
  net_margin_percent: number;
  period_label: string;
  reviewed_by?: string;
}

/* ── Balance Sheet ── */
export interface AssetSection {
  current: LineItemGroup;
  non_current: LineItemGroup;
  total_assets: number;
}

export interface LiabilitySection {
  current: LineItemGroup;
  non_current: LineItemGroup;
  total_liabilities: number;
}

export interface EquitySection {
  items: LineItem[];
  total_equity: number;
}

export interface BalanceSheetReport {
  assets: AssetSection;
  liabilities: LiabilitySection;
  equity: EquitySection;
  total_liabilities_and_equity: number;
  is_balanced: boolean;
  as_of_date: string;
  reviewed_by?: string;
}

/* ── Cash Flow ── */
export interface CashFlowSection {
  subtitle: string;
  totalLabel: string;
  total: number;
  items: LineItem[];
}

export interface CashFlowReport {
  opening_balance: number;
  operating: CashFlowSection;
  investing: CashFlowSection;
  financing: CashFlowSection;
  net_change: number;
  closing_balance: number;
  period_label: string;
  reviewed_by?: string;
}
