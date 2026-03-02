"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import type { WalletInfo, WalletTransactionsResponse } from "./wallet.type";

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

export function useWalletInfoQuery() {
  return useQuery({
    queryKey: ["wallet-info"],
    queryFn: async () => {
      const res = await authApi().get<WalletInfo>(API_ENDPOINTS.WALLET);
      return res.data;
    },
    staleTime: 1000 * 30,
  });
}

export function useWalletTransactionsQuery(params: { page?: number; type?: "credit" | "debit" | "" } = {}) {
  const { page = 1, type = "" } = params;
  return useQuery({
    queryKey: ["wallet-transactions", page, type],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: "20" });
      if (type) query.set("type", type);
      const res = await authApi().get<WalletTransactionsResponse>(
        `${API_ENDPOINTS.WALLET_TRANSACTIONS}?${query}`
      );
      return res.data;
    },
    staleTime: 1000 * 30,
  });
}
