"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { AnnouncementItem, AnnouncementsResponse } from "./announcement.type";

const api = axios.create({ baseURL: getApiBaseUrl(), timeout: 8000 });

export interface AnnouncementsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
}

export function useAnnouncementsQuery(params: AnnouncementsQueryParams = {}) {
  return useQuery<AnnouncementsResponse>({
    queryKey: ["announcements", params],
    queryFn: async () => {
      const p: Record<string, unknown> = {
        page:  params.page  ?? 1,
        limit: params.limit ?? 12,
        sort:  "published_at",
        order: "desc",
      };
      if (params.category) p.category = params.category;
      if (params.featured) p.featured = "1";
      const res = await api.get<AnnouncementsResponse>(API_ENDPOINTS.ANNOUNCEMENTS, { params: p });
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useAnnouncementBySlugQuery(slug: string) {
  return useQuery<AnnouncementItem>({
    queryKey: ["announcement", slug],
    queryFn: async () => {
      const res = await api.get<AnnouncementItem>(`${API_ENDPOINTS.ANNOUNCEMENTS}/${slug}`);
      return res.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}
