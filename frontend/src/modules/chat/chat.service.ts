"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Conversation, ChatMessage } from "./chat.type";
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

// --- Conversations list ---

export function useConversationsQuery() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["conversations"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await authApi().get<Conversation[]>(API_ENDPOINTS.CONVERSATIONS);
      return res.data ?? [];
    },
  });
}

// --- Start or get a conversation ---

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { other_user_id: string; property_id?: string | null }) => {
      const res = await authApi().post<Conversation>(API_ENDPOINTS.CONVERSATIONS, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// --- Messages for a conversation ---

export function useConversationMessagesQuery(convId: string | null) {
  return useQuery({
    queryKey: ["conv-messages", convId],
    enabled: !!convId,
    queryFn: async () => {
      const url = API_ENDPOINTS.CONVERSATION_MESSAGES.replace(":id", convId!);
      const res = await authApi().get<ChatMessage[]>(url);
      return res.data ?? [];
    },
    refetchInterval: 5000, // poll every 5s for new messages
  });
}

// --- Send message ---

export function useSendMessageMutation(convId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      if (!convId) throw new Error("no conversation");
      const url = API_ENDPOINTS.CONVERSATION_SEND.replace(":id", convId);
      const res = await authApi().post<ChatMessage>(url, { body });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conv-messages", convId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// --- Mark conversation as seen ---

export function useMarkSeenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (convId: string) => {
      const url = API_ENDPOINTS.CONVERSATION_SEEN.replace(":id", convId);
      await authApi().post(url);
    },
    onSuccess: (_data, convId) => {
      queryClient.invalidateQueries({ queryKey: ["conv-messages", convId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
