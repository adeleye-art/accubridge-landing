import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiActivityLog {
  id: number;
  userId: number;
  userName: string;
  logType: string;
  status: string;
  message: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  createdAtFormatted: string;
}

export interface ActivityLogListResponse {
  logs: ApiActivityLog[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActivityLogListParams {
  dateFrom?: string;
  dateTo?: string;
  userId?: number;
  logType?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const activityLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivityLogs: builder.query<ActivityLogListResponse, ActivityLogListParams>({
      query: (params) => ({ url: "/activitylog", params }),
      transformResponse: (
        res: { success: boolean; data: ActivityLogListResponse } | ActivityLogListResponse,
      ) => ("data" in res && res.data ? res.data : (res as ActivityLogListResponse)),
      providesTags: ["ActivityLog"],
    }),
  }),
});

export const { useGetActivityLogsQuery } = activityLogApi;
