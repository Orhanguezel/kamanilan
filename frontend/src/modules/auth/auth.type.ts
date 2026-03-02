// Auth types matching the backend response format

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  email_verified: boolean;
  is_active: boolean;
  role: "admin" | "moderator" | "user";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export type RegisterResponse = LoginResponse;

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}
