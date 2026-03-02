"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { ListingListResponse } from "@/modules/listing/listing.types";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export function useFavoriteListingsQuery(ids: string[]) {
  const sortedIds = [...ids].sort();
  return useQuery({
    queryKey: ["favorite-listings", sortedIds],
    queryFn: async () => {
      if (!ids.length) return { items: [], total: 0 };
      const params = new URLSearchParams();
      ids.forEach((id) => params.append("ids[]", id));
      params.set("limit", "200");
      const res = await api.get<ListingListResponse>(
        `${API_ENDPOINTS.LISTINGS}?${params}`
      );
      return res.data;
    },
    staleTime: 1000 * 60,
  });
}
