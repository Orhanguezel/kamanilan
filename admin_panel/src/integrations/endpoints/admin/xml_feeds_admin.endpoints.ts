// =============================================================
// FILE: src/integrations/endpoints/admin/xml_feeds_admin.endpoints.ts
// Sahibinden XML feed — admin RTK Query endpoints
// Backend mirror: kamanilan/backend/src/modules/xmlFeeds/admin.routes.ts
// =============================================================
import { baseApi } from "@/integrations/baseApi";
import type {
  XmlFeedDto,
  XmlFeedRunDto,
  XmlFeedItemDto,
  XmlFeedCategoryMapDto,
  XmlFeedsListParams,
  XmlFeedItemsListParams,
  XmlFeedCreatePayload,
  XmlFeedUpdatePayload,
  XmlFeedCategoryMapUpsertPayload,
  XmlFeedRunResult,
} from "@/integrations/shared";

export const xmlFeedsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // CRUD
    listXmlFeedsAdmin: builder.query<XmlFeedDto[], XmlFeedsListParams | void>({
      query: (params) => ({
        url: "/admin/xml-feeds",
        params: params ?? {},
      }),
      providesTags: ["XmlFeeds"],
    }),

    getXmlFeedAdmin: builder.query<XmlFeedDto, string>({
      query: (id) => `/admin/xml-feeds/${id}`,
      providesTags: (_r, _e, id) => [{ type: "XmlFeed", id }],
    }),

    createXmlFeedAdmin: builder.mutation<XmlFeedDto, XmlFeedCreatePayload>({
      query: (body) => ({
        url: "/admin/xml-feeds",
        method: "POST",
        body,
      }),
      invalidatesTags: ["XmlFeeds"],
    }),

    updateXmlFeedAdmin: builder.mutation<
      XmlFeedDto,
      { id: string; patch: XmlFeedUpdatePayload }
    >({
      query: ({ id, patch }) => ({
        url: `/admin/xml-feeds/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_r, _e, { id }) => ["XmlFeeds", { type: "XmlFeed", id }],
    }),

    deleteXmlFeedAdmin: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/xml-feeds/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["XmlFeeds"],
    }),

    // Run
    triggerXmlFeedRunAdmin: builder.mutation<XmlFeedRunResult, string>({
      query: (id) => ({
        url: `/admin/xml-feeds/${id}/run`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        "XmlFeeds",
        { type: "XmlFeed", id },
        { type: "XmlFeedRuns", id },
        { type: "XmlFeedItems", id },
        "Products",
      ],
    }),

    listXmlFeedRunsAdmin: builder.query<
      XmlFeedRunDto[],
      { id: string; limit?: number }
    >({
      query: ({ id, limit }) => ({
        url: `/admin/xml-feeds/${id}/runs`,
        params: limit ? { limit } : {},
      }),
      providesTags: (_r, _e, { id }) => [{ type: "XmlFeedRuns", id }],
    }),

    // Items (feed_items)
    listXmlFeedItemsAdmin: builder.query<
      XmlFeedItemDto[],
      { id: string; params?: XmlFeedItemsListParams }
    >({
      query: ({ id, params }) => ({
        url: `/admin/xml-feeds/${id}/items`,
        params: params ?? {},
      }),
      providesTags: (_r, _e, { id }) => [{ type: "XmlFeedItems", id }],
    }),

    // Category map
    getXmlFeedCategoryMapAdmin: builder.query<XmlFeedCategoryMapDto[], string>({
      query: (id) => `/admin/xml-feeds/${id}/category-map`,
      providesTags: (_r, _e, id) => [{ type: "XmlFeedCategoryMap", id }],
    }),

    putXmlFeedCategoryMapAdmin: builder.mutation<
      XmlFeedCategoryMapDto[],
      { id: string; body: XmlFeedCategoryMapUpsertPayload }
    >({
      query: ({ id, body }) => ({
        url: `/admin/xml-feeds/${id}/category-map`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "XmlFeedCategoryMap", id }],
    }),

    deleteXmlFeedCategoryMapEntryAdmin: builder.mutation<
      void,
      { id: string; entryId: string }
    >({
      query: ({ id, entryId }) => ({
        url: `/admin/xml-feeds/${id}/category-map/${entryId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "XmlFeedCategoryMap", id }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useListXmlFeedsAdminQuery,
  useLazyListXmlFeedsAdminQuery,
  useGetXmlFeedAdminQuery,
  useCreateXmlFeedAdminMutation,
  useUpdateXmlFeedAdminMutation,
  useDeleteXmlFeedAdminMutation,
  useTriggerXmlFeedRunAdminMutation,
  useListXmlFeedRunsAdminQuery,
  useLazyListXmlFeedRunsAdminQuery,
  useListXmlFeedItemsAdminQuery,
  useLazyListXmlFeedItemsAdminQuery,
  useGetXmlFeedCategoryMapAdminQuery,
  usePutXmlFeedCategoryMapAdminMutation,
  useDeleteXmlFeedCategoryMapEntryAdminMutation,
} = xmlFeedsApi;
