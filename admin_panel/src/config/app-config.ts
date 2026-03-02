// =============================================================
// FILE: src/config/app-config.ts
// Admin Panel Config — DB'den gelen branding verileri için fallback
// =============================================================

import packageJson from '../../package.json';
import { FALLBACK_LOCALE } from '@/i18n/config';

const currentYear = new Date().getFullYear();

export type AdminBrandingConfig = {
  app_name: string;
  app_copyright: string;
  html_lang: string;
  theme_color: string;
  favicon_16: string;
  favicon_32: string;
  apple_touch_icon: string;
  meta: {
    title: string;
    description: string;
    og_url: string;
    og_title: string;
    og_description: string;
    og_image: string;
    twitter_card: string;
  };
};

export const DEFAULT_BRANDING: AdminBrandingConfig = {
  app_name: 'Kaman Ilan Admin Panel',
  app_copyright: 'Kaman Ilan',
  html_lang: FALLBACK_LOCALE,
  theme_color: '#2563eb',
  favicon_16: '/favicon/favicon.svg',
  favicon_32: '/favicon/favicon.svg',
  apple_touch_icon: '/apple/apple-touch-icon.png',
  meta: {
    title: 'Kaman Ilan Admin Panel',
    description:
      'Kaman Ilan yonetim paneli. Kategoriler, ilanlar, slider, iletisim ve site ayarlari yonetimi.',
    og_url: 'https://kamanilan.com/admin',
    og_title: 'Kaman Ilan Admin Panel',
    og_description:
      'Kaman Ilan yonetim paneli ile ilan ve icerik yonetimini merkezi olarak yapin.',
    og_image: '/logo/og-image.png',
    twitter_card: 'summary_large_image',
  },
};

export const APP_CONFIG = {
  name: DEFAULT_BRANDING.app_name,
  version: packageJson.version,
  copyright: `© ${currentYear}, ${DEFAULT_BRANDING.app_copyright}.`,
  meta: {
    title: DEFAULT_BRANDING.meta.title,
    description: DEFAULT_BRANDING.meta.description,
  },
  branding: DEFAULT_BRANDING,
} as const;
