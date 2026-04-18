// =============================================================
// FILE: src/integrations/endpoints/admin/imports_admin.endpoints.ts
// Toplu import (Excel/CSV) — admin RTK Query endpoints
// Backend mirror: kamanilan/backend/src/modules/imports/admin.routes.ts
// =============================================================
import { baseApi } from "@/integrations/baseApi";
import type {
  ImportJobDto,
  ImportJobItemDto,
  ImportJobsListParams,
  ImportJobItemsListParams,
  ImportMappingPayload,
  ImportMappingResponse,
  ImportCommitPayload,
  ImportCommitResponse,
  ImportUploadResponse,
} from "@/integrations/shared";

export const importsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // Liste + detay
    listImportJobsAdmin: builder.query<ImportJobDto[], ImportJobsListParams | void>({
      query: (params) => ({
        url: "/admin/imports",
        params: params ?? {},
      }),
      providesTags: ["ImportJobs"],
    }),

    getImportJobAdmin: builder.query<ImportJobDto, string>({
      query: (id) => `/admin/imports/${id}`,
      providesTags: (_r, _e, id) => [{ type: "ImportJob", id }],
    }),

    listImportItemsAdmin: builder.query<
      ImportJobItemDto[],
      { jobId: string; params?: ImportJobItemsListParams }
    >({
      query: ({ jobId, params }) => ({
        url: `/admin/imports/${jobId}/items`,
        params: params ?? {},
      }),
      providesTags: (_r, _e, { jobId }) => [{ type: "ImportJobItems", id: jobId }],
    }),

    // Upload — multipart/form-data, 'file' alani
    uploadImportJobAdmin: builder.mutation<ImportUploadResponse, FormData>({
      query: (formData) => ({
        url: "/admin/imports/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["ImportJobs"],
    }),

    // Mapping + batch validate
    putImportMappingAdmin: builder.mutation<
      ImportMappingResponse,
      { id: string; body: ImportMappingPayload }
    >({
      query: ({ id, body }) => ({
        url: `/admin/imports/${id}/mapping`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "ImportJobs",
        { type: "ImportJob", id },
        { type: "ImportJobItems", id },
      ],
    }),

    // Commit
    commitImportJobAdmin: builder.mutation<
      ImportCommitResponse,
      { id: string; body?: ImportCommitPayload }
    >({
      query: ({ id, body }) => ({
        url: `/admin/imports/${id}/commit`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "ImportJobs",
        { type: "ImportJob", id },
        { type: "ImportJobItems", id },
        "Products", // properties → listing cache invalidation
      ],
    }),

    // ZIP foto upload (Sprint 4 stub — simdilik 501 doner)
    uploadImportPhotosZipAdmin: builder.mutation<
      { error: { message: string; sprint?: number } },
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/admin/imports/${id}/photos-zip`,
        method: "POST",
        body: formData,
      }),
    }),

    // Iptal
    deleteImportJobAdmin: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/imports/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ImportJobs"],
    }),

  }),
  overrideExisting: false,
});

export const {
  useListImportJobsAdminQuery,
  useLazyListImportJobsAdminQuery,
  useGetImportJobAdminQuery,
  useListImportItemsAdminQuery,
  useLazyListImportItemsAdminQuery,
  useUploadImportJobAdminMutation,
  usePutImportMappingAdminMutation,
  useCommitImportJobAdminMutation,
  useUploadImportPhotosZipAdminMutation,
  useDeleteImportJobAdminMutation,
} = importsApi;
