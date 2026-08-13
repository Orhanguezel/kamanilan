import axios from "axios";

export const SOCIAL_LOGIN_TIMEOUT_MS = 20_000;
export const SOCIAL_LOGIN_RETRY_DELAY_MS = 1_000;

export function shouldRetrySocialLogin(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return true;
  }

  const status = error.response?.status;
  return status === 502 || status === 503 || status === 504;
}

export async function waitForSocialLoginRetry(): Promise<void> {
  await new Promise((resolve) =>
    window.setTimeout(resolve, SOCIAL_LOGIN_RETRY_DELAY_MS),
  );
}
