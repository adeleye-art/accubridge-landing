import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://verifybridge.runasp.net/api",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Transaction", "Reconciliation", "Report", "Sessions", "TwoFa",
             "Dashboard", "Client", "Staff", "Compliance", "DocumentRequest", "InternalNote",
             "Notification", "ActivityLog", "ComplianceCentre", "ClientDashboard",
             "Funding", "Payment", "BusinessRegistration", "PlatformSettings"],
  endpoints: () => ({}),
});
