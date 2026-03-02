"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Notification } from "./notification.type";
import { useAuthStore } from "@/stores/auth-store";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import Cookies from "js-cookie";

function authApi() {
  const token = Cookies.get("auth_token");
  return axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export function useNotificationListQuery(params: {
  limit?: number;
  offset?: number;
  is_read?: boolean;
}) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["notifications", params],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await authApi().get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS, {
        params: {
          limit: params.limit ?? 50,
          offset: params.offset ?? 0,
          ...(typeof params.is_read === "boolean" ? { is_read: params.is_read } : {}),
        },
      });
      return res.data ?? [];
    },
  });
}

export function useUnreadCountQuery() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["notifications-unread-count"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await authApi().get<{ count: number }>(
        API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT
      );
      return res.data.count ?? 0;
    },
    refetchInterval: 30000,
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await authApi().patch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authApi().post(API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}
