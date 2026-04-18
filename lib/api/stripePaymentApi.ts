import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;      // "GBP" | "USD" | "EUR" etc.
  reference: string;
  paymentType: string;   // "compliance_passport" | "subscription" etc.
  email: string;
  description?: string;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  status: string;        // "requires_payment_method" | "succeeded" etc.
  amount: number;
  currency: string;
  created: number;
}

export interface ConfirmPaymentIntentInput {
  paymentMethodId?: string;
}

export interface GetPaymentIntentResponse extends PaymentIntentResponse {}

export interface RefundPaymentIntentInput {
  amount?: number;
  reason?: string;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const stripePaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<PaymentIntentResponse, CreatePaymentIntentInput>({
      query: (body) => ({
        url: "/stripepayment/intent",
        method: "POST",
        body,
      }),
      transformResponse: (res: { success: boolean; data: PaymentIntentResponse } | PaymentIntentResponse) =>
        "data" in res && res.data ? res.data : (res as PaymentIntentResponse),
    }),

    confirmPaymentIntent: builder.mutation<
      PaymentIntentResponse,
      { intentId: string; body: ConfirmPaymentIntentInput }
    >({
      query: ({ intentId, body }) => ({
        url: `/stripepayment/${intentId}/confirm`,
        method: "POST",
        body,
      }),
      transformResponse: (res: { success: boolean; data: PaymentIntentResponse } | PaymentIntentResponse) =>
        "data" in res && res.data ? res.data : (res as PaymentIntentResponse),
      invalidatesTags: ["Payment"],
    }),

    getPaymentIntent: builder.query<GetPaymentIntentResponse, string>({
      query: (intentId) => `/stripepayment/${intentId}`,
      transformResponse: (res: { success: boolean; data: GetPaymentIntentResponse } | GetPaymentIntentResponse) =>
        "data" in res && res.data ? res.data : (res as GetPaymentIntentResponse),
      providesTags: ["Payment"],
    }),

    refundPaymentIntent: builder.mutation<
      { success: boolean; message: string; refundId: string },
      { intentId: string; body: RefundPaymentIntentInput }
    >({
      query: ({ intentId, body }) => ({
        url: `/stripepayment/${intentId}/refund`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useConfirmPaymentIntentMutation,
  useGetPaymentIntentQuery,
  useRefundPaymentIntentMutation,
} = stripePaymentApi;
