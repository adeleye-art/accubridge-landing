import { baseApi } from './baseApi'
import type {
  AvailableJob,
  ActiveDelivery,
  CompletedDelivery,
  DriverEarningsSummary,
  DriverPayoutInfo,
} from '@/types'

// ─── Query arg shapes ─────────────────────────────────────────────────────────

interface AvailableJobsParams {
  max_distance?: number
  type?: 'food' | 'grocery' | 'delivery'
  min_earnings?: number
}

interface DeliveryHistoryParams {
  from?: string
  to?: string
  status?: string
  type?: string
  page?: number
  per_page?: number
}

interface EarningsParams {
  from?: string
  to?: string
  page?: number
  per_page?: number
}

interface EarningsResponse {
  summary: DriverEarningsSummary
  records: CompletedDelivery[]
  payout: DriverPayoutInfo
}

// ─── Injected endpoints ───────────────────────────────────────────────────────

const driverApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── STATUS ──────────────────────────────────────────────────────────────

    toggleOnlineStatus: builder.mutation<void, { status: 'online' | 'offline' }>({
      query: (body) => ({
        url: '/drivers/me/status',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    getDriverStats: builder.query<DriverEarningsSummary, void>({
      query: () => '/drivers/me/stats',
      providesTags: ['Stats'],
    }),

    // ── JOBS ────────────────────────────────────────────────────────────────

    getAvailableJobs: builder.query<AvailableJob[], AvailableJobsParams>({
      query: (params) => ({
        url: '/drivers/me/available-jobs',
        params,
      }),
      providesTags: ['Order'],
    }),

    acceptJob: builder.mutation<ActiveDelivery, string>({
      query: (id) => ({
        url: `/drivers/me/jobs/${id}/accept`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Order'],
    }),

    declineJob: builder.mutation<void, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/drivers/me/jobs/${id}/decline`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Order'],
    }),

    getActiveDelivery: builder.query<ActiveDelivery | null, void>({
      query: () => '/drivers/me/active-delivery',
      providesTags: ['Order'],
    }),

    updateDeliveryStatus: builder.mutation<void, { status: 'en_route_pickup' | 'picked_up' | 'en_route_dropoff' }>({
      query: (body) => ({
        url: '/drivers/me/active-delivery/status',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Order'],
    }),

    markDelivered: builder.mutation<CompletedDelivery, void>({
      query: () => ({
        url: '/drivers/me/active-delivery/delivered',
        method: 'PATCH',
      }),
      invalidatesTags: ['Order', 'Stats'],
    }),

    // ── HISTORY ─────────────────────────────────────────────────────────────

    getDeliveryHistory: builder.query<CompletedDelivery[], DeliveryHistoryParams>({
      query: (params) => ({
        url: '/drivers/me/deliveries',
        params,
      }),
      providesTags: ['Order'],
    }),

    // ── EARNINGS ────────────────────────────────────────────────────────────

    getDriverEarnings: builder.query<EarningsResponse, EarningsParams>({
      query: (params) => ({
        url: '/drivers/me/earnings',
        params,
      }),
      providesTags: ['Stats'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useToggleOnlineStatusMutation,
  useGetDriverStatsQuery,
  useGetAvailableJobsQuery,
  useAcceptJobMutation,
  useDeclineJobMutation,
  useGetActiveDeliveryQuery,
  useUpdateDeliveryStatusMutation,
  useMarkDeliveredMutation,
  useGetDeliveryHistoryQuery,
  useGetDriverEarningsQuery,
} = driverApi
