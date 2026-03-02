"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import type { Order, OrderListResponse } from "./order.type";

function authApi() {
  return axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get(AUTH_TOKEN_KEY) ?? ""}`,
    },
  });
}

interface OrderListParams {
  page?: number;
  status?: string;
}

export function useOrderListQuery(params: OrderListParams = {}) {
  const { page = 1, status = "" } = params;
  return useQuery({
    queryKey: ["orders", page, status],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page) });
      if (status) query.set("status", status);
      const res = await authApi().get<OrderListResponse | Order[]>(
        `${API_ENDPOINTS.ORDERS}?${query}`
      );
      // Backend may return array or paginated object
      const data = res.data;
      if (Array.isArray(data)) return { data, total: data.length, page, limit: data.length };
      return data as OrderListResponse;
    },
    staleTime: 1000 * 60,
  });
}

export function useOrderDetailQuery(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await authApi().get<Order>(`${API_ENDPOINTS.ORDERS}/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCancelOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authApi().patch(`${API_ENDPOINTS.ORDERS}/${id}`, {
        status: "cancelled",
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
