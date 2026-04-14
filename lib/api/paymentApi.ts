import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InitializePaymentInput {
  amount: number;
  email: string;
  currency: string;      // "NGN" | "GBP" | "USD" | "GHS" | "ZAR"
  paymentType: string;   // "subscription" | "raffle" | "invoice" etc.
  callbackUrl: string;
  metadata?: string;
}

export interface InitializePaymentResponse {
  transactionId: number;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentResponse {
  transactionId: number;
  reference: string;
  status: string;        // "success" | "failed" | "pending"
  amount: number;
  currency: string;
  channel?: string;
  cardBrand?: string;
  cardLast4?: string;
  paidAt?: string;
}

export interface ApiPayment {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  email: string;
  paymentType: string;
  status: string;
  reference: string;
  channel?: string;
  cardBrand?: string;
  createdAt: string;
  paidAt?: string;
}

export interface PaymentListResponse {
  payments: ApiPayment[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaymentListParams {
  userId?: number;
  status?: string;
  paymentType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface RefundInput {
  amount?: number;
  reason?: string;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    initializePayment: builder.mutation<InitializePaymentResponse, InitializePaymentInput>({
      query: (body) => ({ url: "/payment/initialize", method: "POST", body }),
      transformResponse: (res: { success: boolean; data: InitializePaymentResponse } | InitializePaymentResponse) =>
        "data" in res && res.data ? res.data : (res as InitializePaymentResponse),
    }),

    verifyPayment: builder.query<VerifyPaymentResponse, string>({
      query: (reference) => `/payment/verify/${reference}`,
      transformResponse: (res: { success: boolean; data: VerifyPaymentResponse } | VerifyPaymentResponse) =>
        "data" in res && res.data ? res.data : (res as VerifyPaymentResponse),
      providesTags: ["Payment"],
    }),

    getPayments: builder.query<PaymentListResponse, PaymentListParams>({
      query: (params) => ({ url: "/payment", params }),
      transformResponse: (res: { success: boolean; data: PaymentListResponse } | PaymentListResponse) =>
        "data" in res && res.data ? res.data : (res as PaymentListResponse),
      providesTags: ["Payment"],
    }),

    getPayment: builder.query<ApiPayment, number>({
      query: (id) => `/payment/${id}`,
      transformResponse: (res: { success: boolean; data: ApiPayment } | ApiPayment) =>
        "data" in res && res.data ? res.data : (res as ApiPayment),
      providesTags: ["Payment"],
    }),

    refundPayment: builder.mutation<{ success: boolean; message: string; refundId: string }, { id: number; body: RefundInput }>({
      query: ({ id, body }) => ({ url: `/payment/${id}/refund`, method: "POST", body }),
      invalidatesTags: ["Payment"],
    }),
  }),
});

export const {
  useInitializePaymentMutation,
  useVerifyPaymentQuery,
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useRefundPaymentMutation,
} = paymentApi;
