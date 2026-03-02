"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { PopupItem } from "./popup.type";

const api = axios.create({ baseURL: getApiBaseUrl(), timeout: 8000 });

/** GET /api/popups — tüm aktif popup'ları çek */
export function usePopupsQuery(type?: PopupItem["type"]) {
  return useQuery<PopupItem[]>({
    queryKey: ["popups", type ?? "all"],
    queryFn: async () => {
      const params: Record<string, unknown> = { limit: 20, sort: "display_order", order: "asc" };
      if (type) params.type = type;
      const res = await api.get<PopupItem[]>(API_ENDPOINTS.POPUPS, { params });
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 15,
    gcTime:    1000 * 60 * 60,
  });
}
