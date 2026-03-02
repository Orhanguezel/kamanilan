export interface UserAddress {
  id: string;
  user_id: string;
  title: string;
  full_name: string;
  phone: string;
  email?: string | null;
  address_line: string;
  city: string;
  district: string;
  postal_code?: string | null;
  is_default: number;
  created_at: string;
  updated_at: string;
}

export interface AddressInput {
  title: string;
  full_name: string;
  phone: string;
  email?: string;
  address_line: string;
  city: string;
  district: string;
  postal_code?: string;
  is_default?: boolean;
}
