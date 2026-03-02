"use client";

import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import { useSiteSettingsQuery } from "./site.service";

// Re-export for convenience
export { useSiteSettingsQuery };

export const useSiteConfigQuery = () => {
  return useSiteSettingsQuery();
};

export const useSiteInfoQuery = () => {
  const q = useSiteSettingsQuery();
  return { ...q, siteInfo: q.data };
};
