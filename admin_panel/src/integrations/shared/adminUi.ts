// =============================================================
// FILE: src/integrations/shared/adminUi.ts
// FINAL — Admin UI copy (site_settings.ui_admin) normalizer
// =============================================================

import { parseJsonObject, uiText } from '@/integrations/shared';
import type { AdminNavCopy } from '@/navigation/sidebar/sidebar-items';

export type AdminUiCommonCopy = {
  actions: {
    create: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    refresh: string;
    search: string;
    filter: string;
    close: string;
    back: string;
    confirm: string;
  };
  states: {
    loading: string;
    error: string;
    empty: string;
    updating: string;
    saving: string;
  };
};

export type AdminUiPageCopy = Record<string, string>;

export type AdminUiCopy = {
  app_name: string;
  app_version?: string;
  developer_branding?: {
    name: string;
    url: string;
    full_name: string;
  };
  nav: AdminNavCopy;
  common: AdminUiCommonCopy;
  pages: Record<string, AdminUiPageCopy>;
};

const emptyCommon: AdminUiCommonCopy = {
  actions: {
    create: '',
    edit: '',
    delete: '',
    save: '',
    cancel: '',
    refresh: '',
    search: '',
    filter: '',
    close: '',
    back: '',
    confirm: '',
  },
  states: {
    loading: '',
    error: '',
    empty: '',
    updating: '',
    saving: '',
  },
};

const emptyNav: AdminNavCopy = {
  labels: {
    general: '',
    content: '',
    integrations: '',
    marketing: '',
    communication: '',
    system: '',
  },
  items: {
    dashboard: '',
    site_settings: '',
    integration_settings: '',
    theme_management: '',
    custom_pages: '',
    categories: '',
    subcategories: '',
    library: '',
    products: '',
    brands: '',
    variants: '',
    units: '',
    sellers: '',
    sparepart: '',
    services: '',
    flash_sale: '',
    popups: '',
    banners: '',
    sliders: '',
    menu_items: '',
    footer_sections: '',
    faqs: '',
    offers: '',
    catalog_requests: '',
    contacts: '',
    reviews: '',
    payment_settings: '',
    shipping_distribution: '',
    commission_settings: '',
    campaign_settings: '',
    mail: '',
    users: '',
    email_templates: '',
    notifications: '',
    storage: '',
    db: '',
    audit: '',
    availability: '',
    reports: '',
    telegram: '',
    chat: '',
    references: '',
    subscriptions: '',
    announcements: '',
    articles: '',
    news_suggestions: '',
    news_sources: '',
    wallets: '',
    coupons: '',
  },
};

export function normalizeAdminUiCopy(raw: unknown): AdminUiCopy {
  const o = parseJsonObject(raw);
  const navRaw = parseJsonObject(o.nav);
  const labelsRaw = parseJsonObject(navRaw.labels);
  const itemsRaw = parseJsonObject(navRaw.items);

  const labels: AdminNavCopy['labels'] = {
    general: uiText(labelsRaw.general),
    content: uiText(labelsRaw.content),
    integrations: uiText(labelsRaw.integrations),
    marketing: uiText(labelsRaw.marketing),
    communication: uiText(labelsRaw.communication),
    system: uiText(labelsRaw.system),
  };

  const items: AdminNavCopy['items'] = {
    dashboard: uiText(itemsRaw.dashboard),
    site_settings: uiText(itemsRaw.site_settings),
    integration_settings: uiText(itemsRaw.integration_settings),
    theme_management: uiText(itemsRaw.theme_management),
    custom_pages: uiText(itemsRaw.custom_pages),
    categories: uiText(itemsRaw.categories),
    subcategories: uiText(itemsRaw.subcategories),
    library: uiText(itemsRaw.library),
    products: uiText(itemsRaw.products),
    brands: uiText(itemsRaw.brands),
    variants: uiText(itemsRaw.variants),
    units: uiText(itemsRaw.units),
    sellers: uiText(itemsRaw.sellers),
    sparepart: uiText(itemsRaw.sparepart),
    services: uiText(itemsRaw.services),
    flash_sale: uiText(itemsRaw.flash_sale),
    popups: uiText(itemsRaw.popups),
    banners: uiText(itemsRaw.banners),
    sliders: uiText(itemsRaw.sliders),
    menu_items: uiText(itemsRaw.menu_items),
    footer_sections: uiText(itemsRaw.footer_sections),
    faqs: uiText(itemsRaw.faqs),
    offers: uiText(itemsRaw.offers),
    catalog_requests: uiText(itemsRaw.catalog_requests),
    contacts: uiText(itemsRaw.contacts),
    reviews: uiText(itemsRaw.reviews),
    payment_settings: uiText(itemsRaw.payment_settings),
    shipping_distribution: uiText(itemsRaw.shipping_distribution),
    commission_settings: uiText(itemsRaw.commission_settings),
    campaign_settings: uiText(itemsRaw.campaign_settings),
    mail: uiText(itemsRaw.mail),
    users: uiText(itemsRaw.users),
    email_templates: uiText(itemsRaw.email_templates),
    notifications: uiText(itemsRaw.notifications),
    storage: uiText(itemsRaw.storage),
    db: uiText(itemsRaw.db),
    audit: uiText(itemsRaw.audit),
    availability: uiText(itemsRaw.availability),
    reports: uiText(itemsRaw.reports),
    telegram: uiText(itemsRaw.telegram),
    chat: uiText(itemsRaw.chat),
    references: uiText(itemsRaw.references),
    subscriptions: uiText(itemsRaw.subscriptions),
    announcements: uiText(itemsRaw.announcements),
    articles: uiText(itemsRaw.articles),
    news_suggestions: uiText(itemsRaw.news_suggestions),
    news_sources: uiText(itemsRaw.news_sources),
    wallets: uiText(itemsRaw.wallets),
    coupons: uiText(itemsRaw.coupons),
  };

  const commonRaw = parseJsonObject(o.common);
  const actionsRaw = parseJsonObject(commonRaw.actions);
  const statesRaw = parseJsonObject(commonRaw.states);

  const common: AdminUiCommonCopy = {
    actions: {
      create: uiText(actionsRaw.create),
      edit: uiText(actionsRaw.edit),
      delete: uiText(actionsRaw.delete),
      save: uiText(actionsRaw.save),
      cancel: uiText(actionsRaw.cancel),
      refresh: uiText(actionsRaw.refresh),
      search: uiText(actionsRaw.search),
      filter: uiText(actionsRaw.filter),
      close: uiText(actionsRaw.close),
      back: uiText(actionsRaw.back),
      confirm: uiText(actionsRaw.confirm),
    },
    states: {
      loading: uiText(statesRaw.loading),
      error: uiText(statesRaw.error),
      empty: uiText(statesRaw.empty),
      updating: uiText(statesRaw.updating),
      saving: uiText(statesRaw.saving),
    },
  };

  const pagesRaw = parseJsonObject(o.pages);
  const pages: Record<string, AdminUiPageCopy> = {};
  for (const [k, v] of Object.entries(pagesRaw)) {
    const row = parseJsonObject(v);
    const out: AdminUiPageCopy = {};
    for (const [rk, rv] of Object.entries(row)) {
      out[rk] = uiText(rv);
    }
    pages[k] = out;
  }

  const devRaw = parseJsonObject(o.developer_branding);

  return {
    app_name: uiText(o.app_name),
    app_version: uiText(o.app_version),
    developer_branding: devRaw ? {
      name: uiText(devRaw.name),
      url: uiText(devRaw.url),
      full_name: uiText(devRaw.full_name),
    } : undefined,
    nav: {
      labels: { ...emptyNav.labels, ...labels },
      items: { ...emptyNav.items, ...items },
    },
    common: {
      actions: { ...emptyCommon.actions, ...common.actions },
      states: { ...emptyCommon.states, ...common.states },
    },
    pages,
  };
}
