import { baseApi } from "./baseApi";

// ─── Response types ────────────────────────────────────────────────────────────

export interface HmrcAuthorizeResponse {
  authorizationUrl: string;
  message: string;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const hmrcApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get HMRC OAuth authorization URL — pass encoded state for CSRF protection
    // and to carry data (vatNumber, redirectTo) through the OAuth round-trip.
    getHmrcAuthorizeUrl: builder.query<HmrcAuthorizeResponse, string>({
      query: (state) => `/hmrc/authorize?state=${encodeURIComponent(state)}`,
      transformResponse: (res: { authorizationUrl: string; message: string }) => res,
      providesTags: ["Hmrc"],
    }),
  }),
});

export const {
  useLazyGetHmrcAuthorizeUrlQuery,
} = hmrcApi;
