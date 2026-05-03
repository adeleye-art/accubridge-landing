import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiInternalNote {
  id: number;
  clientId: number;
  clientName: string;
  note: string;
  authorName: string;
  createdAt: string;
  createdAtFormatted: string;
}

export interface InternalNoteListResponse {
  notes: ApiInternalNote[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface InternalNoteListParams {
  clientId?: number;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateInternalNoteInput {
  clientId: number;
  note: string;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const internalNoteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInternalNotes: builder.query<InternalNoteListResponse, InternalNoteListParams>({
      query: (params) => ({ url: "/internalnote", params }),
      transformResponse: (res: { success: boolean; data: InternalNoteListResponse } | InternalNoteListResponse) =>
        "data" in res && res.data ? res.data : (res as InternalNoteListResponse),
      providesTags: ["InternalNote"],
    }),

    createInternalNote: builder.mutation<ApiInternalNote, CreateInternalNoteInput>({
      query: (body) => ({ url: "/internalnote", method: "POST", body }),
      invalidatesTags: ["InternalNote"],
    }),

    deleteInternalNote: builder.mutation<void, number>({
      query: (id) => ({ url: `/internalnote/${id}`, method: "DELETE" }),
      invalidatesTags: ["InternalNote"],
    }),
  }),
});

export const {
  useGetInternalNotesQuery,
  useCreateInternalNoteMutation,
  useDeleteInternalNoteMutation,
} = internalNoteApi;
