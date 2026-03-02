// Profile types matching the backend

export interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  country: string | null;
  postal_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  address_line1?: string;
  city?: string;
}

// PUT /auth/user
export interface ChangePasswordInput {
  password: string;
}
