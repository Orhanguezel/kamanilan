// =============================================================
// FILE: src/integrations/endpoints/admin/photo_queue_admin.endpoints.ts
// Foto indirme kuyrugu — admin RTK Query endpoints
// Backend mirror: kamanilan/backend/src/modules/photoQueue/admin.routes.ts
// =============================================================
import { baseApi } from "@/integrations/baseApi";
import type {
  PhotoQueueDto,
  PhotoQueueStats,
  PhotoQueueListParams,
} from "@/integrations/shared";

export const photoQueueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getPhotoQueueStatsAdmin: builder.query<PhotoQueueStats, void>({
      query: () => "/admin/photo-queue/stats",
      providesTags: ["PhotoQueueStats"],
    }),

    listPhotoQueueFailedAdmin: builder.query<PhotoQueueDto[], PhotoQueueListParams | void>({
      query: (params) => ({
        url: "/admin/photo-queue/failed",
        params: params ?? {},
      }),
      providesTags: ["PhotoQueueFailed"],
    }),

    listPhotoQueueByPropertyAdmin: builder.query<PhotoQueueDto[], string>({
      query: (propertyId) => `/admin/photo-queue/property/${propertyId}`,
      providesTags: (_r, _e, propertyId) => [
        { type: "PhotoQueueProperty", id: propertyId },
      ],
    }),

    retryPhotoQueueItemAdmin: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/admin/photo-queue/${id}/retry`,
        method: "POST",
      }),
      invalidatesTags: ["PhotoQueueFailed", "PhotoQueueStats"],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPhotoQueueStatsAdminQuery,
  useListPhotoQueueFailedAdminQuery,
  useLazyListPhotoQueueFailedAdminQuery,
  useListPhotoQueueByPropertyAdminQuery,
  useRetryPhotoQueueItemAdminMutation,
} = photoQueueApi;
