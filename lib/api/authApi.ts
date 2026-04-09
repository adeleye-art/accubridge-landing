import { baseApi } from "./baseApi";

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  expiration?: string;
  refreshToken?: string;
  userId?: number;
  email?: string;
  fullName?: string;
  roles?: string[];
  /** Legacy fields — kept for backwards compat */
  role?: string | number;
  userRole?: string | number;
  [key: string]: unknown;
}

export interface SignUpRequest {
  name: string;
  lastname: string;
  email: string;
  organisationName: string;
  password: string;
  confirmPassword: string;
  phoneNo: string;
  country: string;
  role: number;
}

export interface CheckEmailRequest {
  email: string;
}

export interface SendPasswordTokenRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiSession {
  sessionId: string;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  location: string;
  ipAddress: string;
  lastActiveAt: string;
  isCurrentDevice: boolean;
}

export interface TwoFaSetupData {
  is2faEnabled: boolean;
  secretKey: string | null;
  qrCodeUri: string | null;
}

export interface Enable2faRequest {
  secretKey: string;
  code: string;
}

export interface Disable2faRequest {
  password: string;
}

export interface Signin2faRequest {
  email: string;
  code: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkEmail: builder.mutation<unknown, CheckEmailRequest>({
      query: (body) => ({
        url: "/account/check-email",
        method: "POST",
        body,
      }),
    }),

    signIn: builder.mutation<SignInResponse, SignInRequest>({
      query: (body) => ({
        url: "/account/signin",
        method: "POST",
        body,
      }),
    }),

    signUp: builder.mutation<unknown, SignUpRequest>({
      query: (body) => ({
        url: "/account/signup",
        method: "POST",
        body,
      }),
    }),

    sendPasswordToken: builder.mutation<unknown, SendPasswordTokenRequest>({
      query: (body) => ({
        url: "/account/send-password-token",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<unknown, ResetPasswordRequest>({
      query: (body) => ({
        url: "/account/reset-password-with-token",
        method: "POST",
        body,
      }),
    }),

    signOut: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/account/signout",
        method: "POST",
      }),
      invalidatesTags: ["Sessions"],
    }),

    refreshToken: builder.mutation<
      { success: boolean; data: { token: string; refreshToken: string; expiresAt: string } },
      { refreshToken: string }
    >({
      query: (body) => ({
        url: "/account/refresh-token",
        method: "POST",
        body,
      }),
    }),

    getActiveSessions: builder.query<{ success: boolean; data: ApiSession[] }, void>({
      query: () => "/account/sessions",
      providesTags: ["Sessions"],
    }),

    signOutAllDevices: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/account/sessions/sign-out-all",
        method: "POST",
      }),
      invalidatesTags: ["Sessions"],
    }),

    get2faSetup: builder.query<{ success: boolean; data: TwoFaSetupData }, void>({
      query: () => "/account/2fa/setup",
      providesTags: ["TwoFa"],
    }),

    enable2fa: builder.mutation<{ success: boolean; message: string }, Enable2faRequest>({
      query: (body) => ({
        url: "/account/2fa/enable",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TwoFa"],
    }),

    disable2fa: builder.mutation<{ success: boolean; message: string }, Disable2faRequest>({
      query: (body) => ({
        url: "/account/2fa/disable",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TwoFa"],
    }),

    signin2fa: builder.mutation<SignInResponse, Signin2faRequest>({
      query: (body) => ({
        url: "/account/signin-2fa",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCheckEmailMutation,
  useSignInMutation,
  useSignUpMutation,
  useSendPasswordTokenMutation,
  useResetPasswordMutation,
  useSignOutMutation,
  useRefreshTokenMutation,
  useGetActiveSessionsQuery,
  useSignOutAllDevicesMutation,
  useGet2faSetupQuery,
  useEnable2faMutation,
  useDisable2faMutation,
  useSignin2faMutation,
} = authApi;
