import type {
  ReportPeriod,
  ReportDateRange,
  PnLReport,
  BalanceSheetReport,
  CashFlowReport,
} from "@/types/reports";

/* ─────────────────────────────── helpers ─────────────────────────────── */

export function getPeriodRange(period: ReportPeriod): ReportDateRange {
  const now   = new Date();
  const y     = now.getFullYear();
  const m     = now.getMonth(); // 0-based

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  switch (period) {
    case "this_month":
      return { from: fmt(new Date(y, m, 1)), to: fmt(now) };
    case "last_month":
      return { from: fmt(new Date(y, m - 1, 1)), to: fmt(new Date(y, m, 0)) };
    case "this_quarter": {
      const q = Math.floor(m / 3);
      return { from: fmt(new Date(y, q * 3, 1)), to: fmt(now) };
    }
    case "last_quarter": {
      const q = Math.floor(m / 3);
      const lq = q === 0 ? 3 : q - 1;
      const ly = q === 0 ? y - 1 : y;
      return { from: fmt(new Date(ly, lq * 3, 1)), to: fmt(new Date(ly, lq * 3 + 3, 0)) };
    }
    case "this_year":
      return { from: fmt(new Date(y, 0, 1)), to: fmt(now) };
    case "last_year":
      return { from: fmt(new Date(y - 1, 0, 1)), to: fmt(new Date(y - 1, 11, 31)) };
    default:
      return { from: fmt(new Date(y, m, 1)), to: fmt(now) };
  }
}

function periodLabel(range: ReportDateRange): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const from = new Date(range.from + "T00:00:00").toLocaleDateString("en-GB", opts);
  const to   = new Date(range.to   + "T00:00:00").toLocaleDateString("en-GB", opts);
  return `${from} – ${to}`;
}

// Tiny seed function so numbers vary per period but stay stable
function seed(range: ReportDateRange): number {
  const s = (range.from + range.to).replace(/-/g, "");
  return parseInt(s.slice(0, 8)) % 100;
}

/* ─────────────────────────────── P&L ─────────────────────────────────── */

export function calculatePnL(range: ReportDateRange): PnLReport {
  const v = seed(range);

  const incomeItems = [
    { label: "Consulting Revenue",  amount: 18_500 + v * 120 },
    { label: "Product Sales",       amount: 12_200 + v *  80 },
    { label: "Service Retainers",   amount:  8_750 + v *  50 },
    { label: "Other Income",        amount:  1_200 + v *  10 },
  ];

  const expenseItems = [
    { label: "Salaries & Wages",    amount: 14_000 + v *  30 },
    { label: "Rent & Facilities",   amount:  2_800              },
    { label: "Software & Tools",    amount:    980 + v *   5 },
    { label: "Marketing",           amount:  1_450 + v *  20 },
    { label: "Professional Fees",   amount:  1_200              },
    { label: "Insurance",           amount:    360              },
    { label: "Utilities",           amount:    290              },
    { label: "Travel & Subsistence",amount:    540 + v *   8 },
  ];

  const totalIncome   = incomeItems.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenseItems.reduce((s, i) => s + i.amount, 0);
  const netProfit     = totalIncome - totalExpenses;
  const margin        = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  return {
    income: {
      title:      "Income",
      totalLabel: "Total Income",
      total:      totalIncome,
      items:      incomeItems,
    },
    expenses: {
      title:      "Expenses",
      totalLabel: "Total Expenses",
      total:      totalExpenses,
      items:      expenseItems,
    },
    net_profit:          netProfit,
    net_margin_percent:  margin,
    period_label:        periodLabel(range),
    reviewed_by:         "Sarah Merchant, ACCA",
  };
}

/* ──────────────────────────── Balance Sheet ──────────────────────────── */

export function calculateBalanceSheet(asOfDate: string): BalanceSheetReport {
  const v = seed({ from: asOfDate, to: asOfDate });

  const currentAssets = [
    { label: "Cash & Cash Equivalents",  amount: 24_500 + v * 200 },
    { label: "Accounts Receivable",      amount: 11_200 + v * 100 },
    { label: "Inventory",                amount:  5_800 + v *  50 },
    { label: "Prepaid Expenses",         amount:  1_200              },
  ];

  const nonCurrentAssets = [
    { label: "Equipment (net of depreciation)", amount: 18_000 + v * 50 },
    { label: "Furniture & Fixtures",            amount:  3_200           },
    { label: "Intangible Assets",               amount:  2_500           },
  ];

  const currentLiabilities = [
    { label: "Accounts Payable",     amount: 6_400 + v * 40 },
    { label: "Accrued Expenses",     amount: 2_100           },
    { label: "VAT Payable",          amount: 1_850           },
    { label: "Short-term Loan",      amount: 5_000           },
  ];

  const nonCurrentLiabilities = [
    { label: "Long-term Bank Loan",  amount: 12_000 },
    { label: "Deferred Tax",         amount:    800 },
  ];

  const totalCurrentAssets      = currentAssets.reduce((s, i) => s + i.amount, 0);
  const totalNonCurrentAssets   = nonCurrentAssets.reduce((s, i) => s + i.amount, 0);
  const totalAssets             = totalCurrentAssets + totalNonCurrentAssets;

  const totalCurrentLiabilities    = currentLiabilities.reduce((s, i) => s + i.amount, 0);
  const totalNonCurrentLiabilities = nonCurrentLiabilities.reduce((s, i) => s + i.amount, 0);
  const totalLiabilities           = totalCurrentLiabilities + totalNonCurrentLiabilities;

  const shareCapital     = 10_000;
  const retainedEarnings = totalAssets - totalLiabilities - shareCapital;

  const equityItems = [
    { label: "Share Capital",        amount: shareCapital     },
    { label: "Retained Earnings",    amount: retainedEarnings },
  ];
  const totalEquity = shareCapital + retainedEarnings;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return {
    assets: {
      current:     { title: "Current Assets",     totalLabel: "Total Current Assets",     total: totalCurrentAssets,    items: currentAssets    },
      non_current: { title: "Non-Current Assets", totalLabel: "Total Non-Current Assets", total: totalNonCurrentAssets, items: nonCurrentAssets },
      total_assets: totalAssets,
    },
    liabilities: {
      current:     { title: "Current Liabilities",     totalLabel: "Total Current Liabilities",     total: totalCurrentLiabilities,    items: currentLiabilities    },
      non_current: { title: "Non-Current Liabilities", totalLabel: "Total Non-Current Liabilities", total: totalNonCurrentLiabilities, items: nonCurrentLiabilities },
      total_liabilities: totalLiabilities,
    },
    equity: { items: equityItems, total_equity: totalEquity },
    total_liabilities_and_equity: totalLiabilitiesAndEquity,
    is_balanced: isBalanced,
    as_of_date:  fmt(asOfDate),
    reviewed_by: "Sarah Merchant, ACCA",
  };
}

/* ──────────────────────────── Cash Flow ─────────────────────────────── */

export function calculateCashFlow(range: ReportDateRange): CashFlowReport {
  const v = seed(range);

  const openingBalance = 18_000 + v * 150;

  const operatingItems = [
    { label: "Net Profit for Period",       amount:  9_420 + v * 60 },
    { label: "Add: Depreciation",           amount:    850           },
    { label: "Decrease in Accounts Rec.",   amount:  1_200 + v * 20 },
    { label: "Increase in Accounts Pay.",   amount:    640           },
    { label: "Increase in Inventory",       amount: -1_100           },
    { label: "Tax Paid",                    amount: -2_200           },
  ];

  const investingItems = [
    { label: "Purchase of Equipment",       amount: -3_500 },
    { label: "Software Licences",           amount:   -480 },
    { label: "Proceeds from Asset Sale",    amount:    600 },
  ];

  const financingItems = [
    { label: "Loan Repayment",              amount: -2_000 },
    { label: "Capital Injection",           amount:  5_000 },
    { label: "Dividends Paid",              amount: -1_500 },
  ];

  const operatingTotal  = operatingItems.reduce((s, i) => s + i.amount, 0);
  const investingTotal  = investingItems.reduce((s, i) => s + i.amount, 0);
  const financingTotal  = financingItems.reduce((s, i) => s + i.amount, 0);
  const netChange       = operatingTotal + investingTotal + financingTotal;
  const closingBalance  = openingBalance + netChange;

  return {
    opening_balance: openingBalance,
    operating: {
      subtitle:   "cash from core business",
      totalLabel: "Net Cash from Operating Activities",
      total:      operatingTotal,
      items:      operatingItems,
    },
    investing: {
      subtitle:   "asset purchases & proceeds",
      totalLabel: "Net Cash from Investing Activities",
      total:      investingTotal,
      items:      investingItems,
    },
    financing: {
      subtitle:   "loans, equity & dividends",
      totalLabel: "Net Cash from Financing Activities",
      total:      financingTotal,
      items:      financingItems,
    },
    net_change:      netChange,
    closing_balance: closingBalance,
    period_label:    periodLabel(range),
    reviewed_by:     "Sarah Merchant, ACCA",
  };
}
