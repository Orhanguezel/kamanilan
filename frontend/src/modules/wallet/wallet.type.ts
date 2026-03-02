export interface WalletInfo {
  id: string;
  user_id: string;
  balance: string;
  total_earnings: string;
  total_withdrawn: string;
  currency: string;
  status: "active" | "suspended" | "closed";
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: "credit" | "debit";
  amount: string;
  currency: string;
  purpose: string;
  description: string | null;
  payment_status: "pending" | "completed" | "failed" | "refunded";
  transaction_ref: string | null;
  is_admin_created: number;
  created_at: string;
}

export interface WalletTransactionsResponse {
  data: WalletTransaction[];
  page: number;
  limit: number;
}
