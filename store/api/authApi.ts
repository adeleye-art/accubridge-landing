import { baseApi } from './baseApi'
import type {
  AuthResponse,
  DriverDocumentUploadResponse,
  DriverApprovalStatus,
  DriverDocument,
  LoginRequest,
  RegisterRequest,
  User,
} from '@/types'

export interface DriverApprovalStatusResponse {
  approval_status: DriverApprovalStatus
  rejection_reason?: string
  documents: DriverDocument[]
  missing_documents: string[]
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['User'],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.user.role === 'driver' && data.approval_status) {
            document.cookie = `driver_approval_status=${data.approval_status}; path=/; max-age=604800`
          }
        } catch {}
      },
    }),
    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    verifyOtp: build.mutation<{ verified: boolean }, { phone: string; code: string }>({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),
    getMe: build.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    uploadDriverDocument: build.mutation<DriverDocumentUploadResponse, FormData>({
      query: (body) => ({
        url: '/drivers/documents/upload',
        method: 'POST',
        body,
      }),
    }),
    getDriverApprovalStatus: build.query<DriverApprovalStatusResponse, void>({
      query: () => '/drivers/me/approval-status',
      providesTags: ['User'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useGetMeQuery,
  useUploadDriverDocumentMutation,
  useGetDriverApprovalStatusQuery,
} = authApi
