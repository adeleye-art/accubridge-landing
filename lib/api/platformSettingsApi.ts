import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlatformPricing {
  subscriptionMonthlyGBP: number;
  subscriptionMonthlyNGN: number;
  subscriptionAnnualGBP: number;
  subscriptionAnnualNGN: number;
  raffleTicketGBP: number;
  raffleTicketNGN: number;
  raffleMinTickets: number;
  rafflePrizePoolGBP: number;
  compliancePassportGBP: number;
  compliancePassportNGN: number;
  complianceGrantFeeGBP: number;
  complianceGrantFeeNGN: number;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const platformSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformSettings: builder.query<PlatformPricing, void>({
      query: () => "/platform/settings",
      transformResponse: (res: { success: boolean; data: PlatformPricing } | PlatformPricing) =>
        "data" in res && res.data ? res.data : (res as PlatformPricing),
      providesTags: ["PlatformSettings"],
    }),

    updatePlatformSettings: builder.mutation<PlatformPricing, Partial<PlatformPricing>>({
      query: (body) => ({ url: "/platform/settings", method: "PUT", body }),
      transformResponse: (res: { success: boolean; data: PlatformPricing } | PlatformPricing) =>
        "data" in res && res.data ? res.data : (res as PlatformPricing),
      invalidatesTags: ["PlatformSettings"],
    }),
  }),
});

export const {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} = platformSettingsApi;
