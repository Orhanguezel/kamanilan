// Site settings - key/value records from backend /site_settings endpoint

export interface SiteSettingRecord {
  id: string;
  key: string;
  value: unknown;
  created_at?: string;
  updated_at?: string;
}

// Parsed site config (built from key-value records)
export interface SiteConfig {
  // Brand
  brand_name?: string;
  brand_display_name?: string;
  brand_subtitle?: string;
  brand_tagline?: string;
  // Topbar
  topbar_location?: string;
  topbar_slogan?: string;
  // Brand media — admin panel { url: "..." } formatında kaydeder
  site_logo?:       { url?: string } | string;  // Ana logo
  site_logo_light?: { url?: string } | string;  // Açık arka plan (header)
  site_logo_dark?:  { url?: string } | string;  // Koyu arka plan (footer)
  site_favicon?:    { url?: string } | string;
  brand_logo_text?: string;                      // Metin logo (seed)
  // SEO
  seo_defaults?: {
    canonicalBase?: string;
    siteName?: string;
    description?: string;
    ogLocale?: string;
    themeColor?: string;
    twitterCard?: string;
    robots?: string;
    googlebot?: string;
  };
  seo_app_icons?: {
    appleTouchIcon?: string;
    favicon?: string;
    faviconSvg?: string;
    logoIcon192?: string;
    logoIcon512?: string;
  };
  // Contact
  contact_phone_display?: string;
  contact_phone_tel?: string;
  contact_email?: string;
  contact_address?: string;
  contact_whatsapp_link?: string;
  ai_chat_enabled?: boolean;
  [key: string]: unknown;
}

export interface SliderItem {
  id: string;
  title: string;
  description: string;
  image: string;
  image2?: string;
  alt?: string;
  badgeText?: string;
  badgeColor?: string;
  gradient?: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
  priority?: "low" | "medium" | "high";
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;   // Unsplash / depolama URL'si
  alt: string | null;         // img alt metni
  icon: string | null;        // emoji karakteri (ör: "🏠") — resim yoksa fallback
  is_active: boolean;
  is_featured: boolean;
  /** true ise abonelik/limit olmadan ilan verilebilir (ör. Cenaze İlanları) */
  is_unlimited: boolean;
  display_order: number;
  whatsapp_number: string | null;
  phone_number: string | null;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  is_active: boolean;
}

export interface SubCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  icon?: string | null;
  is_active?: boolean | number;
  display_order: number;
}

export interface MenuItemDto {
  id: string;
  title: string;
  url: string;
  href: string;
  section_id: string | null;
  icon: string | null;
  is_active: boolean;
  parent_id: string | null;
  order_num: number;
  position: number;
  locale: string | null;
}

export interface FooterSectionDto {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  is_active: 0 | 1 | boolean;
  display_order: number;
}
