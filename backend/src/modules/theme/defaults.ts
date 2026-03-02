import type { ThemeConfig, LayoutBlock } from './types';

/** Varsayılan layout_blocks — quickecommerce mimarisi */
export const DEFAULT_LAYOUT_BLOCKS: LayoutBlock[] = [
  { id: "hero__1",                    type: "hero",                    instance: 1, enabled_disabled: "on" },
  { id: "category__1",                type: "category",                instance: 1, enabled_disabled: "on" },
  { id: "flash_sale__1",              type: "flash_sale",              instance: 1, enabled_disabled: "on",  config: { flash_sale_span: 6 } },
  { id: "flash_sale__2",              type: "flash_sale",              instance: 2, enabled_disabled: "off", config: { flash_sale_span: 6 } },
  { id: "product_featured__1",        type: "product_featured",        instance: 1, enabled_disabled: "on" },
  { id: "banner_section__1",          type: "banner_section",          instance: 1, enabled_disabled: "on",  config: { banner_span: 4 } },
  { id: "banner_section__2",          type: "banner_section",          instance: 2, enabled_disabled: "on",  config: { banner_span: 4 } },
  { id: "banner_section__3",          type: "banner_section",          instance: 3, enabled_disabled: "on",  config: { banner_span: 4 } },
  { id: "product_top_selling__1",     type: "product_top_selling",     instance: 1, enabled_disabled: "on" },
  { id: "product_latest__1",          type: "product_latest",          instance: 1, enabled_disabled: "on" },
  { id: "popular_product_section__1", type: "popular_product_section", instance: 1, enabled_disabled: "on" },
  { id: "top_stores_section__1",      type: "top_stores_section",      instance: 1, enabled_disabled: "on" },
  { id: "announcements__1",           type: "announcements",           instance: 1, enabled_disabled: "on" },
  { id: "news_feed__1",               type: "news_feed",               instance: 1, enabled_disabled: "on" },
  { id: "newsletters_section__1",     type: "newsletters_section",     instance: 1, enabled_disabled: "on" },
  { id: "infinite_listings__1",       type: "infinite_listings",       instance: 1, enabled_disabled: "on" },
];

/** Veritabanında kayıt yoksa veya parse edilemezse kullanılan varsayılan tema */
export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    // ── Kaman İlan Marka Renkleri (Ceviz Bahçesi — Yeşil Tema) ───────
    primary:     '#1B4332',   // Orman Yeşili      — başlıklar, primary buton
    secondary:   '#40916C',   // Orta Yeşil        — linkler, secondary
    accent:      '#D4873C',   // Altın Amber        — CTA, vurgu (kontrast)
    background:  '#F8FBF8',   // Açık Beyaz-Yeşil  — sayfa arka planı
    foreground:  '#1A2E1E',   // Koyu Yeşil Metin  — ana metin
    muted:       '#E8F2EB',   // Açık Yeşil Krem   — kartlar, soluk arka plan
    mutedFg:     '#52796F',   // Mat Deniz Yeşili  — soluk metin
    border:      '#C8DDD0',   // Açık Yeşil        — kenarlıklar
    destructive: '#ef4444',   // Hata / silme
    success:     '#52B788',   // Canlı Yeşil       — başarı, tamamlandı
    // ── Header / Navbar ───────────────────────────────────────────────
    navBg:       '#2D6A4F',   // Ceviz Bahçesi Yeşili — sticky navbar
    navFg:       '#F8FBF8',   // Açık metin
    // ── Footer ────────────────────────────────────────────────────────
    footerBg:    '#1B4332',   // Orman Yeşili — footer
    footerFg:    '#E8F2EB',   // Açık Yeşil Krem metin
  },

  radius:     '0.375rem',
  fontFamily: 'Nunito, sans-serif',
  darkMode:   'light',

  sections: [
    {
      key:     'hero',
      enabled: true,
      order:   1,
      label:   'Hero Bölümü',
      colsLg:  1,
      colsMd:  1,
      colsSm:  1,
      limit:   null,
      variant: 'carousel',
    },
    {
      key:     'categories',
      enabled: true,
      order:   2,
      label:   'Tüm Kategoriler',
      colsLg:  6,
      colsMd:  4,
      colsSm:  3,
      limit:   null,
      variant: 'scroll',
    },
    {
      key:       'banner_row_1',
      enabled:   true,
      order:     2.5,
      label:     'Reklam Bandı — Tam Satır',
      variant:   'home_top',
      colsLg:    1,
      colsMd:    1,
      colsSm:    1,
      limit:     2,
      bannerIds: '1,2',
    },
    {
      key:     'featured',
      enabled: true,
      order:   3,
      label:   'Öne Çıkan İlanlar',
      colsLg:  3,
      colsMd:  2,
      colsSm:  1,
      limit:   6,
    },
    {
      key:     'recent',
      enabled: true,
      order:   4,
      label:   'Son İlanlar',
      colsLg:  4,
      colsMd:  2,
      colsSm:  1,
      limit:   8,
    },
  ],

  pages: {
    home: {
      variant:   'default',
      heroStyle: 'carousel',
    },
    listings: {
      variant:      'default',
      defaultView:  'grid',
      filtersStyle: 'sidebar',
    },
    listing_detail: {
      variant: 'default',
    },
    haberler: {
      variant:        'default',
      carouselCount:  '6',
      gridStart:      '6',
      sidebarEnabled: 'true',
      perPage:        '60',
      adBannerPos:    'news_sidebar',
    },
    about: {
      variant: 'centered',
    },
    contact: {
      variant: 'default',
    },
  },

  newsListSections: [
    { key: 'banner_full_1',    enabled: true, order: 0,  label: 'Tam Genişlik Reklam 1', bannerIds: '52' },
    { key: 'carousel',         enabled: true, order: 1,  label: 'Carousel',              count: 6 },
    { key: 'grid',             enabled: true, order: 2,  label: 'Haber Listesi',          cols:  3 },
    { key: 'banner_sidebar_1', enabled: true, order: 3,  label: 'Sidebar Üst Reklam',    bannerIds: '50' },
    { key: 'sidebar',          enabled: true, order: 4,  label: 'Kenar Çubuğu',          count: 8 },
    { key: 'banner_sidebar_2', enabled: true, order: 5,  label: 'Sidebar Alt Reklam',    bannerIds: '51' },
    { key: 'banner_full_2',    enabled: true, order: 10, label: 'Tam Genişlik Reklam 2', bannerIds: '53' },
  ],

  newsDetailSections: [
    { key: 'banner_full_1',  enabled: true, order: 0,  label: 'Makale Üstü Tam Reklam',  bannerIds: '57' },
    { key: 'cover',          enabled: true, order: 1,  label: 'Kapak Görseli'                             },
    { key: 'meta',           enabled: true, order: 2,  label: 'Yazar & Tarih'                             },
    { key: 'body',           enabled: true, order: 3,  label: 'Makale İçeriği'                            },
    { key: 'video',          enabled: true, order: 4,  label: 'Video Embed'                               },
    { key: 'tags',           enabled: true, order: 5,  label: 'Etiketler'                                 },
    { key: 'comments',       enabled: true, order: 6,  label: 'Yorumlar'                                  },
    { key: 'banners_top',    enabled: true, order: 7,  label: 'Sidebar Üst Reklam',       bannerIds: '55' },
    { key: 'related',        enabled: true, order: 8,  label: 'İlgili Haberler',          count: 7        },
    { key: 'banners_bottom', enabled: true, order: 9,  label: 'Sidebar Alt Reklam',       bannerIds: '56' },
    { key: 'banner_full_2',  enabled: true, order: 10, label: 'Makale Altı Tam Reklam',   bannerIds: '58' },
  ],

  layout_blocks: DEFAULT_LAYOUT_BLOCKS,
};
