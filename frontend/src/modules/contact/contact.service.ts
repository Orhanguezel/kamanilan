"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";

export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// POST /contacts — public, no auth required
export function useContactFormMutation() {
  return useMutation({
    mutationFn: async (data: ContactFormInput) => {
      const res = await axios.post(API_ENDPOINTS.CONTACTS, data, {
        baseURL: getApiBaseUrl(),
        timeout: 15000,
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },
  });
}
