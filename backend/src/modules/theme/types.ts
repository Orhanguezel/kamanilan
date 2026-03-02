// =====================================================================
// Theme Types  — customer sayfası için tüm görsel konfigürasyon
// =====================================================================

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

/** Renk token'ları — hex string (örn: "#3B1F0A") */
export interface ColorTokens {
  primary:     string;  // Ana renk (koyu ceviz)
  secondary:   string;  // İkincil renk (ceviz kahve)
  accent:      string;  // Vurgu rengi (altın amber CTA)
  background:  string;  // Sayfa arka planı (kırık beyaz)
  foreground:  string;  // Ana metin rengi
  muted:       string;  // Soluk arka plan (krem)
  mutedFg:     string;  // Soluk metin rengi
  border:      string;  // Kenarlık rengi
  destructive: string;  // Hata / silme rengi
  success:     string;  // Başarı rengi (yaprak yeşili)
  // Header / Navbar
  navBg?:      string;  // Navbar arka plan (#6B3A1F)
  navFg?:      string;  // Navbar metin rengi (#FFFDF8)
  // Footer
  footerBg?:   string;  // Footer arka plan (#3B1F0A)
  footerFg?:   string;  // Footer metin rengi (#F5ECD7)
}

/**
 * Ana sayfa section konfigürasyonu.
 *
 * colsLg / colsMd / colsSm → o breakpoint'te SATIRDA kaç kart görünür.
 * (12 kolonluk grid'de: 3 kart = her kart 4/12, 4 kart = her kart 3/12)
 */
export interface SectionConfig {
  key:           string;          // "hero" | "categories" | "banner_row_1" | ...
  enabled:       boolean;         // false → section gizlenir
  order:         number;          // küçük order → üstte (float OK: 5.5, 7.5)
  label:         string;          // admin panelde gösterilen ad
  colsLg:        number;          // lg+ breakpoint'te satırdaki kart sayısı (1–12)
  colsMd:        number;          // md breakpoint'te (tablet)
  colsSm:        number;          // sm altı (mobil, genellikle 1 veya 2)
  limit:         number | null;   // null = tüm ilanlar, sayı = maksimum kart sayısı
  variant?:      string;          // section-specific görsel varyant
  bannerIds?:    string;          // banner_row_* → virgülle ayrılmış banner ID'leri: "1,2"
  flashSaleIds?: string;          // flash_sale → virgülle ayrılmış kampanya ID'leri: "1,2"
  [key: string]: unknown;         // rowId, span, adBannerPos gibi extra alanlar
}

/** Sayfa bazlı ayarlar */
export interface PageConfig {
  variant?:      string;  // "default" | "wide" | "narrow" | "centered"
  heroStyle?:    string;  // home sayfası hero: "gradient" | "image" | "minimal"
  defaultView?:  string;  // listings: "grid" | "list"
  filtersStyle?: string;  // listings: "sidebar" | "top" | "modal"
  [key: string]: string | undefined;
}

/** Haberler sayfası section konfigürasyonu */
export interface NewsSection {
  key:       string;          // "carousel" | "grid" | "sidebar" | "cover" | "meta" | "body" | ...
  enabled:   boolean;
  order:     number;
  label:     string;
  count?:    number | null;   // carousel/sidebar/related için makale adedi
  cols?:     number;          // grid için sütun sayısı (1–4)
  bannerIds?: string;         // virgülle ayrılmış banner ID'leri: "50" veya "50,51"
}

/** Ana tema konfigürasyon yapısı */
export interface ThemeConfig {
  colors:             ColorTokens;
  radius:             string;         // CSS --radius değeri: "0rem" | "0.3rem" | "0.5rem" | "0.75rem" | "1rem"
  fontFamily:         string | null;  // null = sistem font yığını
  darkMode:           "light" | "dark" | "system";
  sections:           SectionConfig[];
  pages:              Record<string, PageConfig>;
  newsListSections:   NewsSection[];  // /haberler liste sayfası blokları
  newsDetailSections: NewsSection[];  // /haberler/[slug] detay sayfası blokları
  /**
   * Quickecommerce mimarisi: layout_blocks mevcutsa sections[] yerine kullanılır.
   * Admin drag-and-drop ile yönetilir, span (4|6|12) destekler.
   */
  layout_blocks?:     LayoutBlock[];
}
