"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { ThemeConfig } from "./theme.type";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
});

/** GET /theme — tam tema konfigürasyonu (public) */
export function useThemeQuery() {
  return useQuery<ThemeConfig>({
    queryKey: ["theme"],
    queryFn: async () => {
      const res = await api.get<ThemeConfig>(API_ENDPOINTS.THEME);
      return res.data;
    },
    staleTime:           1000 * 30,      // 30 sn — admin değişiklikleri hızlıca yansısın
    gcTime:              1000 * 60 * 10,
    refetchOnWindowFocus: true,
  });
}
