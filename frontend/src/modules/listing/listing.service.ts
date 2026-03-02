"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type {
  Listing,
  ListingListResponse,
  ListingFilters,
  ListingCategory,
  ListingSubCategory,
  ListingBrand,
  ListingTag,
} from "./listing.types";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

function buildParams(filters: ListingFilters): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  if (filters.q)               params.q               = filters.q;
  if (filters.category_id)     params.category_id     = filters.category_id;
  if (filters.sub_category_id) params.sub_category_id = filters.sub_category_id;
  if (filters.brand_id)        params.brand_id        = filters.brand_id;
  if (filters.tag_ids?.length) params.tag_ids         = filters.tag_ids;
  if (filters.status)          params.status          = filters.status;
  if (filters.district)        params.district        = filters.district;
  if (filters.city)            params.city            = filters.city;
  if (filters.neighborhood)    params.neighborhood    = filters.neighborhood;
  if (filters.featured !== undefined) params.featured  = filters.featured ? "1" : "0";
  if (filters.is_active !== undefined) params.is_active = filters.is_active ? "1" : "0";
  if (filters.price_min !== undefined) params.price_min = String(filters.price_min);
  if (filters.price_max !== undefined) params.price_max = String(filters.price_max);
  if (filters.sort)      params.sort      = filters.sort;
  if (filters.orderDir)  params.orderDir  = filters.orderDir;
  if (filters.limit  !== undefined) params.limit  = String(filters.limit);
  if (filters.offset !== undefined) params.offset = String(filters.offset);
  return params;
}

export function useListingsQuery(filters: ListingFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: async () => {
      const params = buildParams({ is_active: true, ...filters });
      const res = await api.get<ListingListResponse>(API_ENDPOINTS.LISTINGS, { params });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
    enabled,
  });
}

export function useListingBySlugQuery(slug: string) {
  return useQuery({
    queryKey: ["listing", slug],
    queryFn: async () => {
      const res = await api.get<Listing>(`${API_ENDPOINTS.LISTING_BY_SLUG}/${slug}`);
      return res.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["listing-categories"],
    queryFn: async () => {
      const res = await api.get<ListingCategory[]>(API_ENDPOINTS.CATEGORIES, {
        params: { is_active: "1", limit: "100" },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useSubCategoriesQuery(categoryId?: string) {
  return useQuery({
    queryKey: ["listing-subcategories", categoryId],
    queryFn: async () => {
      const res = await api.get<ListingSubCategory[]>(API_ENDPOINTS.SUBCATEGORIES, {
        params: { is_active: "1", limit: "100", ...(categoryId ? { category_id: categoryId } : {}) },
      });
      return res.data;
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useListingBrandsQuery(categoryId?: string, subCategoryId?: string) {
  return useQuery({
    queryKey: ["listing-brands", categoryId, subCategoryId],
    queryFn: async () => {
      const res = await api.get<ListingBrand[]>(API_ENDPOINTS.LISTING_BRANDS, {
        params: {
          limit: "100",
          ...(categoryId ? { category_id: categoryId } : {}),
          ...(subCategoryId ? { sub_category_id: subCategoryId } : {}),
        },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useListingTagsQuery(categoryId?: string, subCategoryId?: string) {
  return useQuery({
    queryKey: ["listing-tags", categoryId, subCategoryId],
    queryFn: async () => {
      const res = await api.get<ListingTag[]>(API_ENDPOINTS.LISTING_TAGS, {
        params: {
          limit: "100",
          ...(categoryId ? { category_id: categoryId } : {}),
          ...(subCategoryId ? { sub_category_id: subCategoryId } : {}),
        },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useListingMetaDistrictsQuery() {
  return useQuery({
    queryKey: ["listing-meta-districts"],
    queryFn: async () => {
      const res = await api.get<string[]>(API_ENDPOINTS.LISTING_META_DISTRICTS);
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useListingMetaCitiesQuery() {
  return useQuery({
    queryKey: ["listing-meta-cities"],
    queryFn: async () => {
      const res = await api.get<string[]>(API_ENDPOINTS.LISTING_META_CITIES);
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useInfiniteListingsQuery(
  filters: Omit<ListingFilters, "limit" | "offset"> = {},
  perPage = 20,
) {
  return useInfiniteQuery({
    queryKey: ["listings", "infinite", filters, perPage],
    queryFn: async ({ pageParam }) => {
      const params = buildParams({
        is_active: true,
        ...filters,
        limit:  perPage,
        offset: (pageParam as number) * perPage,
      });
      const res = await api.get<ListingListResponse>(API_ENDPOINTS.LISTINGS, { params });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const fetched = ((lastPageParam as number) + 1) * perPage;
      return fetched < (lastPage.total ?? 0) ? (lastPageParam as number) + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useFeaturedListingsQuery(limit = 8) {
  return useQuery({
    queryKey: ["listings", "featured", limit],
    queryFn: async () => {
      const res = await api.get<ListingListResponse>(API_ENDPOINTS.LISTINGS, {
        params: { featured: "1", is_active: "1", limit: String(limit), sort: "created_at", orderDir: "desc" },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
