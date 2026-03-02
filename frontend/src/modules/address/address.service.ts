"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import type { UserAddress, AddressInput } from "./address.type";

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

export function useAddressListQuery() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await authApi().get<UserAddress[]>(API_ENDPOINTS.ADDRESSES);
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddressInput) => {
      const res = await authApi().post<UserAddress>(API_ENDPOINTS.ADDRESSES, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function useUpdateAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AddressInput> }) => {
      const res = await authApi().put<UserAddress>(`${API_ENDPOINTS.ADDRESSES}/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function useDeleteAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authApi().delete(`${API_ENDPOINTS.ADDRESSES}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}
