"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type {
  SupportTicket,
  SupportTicketDetail,
  TicketMessage,
  CreateTicketInput,
  AddMessageInput,
  TicketListResponse,
} from "./support.type";

// --- Ticket List ---

export function useTicketListQuery(params: { page?: number; status?: string }) {
  const { getAxiosInstance } = useBaseService<SupportTicket[]>(
    API_ENDPOINTS.SUPPORT_TICKETS
  );

  return useQuery({
    queryKey: ["support-tickets", params],
    queryFn: async () => {
      const res = await getAxiosInstance().get<TicketListResponse>(
        API_ENDPOINTS.SUPPORT_TICKETS,
        {
          params: {
            page: params.page ?? 1,
            per_page: 10,
            ...(params.status && { status: params.status }),
          },
        }
      );
      return {
        tickets: res.data?.data ?? [],
        meta: res.data?.meta ?? {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        },
      };
    },
  });
}

// --- Ticket Detail ---

export function useTicketDetailQuery(ticketId: number | null) {
  const { getAxiosInstance } = useBaseService<SupportTicketDetail>(
    API_ENDPOINTS.SUPPORT_TICKET_DETAIL
  );

  return useQuery({
    queryKey: ["support-ticket", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const res = await getAxiosInstance().get<{ data: SupportTicketDetail }>(
        `${API_ENDPOINTS.SUPPORT_TICKET_DETAIL}/${ticketId}`
      );
      return res.data?.data ?? null;
    },
  });
}

// --- Ticket Messages ---

export function useTicketMessagesQuery(ticketId: number | null) {
  const { getAxiosInstance } = useBaseService<TicketMessage[]>(
    API_ENDPOINTS.SUPPORT_TICKET_MESSAGES
  );

  return useQuery({
    queryKey: ["support-ticket-messages", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const res = await getAxiosInstance().get<{ data: TicketMessage[] }>(
        `${API_ENDPOINTS.SUPPORT_TICKET_MESSAGES}/${ticketId}`
      );
      return res.data?.data ?? [];
    },
  });
}

// --- Create Ticket ---

export function useCreateTicketMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(
    API_ENDPOINTS.SUPPORT_TICKET_CREATE
  );

  return useMutation({
    mutationFn: async (data: CreateTicketInput) => {
      const res = await getAxiosInstance().post(
        API_ENDPOINTS.SUPPORT_TICKET_CREATE,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });
}

// --- Add Message ---

export function useAddMessageMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(
    API_ENDPOINTS.SUPPORT_TICKET_ADD_MESSAGE
  );

  return useMutation({
    mutationFn: async (data: AddMessageInput) => {
      const res = await getAxiosInstance().post(
        API_ENDPOINTS.SUPPORT_TICKET_ADD_MESSAGE,
        data
      );
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["support-ticket-messages", variables.ticket_id],
      });
    },
  });
}

// --- Resolve Ticket ---

export function useResolveTicketMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(
    API_ENDPOINTS.SUPPORT_TICKET_RESOLVE
  );

  return useMutation({
    mutationFn: async (ticketId: number) => {
      const res = await getAxiosInstance().patch(
        API_ENDPOINTS.SUPPORT_TICKET_RESOLVE,
        { ticket_id: ticketId }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-ticket"] });
    },
  });
}
