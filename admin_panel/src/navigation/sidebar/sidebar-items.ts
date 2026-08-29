// =============================================================
// FILE: src/navigation/sidebar/sidebar-items.ts
// FINAL — GuezelWebDesign — Sidebar items (labels are dynamic via site_settings.ui_admin)
// - Dashboard base: /admin/dashboard
// - Admin pages: /admin/...  (route group "(admin)" URL'e dahil olmaz)
// =============================================================

import {
  Bell,
  Contact2,
  CreditCard,
  Database,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Folders,
  HardDrive,
  HelpCircle,
  ImageDown,
  Images,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Package,
  Rss,
  Send,
  Settings,
  Tag,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { TranslateFn } from '@/i18n';
import { getAdminNavRoles } from '@/navigation/permissions';
import type { AdminNavKey } from '@/navigation/permissions';
import type { PanelRole } from '@/navigation/permissions';

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export type AdminSidebarRole = PanelRole;

export type AdminNavItemKey = AdminNavKey;

export type AdminNavGroupKey =
  | 'general'
  | 'catalog'
  | 'editorial'
  | 'commerce'
  | 'marketing'
  | 'appearance'
  | 'communication'
  | 'integrations'
  | 'system';

export type AdminNavConfigItem = {
  key: AdminNavItemKey;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  roles?: AdminSidebarRole[];
};

export type AdminNavConfigGroup = {
  id: number;
  key: AdminNavGroupKey;
  items: AdminNavConfigItem[];
};

export const adminNavConfig: AdminNavConfigGroup[] = [
  // 1) Genel — gunluk giris noktasi
  {
    id: 1,
    key: 'general',
    items: [{ key: 'dashboard', url: '/admin/dashboard', icon: LayoutDashboard }],
  },
  // 2) Ilanlar & Katalog — asil pazar yeri envanteri
  {
    id: 2,
    key: 'catalog',
    items: [
      { key: 'products', url: '/admin/ilanlar', icon: Package },
      { key: 'categories', url: '/admin/categories', icon: Folders },
      { key: 'subcategories', url: '/admin/subcategories', icon: FolderOpen },
      { key: 'brands', url: '/admin/brands', icon: Package },
      { key: 'variants', url: '/admin/variants', icon: Settings },
      { key: 'units', url: '/admin/units', icon: Settings },
      { key: 'imports', url: '/admin/imports', icon: FileSpreadsheet },
      { key: 'xml_feeds', url: '/admin/xml-feeds', icon: Rss },
      { key: 'photo_queue', url: '/admin/photo-queue', icon: ImageDown },
    ],
  },
  // 3) Haber & Duyuru — editoryal icerik ve AI haber hatti
  {
    id: 3,
    key: 'editorial',
    items: [
      { key: 'articles', url: '/admin/articles', icon: FileText },
      { key: 'announcements', url: '/admin/announcements', icon: Megaphone },
      { key: 'news_suggestions', url: '/admin/news-suggestions', icon: FileText },
      { key: 'news_image_queue', url: '/admin/news-image-queue', icon: ImageDown },
      { key: 'news_sources', url: '/admin/news-sources', icon: FileText },
      { key: 'faqs', url: '/admin/faqs', icon: HelpCircle },
    ],
  },
  // 4) Magaza & Uyelik — saticilar ve abonelik/cuzdan
  {
    id: 4,
    key: 'commerce',
    items: [
      { key: 'sellers', url: '/admin/sellers', icon: Users },
      { key: 'subscriptions', url: '/admin/subscriptions', icon: CreditCard },
      { key: 'wallets', url: '/admin/wallet', icon: CreditCard },
    ],
  },
  // 5) Pazarlama & Reklam — reklam motoru + kampanya araclari
  {
    id: 5,
    key: 'marketing',
    items: [
      { key: 'ads', url: '/admin/ads', icon: Megaphone },
      { key: 'ads_operations', url: '/admin/ads/operations', icon: Settings },
      { key: 'banners', url: '/admin/banners', icon: Images },
      { key: 'flash_sale', url: '/admin/flash-sale', icon: Bell },
      { key: 'popups', url: '/admin/popups', icon: Bell },
      { key: 'coupons', url: '/admin/kuponlar', icon: Tag },
    ],
  },
  // 6) Site & Gorunum — vitrin yapisi ve tema
  {
    id: 6,
    key: 'appearance',
    items: [
      { key: 'site_settings', url: '/admin/site-settings', icon: Settings },
      { key: 'theme_management', url: '/admin/theme', icon: Settings },
      { key: 'sliders', url: '/admin/slider', icon: Images },
      { key: 'custom_pages', url: '/admin/custompage', icon: FileText },
      { key: 'menu_items', url: '/admin/menuitem', icon: FileText },
      { key: 'footer_sections', url: '/admin/footer-sections', icon: FileText },
    ],
  },
  // 7) Iletisim & CRM — musteri temasi
  {
    id: 7,
    key: 'communication',
    items: [
      { key: 'contacts', url: '/admin/contacts', icon: Contact2 },
      { key: 'reviews', url: '/admin/reviews', icon: MessageSquare },
      {
        key: 'campaign_settings',
        url: '/admin/dashboard/coming-soon?module=campaign_settings',
        icon: Bell,
        comingSoon: true,
      },
      {
        key: 'mail',
        url: '/admin/dashboard/coming-soon?module=mail',
        icon: Send,
        comingSoon: true,
      },
    ],
  },
  // 8) Entegrasyonlar — 3. taraf API
  {
    id: 8,
    key: 'integrations',
    items: [{ key: 'integration_settings', url: '/admin/integrations', icon: Settings }],
  },
  // 9) Sistem & Ayarlar — altyapi
  {
    id: 9,
    key: 'system',
    items: [
      { key: 'users', url: '/admin/users', icon: Users },
      { key: 'storage', url: '/admin/storage', icon: HardDrive },
      { key: 'db', url: '/admin/db', icon: Database },
      {
        key: 'payment_settings',
        url: '/admin/dashboard/coming-soon?module=payment_settings',
        icon: Database,
        comingSoon: true,
      },
      {
        key: 'shipping_distribution',
        url: '/admin/dashboard/coming-soon?module=shipping_distribution',
        icon: HardDrive,
        comingSoon: true,
      },
      {
        key: 'commission_settings',
        url: '/admin/dashboard/coming-soon?module=commission_settings',
        icon: Database,
        comingSoon: true,
      },
      {
        key: 'notifications',
        url: '/admin/dashboard/coming-soon?module=notifications',
        icon: Bell,
        comingSoon: true,
      },
    ],
  },
];

export type AdminNavCopy = {
  labels: Record<AdminNavGroupKey, string>;
  items: Record<AdminNavItemKey, string>;
};

// Fallback titles for when translations are missing
const FALLBACK_TITLES: Record<AdminNavItemKey, string> = {
  dashboard: 'Dashboard',
  site_settings: 'Site Settings',
  integration_settings: 'Integration Settings',
  theme_management: 'Theme Management',
  custom_pages: 'Custom Pages',
  categories: 'Categories',
  subcategories: 'Subcategories',
  library: 'Library',
  products: 'Products',
  brands: 'Brands',
  variants: 'Variants',
  units: 'Units',
  sellers: 'Sellers',
  sparepart: 'Spare Parts',
  services: 'Services',
  flash_sale: 'Flash Sale',
  popups: 'Popups',
  banners: 'Banners',
  ads: 'Reklam Kampanyaları',
  ads_operations: 'Reklam Operasyon Merkezi',
  sliders: 'Sliders',
  menu_items: 'Menu Items',
  footer_sections: 'Footer Sections',
  faqs: 'FAQs',
  offers: 'Offers',
  catalog_requests: 'Catalog Requests',
  contacts: 'Contacts',
  reviews: 'Reviews',
  payment_settings: 'Payment Settings',
  shipping_distribution: 'Shipping & Distribution',
  commission_settings: 'Commission Settings',
  campaign_settings: 'Campaign Settings',
  mail: 'Mail',
  users: 'Users',
  email_templates: 'Email Templates',
  notifications: 'Notifications',
  storage: 'Storage',
  db: 'Database',
  audit: 'Audit',
  availability: 'Availability',
  reports: 'Reports',
  telegram: 'Telegram',
  chat: 'Chat & AI',
  references: 'References',
  subscriptions: 'Subscriptions',
  wallets: 'Cüzdanlar',
  coupons: 'Kuponlar',
  announcements: 'Duyurular',
  articles: 'Haberler',
  news_suggestions: 'Haber Önerileri',
  news_image_queue: 'Haber Görsel Kuyruğu',
  news_sources: 'Haber Kaynakları',
  imports: 'Toplu Import',
  xml_feeds: 'XML Feed',
  photo_queue: 'Foto Kuyruğu',
};

function translatedOrEmpty(t: TranslateFn | undefined, key: string): string {
  if (!t) return '';
  const translated = t(key as any);
  return translated === key ? '' : translated;
}

export function buildAdminSidebarItems(
  copy?: Partial<AdminNavCopy> | null,
  t?: TranslateFn,
  role: AdminSidebarRole = 'admin',
): NavGroup[] {
  const labels = copy?.labels ?? ({} as AdminNavCopy['labels']);
  const items = copy?.items ?? ({} as AdminNavCopy['items']);

  return adminNavConfig.map((group) => {
    // 1. Try copy.labels[group.key]
    // 2. Try t(`admin.sidebar.groups.${group.key}`)
    // 3. Fallback to empty (or key)
    const label = labels[group.key] || translatedOrEmpty(t, `admin.sidebar.groups.${group.key}`);

    return {
      id: group.id,
      label,
      items: group.items
        .filter((item) => {
          const allowed = item.roles ?? getAdminNavRoles(item.key);
          if (!allowed?.length) return role === 'admin';
          return allowed.includes(role);
        })
        .map((item) => {
        // 1. Try copy.items[item.key]
        // 2. Try t(`admin.dashboard.items.${item.key}`)
        // 3. Fallback to FALLBACK_TITLES
        // 4. Fallback to key
        const title =
          items[item.key] ||
          translatedOrEmpty(t, `admin.dashboard.items.${item.key}`) ||
          FALLBACK_TITLES[item.key] ||
          item.key;

          return {
            title,
            url: item.url,
            icon: item.icon,
            comingSoon: item.comingSoon,
          };
        }),
    };
  }).filter((group) => group.items.length > 0);
}
