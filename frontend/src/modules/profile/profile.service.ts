"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import type { CustomerProfile, UpdateProfileInput, ChangePasswordInput } from "./profile.type";

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

export function useProfileQuery() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await authApi().get<CustomerProfile>(API_ENDPOINTS.PROFILE);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const res = await authApi().put<CustomerProfile>(API_ENDPOINTS.UPDATE_PROFILE, {
        profile: data,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const res = await authApi().put(API_ENDPOINTS.CHANGE_PASSWORD, data);
      return res.data;
    },
  });
}

// DELETE /auth/user — delete own account (requires backend implementation)
export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: async () => {
      const res = await authApi().delete(API_ENDPOINTS.DELETE_ACCOUNT);
      return res.data;
    },
  });
}
