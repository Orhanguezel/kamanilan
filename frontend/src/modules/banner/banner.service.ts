import type { BannerItem } from "./banner.type";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";

const api = axios.create({ baseURL: getApiBaseUrl(), timeout: 8000 });

/** GET /api/banners?ids=1,2 — ID numarasına göre belirli banner'ları getirir.
 *  (haber sidebar, listings sayfası vb. ID bazlı slotlar için) */
export function useBannersByIdsQuery(ids?: string, limit = 10) {
  const trimmedIds = ids?.trim() ?? "";
  return useQuery<BannerItem[]>({
    queryKey: ["banners-by-ids", trimmedIds, limit],
    enabled: trimmedIds.length > 0,
    queryFn: async () => {
      const res = await api.get<BannerItem[]>(API_ENDPOINTS.BANNERS, {
        params: { ids: trimmedIds, limit, sort: "display_order", order: "asc" },
      });
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });
}

/** GET /api/banners?desktop_row=N — Ana sayfa reklam satırı bannerları.
 *  desktop_row=1/2/3 olan aktif bannerları getirir. */
export function useBannersByRowQuery(row: number) {
  return useQuery<BannerItem[]>({
    queryKey: ["banners-by-row", row],
    enabled: row > 0,
    queryFn: async () => {
      const res = await api.get<BannerItem[]>(API_ENDPOINTS.BANNERS, {
        params: { desktop_row: row, limit: 10, sort: "display_order", order: "asc" },
      });
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });
}
