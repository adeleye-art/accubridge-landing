import { baseApi } from "./baseApi";

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  refreshToken: string;
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
  }),
});

export const {
  useCheckEmailMutation,
  useSignInMutation,
  useSignUpMutation,
  useSendPasswordTokenMutation,
  useResetPasswordMutation,
} = authApi;
