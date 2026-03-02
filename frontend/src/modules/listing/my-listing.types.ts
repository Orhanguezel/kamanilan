import type { ListingStatus } from "./listing.types";

// Input for creating a new listing (POST /my/listings)
export interface CreateListingInput {
  title: string;
  description?: string | null;
  type: string;
  status: ListingStatus;
  category_id?: string | null;
  sub_category_id?: string | null;
  price?: number | null;
  currency?: string;
  address?: string;
  district?: string;
  city?: string;
  neighborhood?: string | null;
  coordinates?: { lat: number; lng: number } | null;

  // Real-estate specific
  gross_m2?: number | null;
  net_m2?: number | null;
  rooms?: string | null;
  bedrooms?: number | null;
  building_age?: string | null;
  floor?: string | null;
  floor_no?: number | null;
  total_floors?: number | null;
  heating?: string | null;
  usage_status?: string | null;
  furnished?: boolean;
  in_site?: boolean;
  has_elevator?: boolean;
  has_parking?: boolean;
  has_balcony?: boolean;
  has_garden?: boolean;
  has_terrace?: boolean;
  credit_eligible?: boolean;
  swap?: boolean;

  // Images: URLs already uploaded via /storage/:bucket/upload
  cover_image_url?: string | null;
  images?: string[]; // ordered list of image URLs
}

export type UpdateListingInput = Partial<CreateListingInput>;

export interface MyListingListResponse {
  items: import("./listing.types").Listing[];
  total: number;
}
