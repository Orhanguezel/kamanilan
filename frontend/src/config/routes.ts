export const ROUTES = {
  HOME: "/",

  // Auth
  LOGIN: "/giris",
  REGISTER: "/kayit",
  FORGOT_PASSWORD: "/sifremi-unuttum",

  // İlanlar
  LISTINGS: "/ilanlar",
  LISTING_DETAIL: (slug: string) => `/ilan/${slug}`,
  POST_LISTING: "/ilan-ver",
  MY_LISTINGS: "/ilanlarim",

  // Kategoriler
  CATEGORIES: "/kategoriler",
  CATEGORY: (slug: string) => `/kategori/${slug}`,

  // Arama
  SEARCH: "/ara",

  // Duyurular
  ANNOUNCEMENTS: "/duyurular",
  ANNOUNCEMENT_DETAIL: (slug: string) => `/duyurular/${slug}`,

  // Statik Sayfalar
  ABOUT: "/hakkimizda",
  CONTACT: "/iletisim",
  TERMS: "/kullanim-kosullari",
  PRIVACY: "/gizlilik-politikasi",

  // Kampanyalar
  CAMPAIGNS: "/kampanyalar",
  CAMPAIGN_DETAIL: (slug: string) => `/kampanyalar/${slug}`,

  // Kullanıcı (Korumalı)
  PROFILE: "/hesabim",
  MESSAGES: "/mesajlar",
  NOTIFICATIONS: "/bildirimler",

  // Sepet
  CART: "/sepet",

  // Reklam
  ADVERTISE: "/reklam-ver",

  // Haberler
  NEWS: "/haberler",
  NEWS_DETAIL: (slug: string) => `/haberler/${slug}`,

  // Mağazalar (yakında)
  STORES: "/magazalar",
} as const;
