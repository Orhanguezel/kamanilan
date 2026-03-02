"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { SiteSettingRecord, SiteConfig, SliderItem, CategoryItem, SubCategoryItem, MenuItemDto, FooterSectionDto } from "./site.type";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

function buildSiteConfig(records: SiteSettingRecord[]): SiteConfig {
  return records.reduce<SiteConfig>((acc, r) => {
    acc[r.key] = r.value;
    return acc;
  }, {});
}

/** Admin panel logoları { url: "..." } formatında kaydeder; bu helper her iki formatı da destekler. */
export function extractMediaUrl(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value || undefined;
  if (typeof value === "object" && "url" in (value as object)) {
    const url = (value as { url?: string }).url;
    return url || undefined;
  }
  return undefined;
}

export function useSiteSettingsQuery(keys?: string[]) {
  return useQuery({
    queryKey: ["site_settings", keys],
    queryFn: async () => {
      const params = keys ? { key_in: keys.join(",") } : {};
      const res = await api.get<SiteSettingRecord[]>(API_ENDPOINTS.SITE_SETTINGS, { params });
      return buildSiteConfig(res.data ?? []);
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });
}

export function useSlidersQuery() {
  return useQuery({
    queryKey: ["sliders"],
    queryFn: async () => {
      const res = await api.get<SliderItem[] | { data: SliderItem[] }>(API_ENDPOINTS.SLIDERS);
      const data = res.data;
      return Array.isArray(data) ? data : (data as any)?.data ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<CategoryItem[] | { data: CategoryItem[] }>(API_ENDPOINTS.CATEGORIES);
      const data = res.data;
      return Array.isArray(data) ? data : (data as any)?.data ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useCategoryCountsQuery() {
  return useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const res = await api.get<{ category_id: string; count: number }[]>(
        API_ENDPOINTS.CATEGORY_COUNTS,
      );
      const map: Record<string, number> = {};
      for (const r of res.data ?? []) {
        if (r.category_id) map[r.category_id] = r.count;
      }
      return map;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubCategoriesQuery(category_id?: string) {
  return useQuery({
    queryKey: ["sub-categories", category_id],
    queryFn: async () => {
      const params = category_id ? { category_id } : {};
      const res = await api.get<SubCategoryItem[] | { data: SubCategoryItem[] }>(
        API_ENDPOINTS.SUBCATEGORIES,
        { params },
      );
      const data = res.data;
      return Array.isArray(data) ? data : (data as any)?.data ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useMenuItemsQuery(location?: string) {
  return useQuery({
    queryKey: ["menu_items", location],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (location) params.location = location;
      const res = await api.get<MenuItemDto[]>(API_ENDPOINTS.MENU_ITEMS, { params });
      const data = res.data;
      return Array.isArray(data) ? data : (data as any)?.data ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useFooterSectionsQuery() {
  return useQuery({
    queryKey: ["footer_sections"],
    queryFn: async () => {
      const res = await api.get<FooterSectionDto[]>(API_ENDPOINTS.FOOTER, {
        params: { is_active: 1 },
      });
      const data = res.data;
      return Array.isArray(data) ? data : (data as any)?.data ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });
}
