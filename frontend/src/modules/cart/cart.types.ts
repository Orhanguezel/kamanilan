// src/modules/cart/cart.types.ts
import { Listing } from "../listing/listing.types";

export interface CartItemDto {
  id: string;
  user_id: string;
  property_id: string;
  quantity: number;
  selected_options: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  property: Listing | null;
}

export interface CreateCartItemInput {
  property_id: string;
  quantity: number;
  selected_options?: Record<string, unknown>;
}

export interface UpdateCartItemInput {
  quantity?: number;
  selected_options?: Record<string, unknown>;
}
