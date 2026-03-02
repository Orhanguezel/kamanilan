export type FlashSaleScopeType = "all" | "categories" | "subcategories" | "properties" | "sellers";

export interface FlashSale {
  id: string;
  title: string;
  slug: string;
  locale: string;
  description: string | null;

  // İndirim
  discount_type: "percent" | "amount";
  discount_value: string;

  // Kapsam
  scope_type: FlashSaleScopeType;
  scope_ids?: string[];

  // Görsel
  cover_image_url: string | null;
  background_color: string | null;
  title_color: string | null;
  description_color: string | null;
  button_text: string | null;
  button_url: string | null;
  button_bg_color: string | null;
  button_text_color: string | null;
  timer_bg_color: string | null;
  timer_text_color: string | null;

  // Zamanlama
  start_at: string;
  end_at: string;
  is_active: number;
  display_order: number;

  created_at: string;
  updated_at: string;
}

/** Kampanya + eşleşen ilan listesi (ana sayfa section için) */
export interface FlashSaleWithListings {
  sale: FlashSale;
  items: FlashListingItem[];
}

/** Flash indirimli ilan özeti */
export interface FlashListingItem {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  price: string | null;
  flash_price: string | null;
  discount_label: string;
  currency: string;
  status: string;
  district: string;
  city: string;
  neighborhood: string | null;
  created_at: string;
}