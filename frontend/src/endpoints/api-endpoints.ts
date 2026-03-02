export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/token",
  REGISTER: "/auth/signup",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/token/refresh",
  FORGOT_PASSWORD: "/auth/password-reset/request",
  RESET_PASSWORD: "/auth/password-reset/confirm",
  AUTH_ME: "/auth/user",
  DELETE_ACCOUNT: "/auth/user", // DELETE /auth/user

  // Theme (public read + admin write)
  THEME: "/theme",
  THEME_ADMIN: "/admin/theme",
  THEME_ADMIN_RESET: "/admin/theme/reset",

  // Banners (public)
  BANNERS: "/banners",

  // Popups / Topbar (public)
  POPUPS: "/popups",

  // Duyurular (public)
  ANNOUNCEMENTS: "/announcements",
  ANNOUNCEMENTS_RSS: "/announcements/rss",

  // Haberler — dış RSS feed digest
  NEWS_FEED: "/news/feed",

  // Listings RSS
  LISTINGS_RSS: "/properties/rss",

  // Site (public settings)
  SITE_SETTINGS: "/site_settings",
  SITE_GENERAL_INFO: "/site_settings",
  SLIDERS: "/sliders",
  CATEGORIES: "/categories",
  CATEGORY_COUNTS: "/categories/counts",
  SUBCATEGORIES: "/sub-categories",
  LISTING_BRANDS: "/listing-brands",
  LISTING_TAGS: "/listing-tags",
  CUSTOM_PAGES: "/custom_pages",
  PAGES: "/custom_pages",
  FAQS: "/faqs",
  CONTACTS: "/contacts", // POST → contact form submission
  FOOTER: "/footer_sections",
  MENU_ITEMS: "/menu_items",

  // Listings — public read
  LISTINGS: "/properties",
  LISTING_BY_SLUG: "/properties/by-slug",
  LISTING_META_DISTRICTS: "/properties/_meta/districts",
  LISTING_META_CITIES: "/properties/_meta/cities",
  LISTING_META_NEIGHBORHOODS: "/properties/_meta/neighborhoods",
  LISTING_META_TYPES: "/properties/_meta/types",
  LISTING_META_STATUSES: "/properties/_meta/statuses",

  // My listings — auth required
  MY_LISTINGS: "/my/listings",
  MY_LISTING: "/my/listings/:id",
  MY_LISTING_TOGGLE: "/my/listings/:id/toggle",

  // Storage — auth required
  STORAGE_UPLOAD: "/storage/:bucket/upload",

  // Profile (auth required)
  PROFILE: "/profiles/v1/me",
  UPDATE_PROFILE: "/profiles/v1/me",
  CHANGE_PASSWORD: "/auth/user",

  // Notifications (auth required)
  NOTIFICATIONS: "/notifications",
  NOTIFICATIONS_UNREAD_COUNT: "/notifications/unread-count",
  NOTIFICATIONS_MARK_ALL_READ: "/notifications/mark-all-read",

  // Chat / Conversations (auth required)
  CONVERSATIONS: "/conversations",
  CONVERSATION_MESSAGES: "/conversations/:id/messages",
  CONVERSATION_SEND: "/conversations/:id/messages",
  CONVERSATION_SEEN: "/conversations/:id/seen",

  // Support / Tickets
  SUPPORT_TICKETS: "/support/tickets",
  SUPPORT_TICKET_CREATE: "/support/tickets",
  SUPPORT_TICKET_DETAIL: "/support/tickets/:id",
  SUPPORT_TICKET_MESSAGES: "/support/tickets/:id/messages",
  SUPPORT_TICKET_ADD_MESSAGE: "/support/tickets/:id/messages",
  SUPPORT_TICKET_RESOLVE: "/support/tickets/:id/resolve",

  // AI Chat
  AI_CHAT_STATUS: "/ai-chat/status",
  AI_CHAT_SEND: "/ai-chat/send",

  // Flash Sale / Kampanyalar (public)
  FLASH_SALES: "/flash-sale",
  FLASH_SALE_BY_SLUG: "/flash-sale/by-slug",
  FLASH_SALE_ACTIVE_WITH_LISTINGS: "/flash-sale/active-with-listings",

  // Cart (auth required for persistence)
  CART_ITEMS: "/cart_items",

  // Orders & Checkout
  ORDERS: "/orders",
  ORDER_INIT_IYZICO: "/orders/:id/init-iyzico",
  ORDER_GATEWAYS: "/orders/gateways",
  ADDRESSES: "/orders/addresses",

  // Haberler (kendi makalelerimiz)
  ARTICLES:          "/articles",
  ARTICLE_BY_SLUG:   "/articles/:slug",
  ARTICLE_COMMENTS:  "/articles/:slug/comments",
  ARTICLE_LIKES:     "/articles/:slug/likes",
  ARTICLE_LIKE:      "/articles/:slug/like",
} as const;
