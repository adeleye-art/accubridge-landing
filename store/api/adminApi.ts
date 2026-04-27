import { baseApi } from './baseApi'
import type {
  AdminStats,
  CreditTransaction,
  Driver,
  DriverApprovalStatus,
  DriverDocument,
  Order,
  Referral,
  Vendor,
} from '@/types'

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminStats: build.query<AdminStats, void>({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),

    getVendors: build.query<Vendor[], { status?: 'pending' | 'approved' | 'rejected' | 'all' }>({
      query: ({ status } = {}) => ({
        url: '/admin/vendors',
        params: status && status !== 'all' ? { status } : {},
      }),
      providesTags: ['Vendor'],
    }),

    approveVendor: build.mutation<Vendor, string>({
      query: (id) => ({ url: `/admin/vendors/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['Vendor', 'Stats'],
    }),

    rejectVendor: build.mutation<Vendor, string>({
      query: (id) => ({ url: `/admin/vendors/${id}/reject`, method: 'PATCH' }),
      invalidatesTags: ['Vendor', 'Stats'],
    }),

    updateCommission: build.mutation<Vendor, { id: string; commission_rate: number }>({
      query: ({ id, commission_rate }) => ({
        url: `/admin/vendors/${id}/commission`,
        method: 'PATCH',
        body: { commission_rate },
      }),
      invalidatesTags: ['Vendor'],
    }),

    getOrders: build.query<
      Order[],
      { status?: string; vendor_id?: string; from?: string; to?: string }
    >({
      query: (params = {}) => ({ url: '/admin/orders', params }),
      providesTags: ['Order'],
    }),

    getOrderById: build.query<Order, string>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: ['Order'],
    }),

    assignDriver: build.mutation<Order, { orderId: string; driver_id: string }>({
      query: ({ orderId, driver_id }) => ({
        url: `/admin/orders/${orderId}/assign-driver`,
        method: 'PATCH',
        body: { driver_id },
      }),
      invalidatesTags: ['Order', 'Driver'],
    }),

    refundOrder: build.mutation<Order, string>({
      query: (id) => ({ url: `/admin/orders/${id}/refund`, method: 'POST' }),
      invalidatesTags: ['Order'],
    }),

    getDrivers: build.query<Driver[], { approval_status?: DriverApprovalStatus }>({
      query: ({ approval_status } = {}) => ({
        url: '/admin/drivers',
        params: approval_status ? { approval_status } : {},
      }),
      providesTags: ['Driver'],
    }),

    approveDriver: build.mutation<Driver, string>({
      query: (id) => ({ url: `/admin/drivers/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['Driver', 'Stats'],
    }),

    rejectDriver: build.mutation<Driver, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/drivers/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Driver', 'Stats'],
    }),

    suspendDriver: build.mutation<Driver, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/drivers/${id}/suspend`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Driver'],
    }),

    getDriverDocuments: build.query<DriverDocument[], string>({
      query: (id) => `/admin/drivers/${id}/documents`,
      providesTags: ['Driver'],
    }),

    verifyDriverDocument: build.mutation<void, { id: string; doc_type: string }>({
      query: ({ id, doc_type }) => ({
        url: `/admin/drivers/${id}/documents/${doc_type}/verify`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Driver'],
    }),

    getReferrals: build.query<Referral[], void>({
      query: () => '/admin/referrals',
      providesTags: ['Referral'],
    }),

    getCreditTransactions: build.query<CreditTransaction[], void>({
      query: () => '/admin/credits/transactions',
      providesTags: ['Credits'],
    }),
  }),
})

export const {
  useGetAdminStatsQuery,
  useGetVendorsQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useUpdateCommissionMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useAssignDriverMutation,
  useRefundOrderMutation,
  useGetDriversQuery,
  useApproveDriverMutation,
  useRejectDriverMutation,
  useSuspendDriverMutation,
  useGetDriverDocumentsQuery,
  useVerifyDriverDocumentMutation,
  useGetReferralsQuery,
  useGetCreditTransactionsQuery,
} = adminApi
