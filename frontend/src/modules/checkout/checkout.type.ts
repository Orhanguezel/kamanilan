// src/modules/checkout/checkout.type.ts

export interface UserAddress {
  id: string;
  title: string;
  full_name: string;
  phone: string;
  email: string | null;
  address_line: string;
  city: string;
  district: string;
  postal_code: string | null;
  is_default: number;
}

export interface AddressInput {
  title: string;
  full_name: string;
  phone: string;
  email?: string | null;
  address_line: string;
  city: string;
  district: string;
  postal_code?: string | null;
  is_default?: number;
}

export interface PaymentGateway {
  id: string;
  name: string;
  slug: string;
  is_test_mode: boolean;
}

export interface CreateOrderInput {
  shipping_address_id: string;
  billing_address_id?: string;
  payment_gateway_slug: string;
  order_notes?: string;
  items: {
    property_id: string;
    quantity: number;
  }[];
}

export interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  order_number: string;
}

export interface IyzicoInitResponse {
  success: boolean;
  checkout_url: string;
  token: string;
}
