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
  MISSION_VISION: "/misyon-vizyon",
  QUALITY_POLICY: "/kalite-politikamiz",
  CONTACT: "/iletisim",
  TERMS: "/kullanim-kosullari",
  PRIVACY: "/gizlilik-politikasi",

  // Kampanyalar
  CAMPAIGNS: "/kampanyalar",
  CAMPAIGN_DETAIL: (slug: string) => `/kampanyalar/${slug}`,

  // Kullanıcı (Korumalı)
  PROFILE: "/hesabim",
  PROFILE_INFO: "/hesabim/profil",
  PROFILE_PASSWORD: "/hesabim/sifre-degistir",
  PROFILE_ADDRESSES: "/hesabim/adreslerim",
  PROFILE_ORDERS: "/hesabim/siparislerim",
  PROFILE_RECENTLY_VIEWED: "/hesabim/son-goruntulenenler",
  PROFILE_SUPPORT: "/hesabim/destek",
  PROFILE_WALLET: "/hesabim/cuzdan",
  PROFILE_FAVORITES: "/hesabim/favorilerim",
  MESSAGES: "/mesajlar",
  NOTIFICATIONS: "/bildirimler",

  // Sepet
  CART: "/sepet",

  // Reklam
  ADVERTISE: "/reklam-ver",

  // Haberler
  NEWS: "/haberler",
  NEWS_DETAIL: (slug: string) => `/haberler/${slug}`,

  // Kuponlar
  COUPONS: "/kuponlar",

  // Mağazalar (yakında)
  STORES: "/magazalar",

  // Kurumsal / Sayfalar dizini
  KURUMSAL: "/kurumsal",
} as const;
