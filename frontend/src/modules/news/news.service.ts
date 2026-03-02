"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { NewsFeedResponse } from "./news.type";

const api = axios.create({ baseURL: getApiBaseUrl(), timeout: 10_000 });

export function useNewsFeedQuery(limit = 9) {
  return useQuery<NewsFeedResponse>({
    queryKey: ["news-feed", limit],
    queryFn:  async () => {
      const res = await api.get<NewsFeedResponse>(API_ENDPOINTS.NEWS_FEED, {
        params: { limit },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 15, // 15 dakika
  });
}
