/**
 * Quickecommerce mimarisi: Her homepage section bir LayoutBlock'tur.
 * id = "type__instance" formatı (örn: "banner_section__2")
 */
export interface LayoutBlock {
  id: string;                        // "banner_section__1", "hero__1"
  type: string;                      // section tipi
  instance: number;                  // kaçıncı instance (1, 2, 3...)
  enabled_disabled: "on" | "off";   // aktif/pasif
  config?: {
    banner_span?: 4 | 6 | 12;       // banner_section için kolon genişliği
    flash_sale_span?: 4 | 6 | 12;   // flash_sale için kolon genişliği
    [key: string]: unknown;
  };
}

/** Renk token'ları (hex) */
export interface ColorTokens {
  primary:     string;
  secondary:   string;
  accent:      string;
  background:  string;
  foreground:  string;
  muted:       string;
  mutedFg:     string;
  border:      string;
  destructive: string;
  success:     string;
  // Header / Navbar
  navBg?:      string;   // Navbar arka plan (#6B3A1F)
  navFg?:      string;   // Navbar metin rengi (#FFFDF8)
  // Footer
  footerBg?:   string;   // Footer arka plan (#3B1F0A)
  footerFg?:   string;   // Footer metin rengi (#F5ECD7)
}

/**
 * Ana sayfa section konfigürasyonu.
 * colsLg/colsMd/colsSm = o breakpoint'te bir satırdaki kart sayısı.
 */
export interface SectionConfig {
  key:          string;
  enabled:      boolean;
  order:        number;
  label:        string;
  colsLg:       number;  // lg+ → kaç kart yan yana (section içi grid)
  colsMd:       number;  // md  → kaç kart yan yana
  colsSm:       number;  // sm  → kaç kart yan yana (mobil)
  limit:        number | null;
  variant?:     string;
  /** Gösterilecek flash sale ID'leri (virgülle ayrılmış): "1,2" — flash_sale section'ı için */
  flashSaleIds?: string;
  /** 12-kolon sayfada bu section'ın kaç kolon kaplayacağı (1-12). rowId ile kullanılır. */
  span?:        number;
  /** Aynı rowId'ye sahip section'lar tek bir satırda yan yana render edilir. */
  rowId?:       string;
}

/** Sayfa bazlı ayarlar */
export interface PageConfig {
  variant?:      string;
  heroStyle?:    string;
  defaultView?:  string;
  filtersStyle?: string;
  [key: string]: string | undefined;
}

/** Haberler sayfası bölüm konfigürasyonu */
export interface NewsSection {
  key:       string;
  enabled:   boolean;
  order:     number;
  label:     string;
  count?:    number | null;
  cols?:     number;
  /** Gösterilecek banner ID'leri (virgülle ayrılmış): "50" veya "50,51" */
  bannerIds?: string;
}

/** Tam tema konfigürasyonu (GET /theme response) */
export interface ThemeConfig {
  colors:             ColorTokens;
  radius:             string;
  fontFamily:         string | null;
  darkMode:           "light" | "dark" | "system";
  sections:           SectionConfig[];
  pages:              Record<string, PageConfig>;
  newsListSections?:   NewsSection[];
  newsDetailSections?: NewsSection[];
  /**
   * Quickecommerce mimarisi: layout_blocks mevcutsa sections[] yerine kullanılır.
   * Admin drag-and-drop ile yönetilir, span (4|6|12) destekler.
   */
  layout_blocks?:     LayoutBlock[];
}

export interface ThemeSectionConfig {
  enabled_disabled?: "on" | "off" | string;
  title?: string;
  subtitle?: string;
  column_span?: number | string;
  [key: string]: unknown;
}

export interface ThemeHomePage {
  slider?: ThemeSectionConfig[];
  category?: ThemeSectionConfig[];
  flash_sale?: ThemeSectionConfig[];
  product_featured?: ThemeSectionConfig[];
  banner_section?: ThemeSectionConfig[];
  product_latest?: ThemeSectionConfig[];
  product_top_selling?: ThemeSectionConfig[];
  popular_product_section?: ThemeSectionConfig[];
  blog_section?: ThemeSectionConfig[];
  top_stores_section?: ThemeSectionConfig[];
  newsletters_section?: ThemeSectionConfig[];
  all_products_section?: ThemeSectionConfig[];
  layout_blocks?: Array<{
    id?: string;
    type: string;
    instance?: number;
    enabled_disabled?: "on" | "off" | string;
    config?: Record<string, unknown>;
  }>;
  section_order?: string[];
  [key: string]: unknown;
}

export interface ThemeLoginPage {
  customer?: Array<{
    enabled_disabled?: "on" | "off" | string;
    title?: string;
    subtitle?: string;
    img_url?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface ThemeRegisterPage {
  title?: string;
  subtitle?: string;
  description?: string;
  terms_page_title?: string;
  terms_page_url?: string;
  social_login_enable_disable?: "on" | "off" | string;
  img_url?: string;
  [key: string]: unknown;
}

export interface ThemeProductDetailsPage {
  delivery_enabled_disabled?: "on" | "off" | string;
  delivery_title?: string;
  delivery_subtitle?: string;
  delivery_url?: string;
  refund_enabled_disabled?: "on" | "off" | string;
  refund_title?: string;
  refund_subtitle?: string;
  refund_url?: string;
  related_title?: string;
  [key: string]: unknown;
}

export interface ThemeBlogPage {
  popular_title?: string;
  related_title?: string;
  popular_posts_section?: ThemeSectionConfig[];
  related_posts_section?: ThemeSectionConfig[];
  list_toolbar_section?: ThemeSectionConfig[];
  posts_grid_section?: ThemeSectionConfig[];
  [key: string]: unknown;
}

export interface ThemePopupSettingsPage {
  id?: string;
  enabled_disabled?: "on" | "off" | string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  button_url?: string;
  image_id_url?: string;
  img_url?: string;
  image_url?: string;
  coupon_code?: string;
  sort_order?: number | string;
  delay_seconds?: number | string;
  frequency_days?: number | string;
  page_target?: "all" | "home" | string;
  display_type?: "modal_center" | "top_bar" | "bottom_bar" | string;
  text_behavior?: "static" | "marquee" | string;
  popup_bg_color?: string;
  popup_text_color?: string;
  popup_button_bg_color?: string;
  popup_button_text_color?: string;
  [key: string]: unknown;
}
