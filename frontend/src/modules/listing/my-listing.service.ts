"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import type { Listing, ListingFilters } from "./listing.types";
import type { CreateListingInput, UpdateListingInput, MyListingListResponse } from "./my-listing.types";

function authApi() {
  return axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get(AUTH_TOKEN_KEY) ?? ""}`,
    },
  });
}

type MyListingsFilters = Pick<
  ListingFilters,
  "limit" | "offset" | "sort" | "orderDir"
>;

// GET /my/listings — list the authenticated user's own listings
export function useMyListingsQuery(filters: MyListingsFilters = {}) {
  return useQuery({
    queryKey: ["my-listings", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.limit !== undefined) params.limit = String(filters.limit);
      if (filters.offset !== undefined) params.offset = String(filters.offset);
      if (filters.sort) params.sort = filters.sort;
      if (filters.orderDir) params.orderDir = filters.orderDir;
      const res = await authApi().get<MyListingListResponse>(
        API_ENDPOINTS.MY_LISTINGS,
        { params },
      );
      return res.data;
    },
    staleTime: 1000 * 60,
  });
}

// POST /my/listings — create a new listing
export function useCreateListingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateListingInput) => {
      const res = await authApi().post<Listing>(API_ENDPOINTS.MY_LISTINGS, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// PATCH /my/listings/:id — update own listing
export function useUpdateListingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateListingInput }) => {
      const url = API_ENDPOINTS.MY_LISTING.replace(":id", id);
      const res = await authApi().patch<Listing>(url, data);
      return res.data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      qc.invalidateQueries({ queryKey: ["listing", id] });
    },
  });
}

// DELETE /my/listings/:id — remove own listing
export function useDeleteListingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = API_ENDPOINTS.MY_LISTING.replace(":id", id);
      await authApi().delete(url);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// PATCH /my/listings/:id/toggle — toggle is_active
export function useToggleListingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = API_ENDPOINTS.MY_LISTING_TOGGLE.replace(":id", id);
      const res = await authApi().patch<{ id: string; is_active: boolean }>(url, {});
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}
