import { env } from "@/env.mjs";

/**
 * Returns the API base URL.
 * In the browser during development, uses Next.js rewrite proxy to avoid CORS.
 * On the server or in production, uses the direct API URL.
 */
export function getApiBaseUrl(): string {
  const isDev = process.env.NODE_ENV === "development";
  const isBrowser = typeof window !== "undefined";

  if (isDev && isBrowser) {
    return "/api/proxy";
  }

  return env.NEXT_PUBLIC_REST_API_ENDPOINT;
}
