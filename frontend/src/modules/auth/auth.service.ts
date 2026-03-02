"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

import { useRouter, useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { getApiBaseUrl } from "@/lib/api-url";
import { AUTH_TOKEN_KEY, AUTH_USER } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  ForgotPasswordInput,
  ResetPasswordInput,
  User,
} from "./auth.type";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function persistAuth(data: LoginResponse, setUser: (u: User) => void) {
  Cookies.set(AUTH_TOKEN_KEY, data.access_token, { expires: 30 });
  Cookies.set(AUTH_USER, JSON.stringify(data.user), { expires: 30 });
  setUser(data.user);
}

export function useLoginMutation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await api.post<LoginResponse>(API_ENDPOINTS.LOGIN, data);
      return res.data;
    },
    onSuccess: (data) => {
      persistAuth(data, setUser);
      const redirectTo = searchParams.get("redirect");
      router.push(redirectTo || "/");
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await api.post<RegisterResponse>(API_ENDPOINTS.REGISTER, data);
      return res.data;
    },
    onSuccess: (data) => {
      persistAuth(data, setUser);
      router.push("/");
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      const res = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, data);
      return res.data;
    },
  });
}

export function useVerifyTokenMutation() {
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      const res = await api.post("/auth/password-reset/verify", data);
      return res.data;
    },
  });
}

export function useResetPasswordMutation() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const res = await api.post(API_ENDPOINTS.RESET_PASSWORD, data);
      return res.data;
    },
    onSuccess: () => {
      router.push("/giris");
    },
  });
}

export function useOtpLoginSendMutation() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await api.post("/auth/otp/login/send", data);
      return res.data;
    },
  });
}

export function useOtpLoginResendMutation() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await api.post("/auth/otp/login/resend", data);
      return res.data;
    },
  });
}

export function useOtpLoginVerifyMutation() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const res = await api.post<LoginResponse>("/auth/otp/login/verify", data);
      return res.data;
    },
    onSuccess: (data) => {
      persistAuth(data, setUser);
      router.push("/");
    },
  });
}

export function useSocialLoginMutation() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: { email: string; access_token: string; type: "google" | "facebook" }) => {
      const res = await api.post<LoginResponse>("/auth/social-login", data);
      return res.data;
    },
    onSuccess: (data) => {
      persistAuth(data, setUser);
      router.push("/");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return async () => {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    try {
      if (token) {
        await api.post(
          API_ENDPOINTS.LOGOUT,
          null,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
    } catch {
      // ignore
    } finally {
      Cookies.remove(AUTH_TOKEN_KEY);
      Cookies.remove(AUTH_USER);
      logout();
      router.push("/");
    }
  };
}
