"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { getApiBaseUrl } from "@/lib/api-url";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import type { SellerApplicationInput } from "./seller-application.schema";
import type { SellerApplication } from "./seller-application.type";

const queryKey = ["seller-application"] as const;

function authorizationHeaders() {
  return { Authorization: `Bearer ${Cookies.get(AUTH_TOKEN_KEY) ?? ""}` };
}

export function useSellerApplicationQuery() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axios.get<SellerApplication | null>(
        `${getApiBaseUrl()}${API_ENDPOINTS.SELLER_APPLICATION}`,
        { headers: authorizationHeaders() },
      );
      return response.data;
    },
    retry: false,
  });
}

export function useCreateSellerApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SellerApplicationInput) => {
      const response = await axios.post<SellerApplication>(
        `${getApiBaseUrl()}${API_ENDPOINTS.SELLER_APPLICATION}`,
        input,
        { headers: authorizationHeaders() },
      );
      return response.data;
    },
    onSuccess: (application) => queryClient.setQueryData(queryKey, application),
  });
}
