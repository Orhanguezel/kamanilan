"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import type { FlashSale, FlashSaleWithListings } from "./flash-sale.types";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const FLASH_SALE_BASE = "/flash-sale";

/** Ana sayfa: aktif kampanya + eşleşen ilanlar */
export function useActiveFlashSaleWithListingsQuery(limit = 5) {
  return useQuery({
    queryKey: ["flash-sale", "active-with-listings", limit],
    queryFn: async () => {
      const res = await api.get<FlashSaleWithListings | null>(
        `${FLASH_SALE_BASE}/active-with-listings`,
        { params: { limit: String(limit) } },
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

/** Kampanyalar listesi */
export function useFlashSalesQuery(limit?: number) {
  return useQuery({
    queryKey: ["flash-sales", limit ?? "all"],
    queryFn: async () => {
      const params: Record<string, unknown> = { is_active: "1", active_now: "1" };
      if (limit) params.limit = limit;
      const res = await api.get<FlashSale[]>(`${FLASH_SALE_BASE}`, { params });
      return res.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** ID bazlı kampanya listesi — tema config'de yazılan ID'leri çeker */
export function useFlashSalesByIdsQuery(ids?: string, limit = 20) {
  const trimmedIds = ids?.trim() ?? "";
  return useQuery<FlashSale[]>({
    queryKey: ["flash-sales-by-ids", trimmedIds, limit],
    enabled: trimmedIds.length > 0,
    queryFn: async () => {
      const res = await api.get<FlashSale[]>(`${FLASH_SALE_BASE}`, {
        params: { ids: trimmedIds, limit, is_active: "1" },
      });
      return res.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Tek kampanya by slug */
export function useFlashSaleBySlugQuery(slug: string) {
  return useQuery({
    queryKey: ["flash-sale", "slug", slug],
    queryFn: async () => {
      const res = await api.get<FlashSale>(`${FLASH_SALE_BASE}/by-slug/${slug}`);
      return res.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}