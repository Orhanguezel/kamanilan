export interface OrderItem {
  id: string;
  order_id: string;
  property_id: string;
  title: string;
  quantity: number;
  price: string;
  currency: string;
  options?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: "pending" | "confirmed" | "processing" | "pickup" | "shipped" | "delivered" | "cancelled" | "on_hold";
  total_amount: string;
  currency: string;
  payment_status: string;
  order_notes?: string | null;
  transaction_id?: string | null;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}
