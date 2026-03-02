// src/modules/checkout/checkout.service.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type {
  UserAddress,
  AddressInput,
  PaymentGateway,
  CreateOrderInput,
  CreateOrderResponse,
  IyzicoInitResponse
} from "./checkout.type";

export function useAddressesQuery() {
  const { findAll } = useBaseService<UserAddress>(API_ENDPOINTS.ADDRESSES);
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await findAll();
      // res.data is UserAddress[] from the axios response
      return res.data as UserAddress[];
    },
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();
  const { create } = useBaseService<UserAddress>(API_ENDPOINTS.ADDRESSES);

  return useMutation({
    mutationFn: async (data: AddressInput) => {
      const res = await create(data as unknown as Record<string, unknown>);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}

export function usePaymentGatewaysQuery() {
  const { findAll } = useBaseService<PaymentGateway>(API_ENDPOINTS.ORDER_GATEWAYS);
  return useQuery({
    queryKey: ["payment_gateways"],
    queryFn: async () => {
      const res = await findAll();
      return res.data as PaymentGateway[];
    },
  });
}

export function useCreateOrderMutation() {
  const { create } = useBaseService<CreateOrderResponse>(API_ENDPOINTS.ORDERS);
  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      const res = await create(data as unknown as Record<string, unknown>);
      return res.data;
    },
  });
}

export function useInitIyzicoMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.ORDERS);
  const api = getAxiosInstance();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const url = `/orders/${orderId}/init-iyzico`;
      const res = await api.post<IyzicoInitResponse>(url);
      return res.data;
    },
  });
}
