export type SellerApplicationStatus = "pending" | "approved" | "rejected";

export interface SellerApplication {
  id: string;
  store_name: string;
  contact_phone: string;
  note: string | null;
  status: SellerApplicationStatus;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}
