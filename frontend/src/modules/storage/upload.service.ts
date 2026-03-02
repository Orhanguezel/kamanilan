"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "@/lib/api-url";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { AUTH_TOKEN_KEY } from "@/lib/constants";

export interface UploadResult {
  url: string;   // public URL to access the file
  path: string;  // storage path within the bucket
  bucket: string;
}

// POST /storage/:bucket/upload  — multipart/form-data, auth required
export function useUploadImageMutation(bucket = "listings") {
  return useMutation({
    mutationFn: async (file: File) => {
      const token = Cookies.get(AUTH_TOKEN_KEY) ?? "";
      const formData = new FormData();
      formData.append("file", file);

      const url = API_ENDPOINTS.STORAGE_UPLOAD.replace(":bucket", bucket);
      const res = await axios.post<UploadResult>(url, formData, {
        baseURL: getApiBaseUrl(),
        timeout: 60000,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
  });
}

// Upload multiple files sequentially, returns ordered result array
export function useUploadMultipleImagesMutation(bucket = "listings") {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const token = Cookies.get(AUTH_TOKEN_KEY) ?? "";
      const url = API_ENDPOINTS.STORAGE_UPLOAD.replace(":bucket", bucket);

      const results: UploadResult[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await axios.post<UploadResult>(url, formData, {
          baseURL: getApiBaseUrl(),
          timeout: 60000,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        results.push(res.data);
      }
      return results;
    },
  });
}
