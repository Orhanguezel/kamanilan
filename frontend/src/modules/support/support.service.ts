"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import type {
  SupportTicket,
  TicketReply,
  CreateTicketInput,
  AddReplyInput,
} from "./support.type";

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

export function useTicketListQuery(params: { page?: number; status?: string } = {}) {
  const { page = 1, status = "" } = params;
  const limit = 20;
  const offset = (page - 1) * limit;
  return useQuery({
    queryKey: ["support-tickets", page, status],
    queryFn: async () => {
      const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (status) query.set("status", status);
      const res = await authApi().get<SupportTicket[] | { data: SupportTicket[] }>(
        `${API_ENDPOINTS.SUPPORT_TICKETS}?${query}`
      );
      const data = res.data;
      return Array.isArray(data) ? data : (data as any).data ?? [];
    },
    staleTime: 1000 * 30,
  });
}

export function useTicketRepliesQuery(ticketId: string | null) {
  return useQuery({
    queryKey: ["ticket-replies", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const url = API_ENDPOINTS.SUPPORT_TICKET_MESSAGES.replace(":id", ticketId!);
      const res = await authApi().get<TicketReply[] | { data: TicketReply[] }>(url);
      const data = res.data;
      return Array.isArray(data) ? data : (data as any).data ?? [];
    },
    refetchInterval: 5000,
  });
}

export function useCreateTicketMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTicketInput) => {
      const res = await authApi().post<SupportTicket>(API_ENDPOINTS.SUPPORT_TICKET_CREATE, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });
}

export function useAddReplyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddReplyInput) => {
      const res = await authApi().post<TicketReply>(API_ENDPOINTS.SUPPORT_TICKET_ADD_MESSAGE, data);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["ticket-replies", variables.ticket_id] });
    },
  });
}

export function useCloseTicketMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const url = API_ENDPOINTS.SUPPORT_TICKET_RESOLVE.replace(":id", ticketId);
      const res = await authApi().patch(url, { status: "closed" });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      qc.invalidateQueries({ queryKey: ["ticket-replies"] });
    },
  });
}
