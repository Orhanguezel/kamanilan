// src/modules/cart/cart.service.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { useBaseService } from "@/lib/base-service";
import { useAuthStore } from "@/stores/auth-store";
import { CartItemDto, CreateCartItemInput, UpdateCartItemInput } from "./cart.types";
import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";
import { Listing } from "../listing/listing.types";

export function useCartItemsQuery() {
  const { isAuthenticated } = useAuthStore();
  const { findAll } = useBaseService<CartItemDto>(API_ENDPOINTS.CART_ITEMS);

  return useQuery({
    queryKey: ["cart_items"],
    queryFn: async () => {
      const res = await findAll();
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  const { create } = useBaseService<CartItemDto, CreateCartItemInput>(API_ENDPOINTS.CART_ITEMS);

  return useMutation({
    mutationFn: async (data: CreateCartItemInput) => {
      const res = await create(data as unknown as Record<string, unknown>);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart_items"] });
    },
  });
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService<CartItemDto, UpdateCartItemInput>(API_ENDPOINTS.CART_ITEMS);
  const api = getAxiosInstance();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCartItemInput & { id: string }) => {
      const res = await api.patch<CartItemDto>(`${API_ENDPOINTS.CART_ITEMS}/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart_items"] });
    },
  });
}

export function useDeleteCartItemMutation() {
  const queryClient = useQueryClient();
  const { delete: deleteItem } = useBaseService<CartItemDto>(API_ENDPOINTS.CART_ITEMS);

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart_items"] });
    },
  });
}

/**
 * Syncs the local zustand cart with the backend when the user is authenticated.
 */
export function useCartSync() {
  const { isAuthenticated } = useAuthStore();
  const { items, setItems } = useCartStore();
  const { data: remoteItems, isLoading } = useCartItemsQuery();
  const { mutate: addToCart } = useAddToCartMutation();

  useEffect(() => {
    if (isAuthenticated && remoteItems && !isLoading) {
      const remoteItemsMap = new Map(remoteItems.map(r => [r.property_id, r]));

      let hasLocalChanges = false;

      // 1. Push local items to server if they don't exist there
      items.forEach((localItem) => {
        if (!remoteItemsMap.has(localItem.id)) {
          addToCart({
            property_id: localItem.id,
            quantity: localItem.quantity,
          });
          hasLocalChanges = true;
        }
      });

      // 2. Update local store from server
      const newLocalItems = remoteItems
        .filter(r => !!r.property)
        .map(r => ({
          id: r.property_id,
          listing: r.property as Listing,
          quantity: r.quantity,
        }));

      // Only update local store if it differs from what's on server
      // To avoid infinite loops, we compare IDs and quantities
      const isDifferent = newLocalItems.length !== items.length || 
        newLocalItems.some((ni, idx) => ni.id !== items[idx]?.id || ni.quantity !== items[idx]?.quantity);

      if (isDifferent && !hasLocalChanges) {
        setItems(newLocalItems);
      }
    }
  }, [isAuthenticated, remoteItems, isLoading, items, addToCart, setItems]);
}
