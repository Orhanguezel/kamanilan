export type PanelRole = 'admin' | 'seller';

// Backend ile birebir aynı permission anahtarları
export type AdminPermissionKey =
  | 'admin.dashboard'
  | 'admin.properties'
  | 'admin.flash_sale'
  | 'admin.contacts'
  | 'admin.reviews';

export type AdminNavKey =
  | 'dashboard'
  | 'site_settings'
  | 'integration_settings'
  | 'theme_management'
  | 'custom_pages'
  | 'categories'
  | 'subcategories'
  | 'library'
  | 'products'
  | 'brands'
  | 'variants'
  | 'units'
  | 'sellers'
  | 'sparepart'
  | 'services'
  | 'flash_sale'
  | 'popups'
  | 'banners'
  | 'sliders'
  | 'menu_items'
  | 'footer_sections'
  | 'faqs'
  | 'contacts'
  | 'reviews'
  | 'payment_settings'
  | 'shipping_distribution'
  | 'commission_settings'
  | 'campaign_settings'
  | 'mail'
  | 'users'
  | 'email_templates'
  | 'notifications'
  | 'storage'
  | 'db'
  | 'audit'
  | 'availability'
  | 'reports'
  | 'offers'
  | 'catalog_requests'
  | 'telegram'
  | 'chat'
  | 'references'
  | 'subscriptions'
  | 'announcements'
  | 'articles'
  | 'news_sources'
  | 'news_suggestions'
  | 'wallets'
  | 'coupons';

const ADMIN_ONLY: PanelRole[] = ['admin'];
const ADMIN_AND_SELLER: PanelRole[] = ['admin', 'seller'];

const ADMIN_PERMISSION_ROLE_MAP: Record<AdminPermissionKey, PanelRole[]> = {
  'admin.dashboard': ADMIN_AND_SELLER,
  'admin.properties': ADMIN_AND_SELLER,
  'admin.flash_sale': ADMIN_AND_SELLER,
  'admin.contacts': ADMIN_AND_SELLER,
  'admin.reviews': ADMIN_AND_SELLER,
};

export function canAccessAdminPermission(role: PanelRole, key: AdminPermissionKey): boolean {
  const allowed = ADMIN_PERMISSION_ROLE_MAP[key] ?? ADMIN_ONLY;
  return allowed.includes(role);
}

const ADMIN_NAV_PERMISSION_MAP: Partial<Record<AdminNavKey, AdminPermissionKey>> = {
  dashboard: 'admin.dashboard',
  products: 'admin.properties',
  flash_sale: 'admin.flash_sale',
  contacts: 'admin.contacts',
  reviews: 'admin.reviews',
};

export function getAdminNavRoles(key: AdminNavKey): PanelRole[] {
  const permissionKey = ADMIN_NAV_PERMISSION_MAP[key];
  if (!permissionKey) return ADMIN_ONLY;
  return ADMIN_PERMISSION_ROLE_MAP[permissionKey] ?? ADMIN_ONLY;
}

const ADMIN_PERMISSION_PATHS: Record<AdminPermissionKey, string[]> = {
  'admin.dashboard': ['/admin/dashboard'],
  'admin.properties': ['/admin/ilanlar'],
  'admin.flash_sale': ['/admin/flash-sale'],
  'admin.contacts': ['/admin/contacts'],
  'admin.reviews': ['/admin/reviews'],
};

function stripQueryAndHash(pathname: string): string {
  const [noHash] = pathname.split('#', 1);
  const [clean] = (noHash ?? pathname).split('?', 1);
  return clean || '/';
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function canAccessAdminPath(role: PanelRole, pathname: string): boolean {
  if (role === 'admin') return true;
  const clean = stripQueryAndHash(pathname);
  if (matchesPrefix(clean, '/admin/profile')) return true;

  return (Object.keys(ADMIN_PERMISSION_PATHS) as AdminPermissionKey[]).some((permissionKey) => {
    if (!canAccessAdminPermission(role, permissionKey)) return false;
    const prefixes = ADMIN_PERMISSION_PATHS[permissionKey] ?? [];
    return prefixes.some((prefix) => matchesPrefix(clean, prefix));
  });
}

export type SellerMenuKey = 'dashboard' | 'store' | 'campaigns' | 'profile' | 'admin_sellers';

const SELLER_MENU_ROLE_MAP: Record<SellerMenuKey, PanelRole[]> = {
  dashboard: ADMIN_AND_SELLER,
  store: ADMIN_AND_SELLER,
  campaigns: ADMIN_AND_SELLER,
  profile: ADMIN_AND_SELLER,
  admin_sellers: ADMIN_ONLY,
};

export function getSellerMenuRoles(key: SellerMenuKey): PanelRole[] {
  return SELLER_MENU_ROLE_MAP[key] ?? ADMIN_ONLY;
}
