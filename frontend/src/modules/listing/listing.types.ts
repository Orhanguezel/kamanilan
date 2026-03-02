// Listing types matching backend's rowToPublicView (category_id based, no kind/specs_json)

export type ListingStatus =
  | "satilik"
  | "kiralik"
  | "takas"
  | "ihtiyac"
  | "ucretsiz"
  | "tukendi"
  | string;

export interface ListingAsset {
  id: string;
  url: string | null;
  alt: string | null;
  is_cover: boolean;
  display_order: number;
  kind: string;
  mime: string | null;
}

export interface ListingVariantValue {
  variant_id:   string;
  value:        string;
  variant_name: string;
  variant_slug: string;
  value_type:   string;
  options:      string[] | null;
  unit_symbol:  string | null;
  unit_name:    string | null;
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;

  category_id:     string | null;
  sub_category_id: string | null;
  brand_id:        string | null;

  status: ListingStatus;

  address:      string;
  district:     string;
  city:         string;
  neighborhood: string | null;

  coordinates: { lat: number; lng: number } | null;

  description: string | null;

  price:         string | null;
  currency:      string;
  is_negotiable: boolean;

  listing_no: string | null;
  badge_text: string | null;
  featured:   boolean;

  meta_title:       string | null;
  meta_description: string | null;

  has_video:        boolean;
  has_clip:         boolean;
  has_virtual_tour: boolean;
  has_map:          boolean;

  image_url:      string | null;
  image_asset_id: string | null;
  alt:            string | null;

  is_active:     boolean;
  display_order: number;
  view_count:    number;

  created_at: string;
  updated_at: string;

  has_cart?: boolean;

  // Populated by detail endpoint
  assets?:         ListingAsset[];
  images?:         string[];
  image?:          string | null;
  variant_values?: ListingVariantValue[];
  tags?:           { id: string; name: string; slug: string; color: string | null }[];
  categories?:     { id: string; name: string } | null;
}

export interface ListingListResponse {
  items: Listing[];
  total: number;
  meta?: {
    districts?: string[];
    cities?:    string[];
    statuses?:  string[];
  };
}

export interface ListingFilters {
  q?:              string;
  category_id?:    string;
  sub_category_id?: string;
  brand_id?:       string;
  tag_ids?:        string[];
  status?:         string;
  district?:       string;
  city?:           string;
  neighborhood?:   string;
  featured?:       boolean;
  price_min?:      number;
  price_max?:      number;
  sort?:           "created_at" | "updated_at" | "price";
  orderDir?:       "asc" | "desc";
  limit?:          number;
  offset?:         number;
  is_active?:      boolean;
}

// --- Meta / filter data types ---

export interface ListingCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  alt: string | null;
  is_featured: boolean;
  is_unlimited: boolean;
  display_order: number;
  whatsapp_number: string | null;
  phone_number: string | null;
}

export interface ListingSubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
  description: string | null;
  display_order: number;
}

export interface ListingBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface ListingTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}
