import { baseApi } from "./baseApi";

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface ReportPeriodParams {
  Period?: number;      // 1=Today 2=ThisWeek 3=ThisMonth 4=ThisQuarter 5=ThisYear 6=LastMonth 7=Custom
  CustomFrom?: string;  // ISO date — required when Period=7
  CustomTo?: string;    // ISO date — required when Period=7
}

// ─── P&L Types ────────────────────────────────────────────────────────────────

export interface ApiPnLLine {
  description: string;
  formattedAmount: string;
  isTotal?: boolean;
  isGrandTotal?: boolean;
}

export interface ApiPnLReport {
  period: string;
  periodFrom: string;
  periodTo: string;
  isProfit: boolean;
  formattedTotalIncome: string;
  formattedTotalExpenses: string;
  formattedNetProfitOrLoss: string;
  netMarginLabel: string;
  incomeLines: ApiPnLLine[];
  totalIncomeLine: ApiPnLLine;
  expenseLines: ApiPnLLine[];
  totalExpensesLine: ApiPnLLine;
  netProfitLine: ApiPnLLine;
}

// ─── Balance Sheet Types ──────────────────────────────────────────────────────

export interface ApiBalanceSheetEntry {
  id: number;
  description: string;
  formattedAmount: string;
  orderIndex: number;
  isEditable?: boolean;
  isAutoComputed?: boolean;
}

export interface ApiBalanceSheetReport {
  period: string;
  asAtDate: string;
  isBalanced: boolean;
  formattedTotalAssets: string;
  formattedTotalLiabilities: string;
  formattedTotalEquity: string;
  balanceStatusLabel: string;
  currentAssets: ApiBalanceSheetEntry[];
  formattedTotalCurrentAssets: string;
  nonCurrentAssets: ApiBalanceSheetEntry[];
  formattedTotalNonCurrentAssets: string;
  formattedTotalAssetsGrandTotal: string;
  currentLiabilities: ApiBalanceSheetEntry[];
  formattedTotalCurrentLiabilities: string;
  nonCurrentLiabilities: ApiBalanceSheetEntry[];
  formattedTotalNonCurrentLiabilities: string;
  formattedTotalLiabilitiesGrandTotal: string;
  equityLines: ApiBalanceSheetEntry[];
  formattedTotalEquityGrandTotal: string;
  formattedTotalLiabilitiesAndEquity: string;
}

export interface BalanceSheetEntryInput {
  id?: number;
  section: number;
  description: string;
  amount: number;
  orderIndex: number;
  periodYear: number;
  periodMonth: number;
}

// ─── Cash Flow Types ──────────────────────────────────────────────────────────

export interface ApiCashFlowEntry {
  id: number;
  description: string;
  formattedAmount: string;
  orderIndex: number;
  isEditable?: boolean;
  isAutoComputed?: boolean;
}

export interface ApiCashFlowReport {
  period: string;
  periodFrom: string;
  periodTo: string;
  formattedOpeningBalance: string;
  formattedNetFromOperating: string;
  formattedNetChange: string;
  formattedClosingBalance: string;
  formattedOpeningCashBalance: string;
  operatingActivities: ApiCashFlowEntry[];
  formattedNetCashFromOperating: string;
  investingActivities: ApiCashFlowEntry[];
  formattedNetCashFromInvesting: string;
  financingActivities: ApiCashFlowEntry[];
  formattedNetCashFromFinancing: string;
  formattedNetChangeInCash: string;
  formattedClosingCashBalance: string;
  isNetPositive: boolean;
  totalLineCount: number;
  operatingHeading: string;
  investingHeading: string;
  financingHeading: string;
  operatingSubtotalLabel: string;
  investingSubtotalLabel: string;
  financingSubtotalLabel: string;
}

export interface CashFlowEntryInput {
  id?: number;
  section: number;
  description: string;
  amount: number;
  periodYear: number;
  periodMonth: number;
  orderIndex: number;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPnLReport: builder.query<ApiPnLReport, ReportPeriodParams>({
      query: (params) => ({ url: "/report/profit-and-loss", params }),
      transformResponse: (res: { success: boolean; data: ApiPnLReport } | ApiPnLReport) =>
        "data" in res && res.data ? res.data : (res as ApiPnLReport),
      providesTags: ["Report"],
    }),

    getBalanceSheetReport: builder.query<ApiBalanceSheetReport, ReportPeriodParams>({
      query: (params) => ({ url: "/report/balance-sheet", params }),
      transformResponse: (res: { success: boolean; data: ApiBalanceSheetReport } | ApiBalanceSheetReport) =>
        "data" in res && res.data ? res.data : (res as ApiBalanceSheetReport),
      providesTags: ["Report"],
    }),

    getCashFlowReport: builder.query<ApiCashFlowReport, ReportPeriodParams>({
      query: (params) => ({ url: "/report/cash-flow", params }),
      transformResponse: (res: { success: boolean; data: ApiCashFlowReport } | ApiCashFlowReport) =>
        "data" in res && res.data ? res.data : (res as ApiCashFlowReport),
      providesTags: ["Report"],
    }),

    upsertBalanceSheetEntry: builder.mutation<ApiBalanceSheetEntry, BalanceSheetEntryInput>({
      query: (body) => ({ url: "/report/balance-sheet/entry", method: "POST", body }),
      invalidatesTags: ["Report"],
    }),

    upsertCashFlowEntry: builder.mutation<ApiCashFlowEntry, CashFlowEntryInput>({
      query: (body) => ({ url: "/report/cash-flow/entry", method: "POST", body }),
      invalidatesTags: ["Report"],
    }),

    deleteBalanceSheetEntry: builder.mutation<void, number>({
      query: (id) => ({ url: `/report/balance-sheet/entry/${id}`, method: "DELETE" }),
      invalidatesTags: ["Report"],
    }),

    deleteCashFlowEntry: builder.mutation<void, number>({
      query: (id) => ({ url: `/report/cash-flow/entry/${id}`, method: "DELETE" }),
      invalidatesTags: ["Report"],
    }),
  }),
});

export const {
  useGetPnLReportQuery,
  useGetBalanceSheetReportQuery,
  useGetCashFlowReportQuery,
  useUpsertBalanceSheetEntryMutation,
  useUpsertCashFlowEntryMutation,
  useDeleteBalanceSheetEntryMutation,
  useDeleteCashFlowEntryMutation,
} = reportApi;
