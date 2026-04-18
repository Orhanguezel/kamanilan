import axios from "axios";

let BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "https://www.kamanilan.com/api/v1";
if (BASE_URL.endsWith("/api")) {
  BASE_URL += "/v1";
}

export async function fetchAPI<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
  locale: string = "tr"
): Promise<T> {
  const response = await axios.get<T>(`${BASE_URL}${endpoint}`, {
    params: {
      ...params,
      language: locale,
    },
    timeout: 15000,
  });
  return response.data;
}
