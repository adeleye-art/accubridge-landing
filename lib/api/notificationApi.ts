import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationPreferences {
  newClientSignup: boolean;
  complianceAlert: boolean;
  fundingSubmitted: boolean;
  staffAction: boolean;
}

export interface ApiNotification {
  id: number;
  title: string;
  message: string;
  type: string;   // "Success" | "Info" | "Warning" | "Error"
  channel: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: ApiNotification[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NotificationListParams {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationTemplatesResponse {
  templates: string[];
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => "/notification/preferences",
      transformResponse: (
        res: { success: boolean; data: NotificationPreferences } | NotificationPreferences,
      ) => ("data" in res && res.data ? res.data : (res as NotificationPreferences)),
      providesTags: ["Notification"],
    }),

    updateNotificationPreferences: builder.mutation<NotificationPreferences, NotificationPreferences>({
      query: (body) => ({ url: "/notification/preferences", method: "PUT", body }),
      invalidatesTags: ["Notification"],
    }),

    getMyNotifications: builder.query<NotificationListResponse, NotificationListParams>({
      query: (params) => ({ url: "/notification/my", params }),
      transformResponse: (
        res: { success: boolean; data: NotificationListResponse } | NotificationListResponse,
      ) => ("data" in res && res.data ? res.data : (res as NotificationListResponse)),
      providesTags: ["Notification"],
    }),

    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => "/notification/unread-count",
      transformResponse: (
        res: { success: boolean; data: UnreadCountResponse } | UnreadCountResponse,
      ) => ("data" in res && res.data ? res.data : (res as UnreadCountResponse)),
      providesTags: ["Notification"],
    }),

    markNotificationRead: builder.mutation<{ message: string }, number>({
      query: (notificationId) => ({
        url: `/notification/${notificationId}/read`,
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllNotificationsRead: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/notification/mark-all-read", method: "POST" }),
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation<{ message: string }, number>({
      query: (notificationId) => ({
        url: `/notification/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    cleanupOldNotifications: builder.mutation<{ message: string; cutoffDate: string }, string>({
      query: (cutoffDate) => ({
        url: `/notification/cleanup?cutoffDate=${encodeURIComponent(cutoffDate)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    getNotificationTemplates: builder.query<NotificationTemplatesResponse, void>({
      query: () => "/notification/templates",
      transformResponse: (
        res: { success: boolean; data: NotificationTemplatesResponse } | NotificationTemplatesResponse,
      ) => ("data" in res && res.data ? res.data : (res as NotificationTemplatesResponse)),
    }),
  }),
});

export const {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useCleanupOldNotificationsMutation,
  useGetNotificationTemplatesQuery,
} = notificationApi;
