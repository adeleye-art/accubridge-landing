import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiTransaction {
  id: number;
  type: string;         // "Income" | "Expense"
  typeValue: number;    // 1=Income, 2=Expense
  date: string;
  dateFormatted: string;
  category: string;
  amount: number;
  signedAmount: number;
  formattedAmount: string;
  description: string;
  referenceNo: string | null;
  isIncome: boolean;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export interface TransactionListResponse {
  summary: TransactionSummary;
  transactions: ApiTransaction[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TransactionCategories {
  incomeCategories: string[];
  expenseCategories: string[];
  all: string[];
}

export interface TransactionListParams {
  search?: string;
  type?: number;        // 1=Income, 2=Expense
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateTransactionInput {
  type: number;         // 1=Income, 2=Expense
  date: string;         // ISO date
  category: string;
  amount: number;
  description: string;
  referenceNo?: string | null;
  userId?: string | null;  // Admin/Staff can specify a target client user ID
}

export type UpdateTransactionInput = Omit<CreateTransactionInput, "userId">;

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<TransactionListResponse, TransactionListParams>({
      query: (params) => ({ url: "/transaction", params }),
      transformResponse: (res: { success: boolean; data: TransactionListResponse } | TransactionListResponse) =>
        "data" in res && res.data ? res.data : (res as TransactionListResponse),
      providesTags: ["Transaction"],
    }),

    getTransactionSummary: builder.query<TransactionSummary, void>({
      query: () => "/transaction/summary",
      transformResponse: (res: { success: boolean; data: TransactionSummary } | TransactionSummary) =>
        "data" in res && res.data ? res.data : (res as TransactionSummary),
      providesTags: ["Transaction"],
    }),

    getTransactionCategories: builder.query<TransactionCategories, void>({
      query: () => "/transaction/categories",
      transformResponse: (res: { success: boolean; data: TransactionCategories } | TransactionCategories) =>
        "data" in res && res.data ? res.data : (res as TransactionCategories),
    }),

    createTransaction: builder.mutation<ApiTransaction, CreateTransactionInput>({
      query: (body) => ({ url: "/transaction", method: "POST", body }),
      invalidatesTags: ["Transaction"],
    }),

    updateTransaction: builder.mutation<ApiTransaction, { id: number; body: UpdateTransactionInput }>({
      query: ({ id, body }) => ({ url: `/transaction/${id}`, method: "PUT", body }),
      invalidatesTags: ["Transaction"],
    }),

    deleteTransaction: builder.mutation<void, number>({
      query: (id) => ({ url: `/transaction/${id}`, method: "DELETE" }),
      invalidatesTags: ["Transaction"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionSummaryQuery,
  useGetTransactionCategoriesQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionApi;
