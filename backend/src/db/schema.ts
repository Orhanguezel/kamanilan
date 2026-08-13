import {
  mysqlTable,
  int,
  varchar,
  decimal,
  date,
  tinyint,
  datetime,
  mysqlEnum,
  json,
  text,
  index,
  uniqueIndex,
  char,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
export const hfBanners = mysqlTable(
  "ads_banners",
  {
    id:           int("id").autoincrement().primaryKey(),
    position:     varchar("position", { length: 64 }).notNull(),
    title:        varchar("title", { length: 190 }).notNull(),
    advertiser:   varchar("advertiser", { length: 160 }),
    notes:        varchar("notes", { length: 500 }),
    type:         mysqlEnum("type", ["image", "code"]).notNull().default("image"),
    sourceType:   mysqlEnum("source_type", ["custom", "listing", "seller", "code"]).notNull().default("custom"),
    lifecycleStatus: mysqlEnum("lifecycle_status", [
      "draft", "proposal", "reserved", "payment_pending", "scheduled",
      "live", "completed", "cancelled", "problem", "archived",
    ]).notNull().default("draft"),
    paymentStatus: mysqlEnum("payment_status", ["unpaid", "partial", "paid", "waived", "refunded", "cancelled"]).notNull().default("unpaid"),
    paymentOverride: tinyint("payment_override").notNull().default(0),
    paymentOverrideReason: varchar("payment_override_reason", { length: 500 }),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    paymentDueAt: datetime("payment_due_at", { fsp: 3 }),
    paymentGraceHours: int("payment_grace_hours").notNull().default(72),
    paymentReminderSentAt: datetime("payment_reminder_sent_at", { fsp: 3 }),
    invoiceNumber: varchar("invoice_number", { length: 120 }),
    invoiceUrl: varchar("invoice_url", { length: 512 }),
    contractFileUrl: varchar("contract_file_url", { length: 512 }),
    creativeFileUrl: varchar("creative_file_url", { length: 512 }),
    creativeTemplate: varchar("creative_template", { length: 64 }).notNull().default("image"),
    creativeConfig: json("creative_config").$type<{
      backgroundColor?: string;
      textColor?: string;
      accentColor?: string;
      animation?: boolean;
      logoUrl?: string;
      backgroundImageUrl?: string;
      description?: string;
      focalX?: number;
      focalY?: number;
      imageFit?: "cover" | "contain";
      imageWidth?: number;
      imageHeight?: number;
      imageBytes?: number;
    }>(),
    qualityOverrideReason: varchar("quality_override_reason", { length: 500 }),
    qualityCheckedAt: datetime("quality_checked_at", { fsp: 3 }),
    listingId:    char("listing_id", { length: 36 }),
    sellerId:       char("seller_id", { length: 36 }),
    sponsorshipId: int("sponsorship_id"),
    dealId:       int("deal_id"),
    imageUrl:     varchar("image_url", { length: 512 }),
    alt:          varchar("alt", { length: 255 }),
    linkUrl:      varchar("link_url", { length: 500 }),
    linkTarget:   varchar("link_target", { length: 20 }).notNull().default("_blank"),
    rel:          varchar("rel", { length: 64 }).notNull().default("sponsored nofollow noopener"),
    code:         text("code"),
    caption:      varchar("caption", { length: 300 }),
    ctaLabel:     varchar("cta_label", { length: 60 }),
    device:       mysqlEnum("device", ["all", "desktop", "mobile"]).notNull().default("all"),
    desktopRow:   int("desktop_row").notNull().default(1),
    desktopColumns: int("desktop_columns").notNull().default(1),
    weight:       int("weight").notNull().default(1),
    displayOrder: int("display_order").notNull().default(0),
    isActive:     tinyint("is_active").notNull().default(0),
    startAt:      datetime("start_at", { fsp: 3 }),
    endAt:        datetime("end_at", { fsp: 3 }),
    reservationExpiresAt: datetime("reservation_expires_at", { fsp: 3 }),
    salesOwner: varchar("sales_owner", { length: 160 }),
    cancellationReason: varchar("cancellation_reason", { length: 500 }),
    archivedAt:   datetime("archived_at", { fsp: 3 }),
    impressions:  int("impressions").notNull().default(0),
    clicks:       int("clicks").notNull().default(0),
    impressionLimit: int("impression_limit"),
    clickLimit: int("click_limit"),
    dailyImpressionLimit: int("daily_impression_limit"),
    dailyImpressions: int("daily_impressions").notNull().default(0),
    dailyImpressionsDate: date("daily_impressions_date", { mode: "string" }),
    visitorDailyImpressionLimit: int("visitor_daily_impression_limit").notNull().default(3),
    visitorCampaignImpressionLimit: int("visitor_campaign_impression_limit").notNull().default(20),
    experimentKey: varchar("experiment_key", { length: 96 }),
    creativeVariant: varchar("creative_variant", { length: 32 }),
    autoOptimize: tinyint("auto_optimize").notNull().default(0),
    minimumOptimizationImpressions: int("minimum_optimization_impressions").notNull().default(1000),
    performanceStatus: mysqlEnum("performance_status", ["learning", "normal", "low", "winner"]).notNull().default("learning"),
    reportEmail: varchar("report_email", { length: 255 }),
    weeklyReportEnabled: tinyint("weekly_report_enabled").notNull().default(0),
    weeklyReportSentAt: datetime("weekly_report_sent_at", { fsp: 3 }),
    closingReportSentAt: datetime("closing_report_sent_at", { fsp: 3 }),
    createdAt:    datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt:    datetime("updated_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    index("hf_banners_pos_idx").on(t.position, t.isActive, t.displayOrder),
    index("hf_banners_active_idx").on(t.isActive),
    index("hf_banners_layout_idx").on(t.position, t.desktopRow, t.isActive, t.startAt, t.endAt),
    index("hf_banners_listing_idx").on(t.listingId),
    index("hf_banners_firm_idx").on(t.sellerId),
    index("hf_banners_deal_idx").on(t.dealId),
    index("hf_banners_lifecycle_idx").on(t.lifecycleStatus, t.startAt, t.endAt, t.reservationExpiresAt),
    index("hf_banners_payment_idx").on(t.paymentStatus, t.lifecycleStatus),
  ],
);

export const hfAdSelfServiceRequests = mysqlTable(
  "ads_self_service_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    sellerId: char("seller_id", { length: 36 }).notNull(),
    bannerId: int("banner_id", { unsigned: true }),
    requestedBy: varchar("requested_by", { length: 36 }).notNull(),
    requestType: mysqlEnum("request_type", ["creative_change", "extension", "new_slot", "support"]).notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected", "revision_requested", "cancelled"]).notNull().default("pending"),
    payload: json("payload").$type<Record<string, unknown>>().notNull(),
    requesterNote: text("requester_note"),
    reviewNote: text("review_note"),
    reviewedBy: varchar("reviewed_by", { length: 36 }),
    reviewedAt: datetime("reviewed_at", { fsp: 3 }),
    createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime("updated_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    index("ads_ssr_firm_idx").on(t.sellerId, t.status),
    index("ads_ssr_banner_idx").on(t.bannerId),
    index("ads_ssr_requester_idx").on(t.requestedBy),
  ],
);

export const hfAdAuditLogs = mysqlTable(
  "ads_audit_logs",
  {
    id: int("id", { unsigned: true }).autoincrement().primaryKey(),
    entityType: mysqlEnum("entity_type", ["banner", "slot", "package", "payment", "request", "pricing"]).notNull(),
    entityId: varchar("entity_id", { length: 64 }).notNull(),
    action: varchar("action", { length: 64 }).notNull(),
    actorUserId: varchar("actor_user_id", { length: 36 }),
    beforeData: json("before_data").$type<Record<string, unknown> | null>(),
    afterData: json("after_data").$type<Record<string, unknown> | null>(),
    reason: varchar("reason", { length: 500 }),
    isFinancial: tinyint("is_financial").notNull().default(0),
    createdAt: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    index("ads_audit_entity_idx").on(t.entityType, t.entityId, t.createdAt),
    index("ads_audit_actor_idx").on(t.actorUserId, t.createdAt),
  ],
);

export const hfBannerVisitorFrequency = mysqlTable(
  "ads_visitor_frequency",
  {
    id: int("id").autoincrement().primaryKey(),
    bannerId: int("banner_id").notNull(),
    visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
    totalImpressions: int("total_impressions").notNull().default(0),
    dailyImpressions: int("daily_impressions").notNull().default(0),
    dailyDate: date("daily_date", { mode: "string" }),
    lastPageHash: varchar("last_page_hash", { length: 64 }),
    lastImpressionAt: datetime("last_impression_at", { fsp: 3 }),
    lastClickAt: datetime("last_click_at", { fsp: 3 }),
    updatedAt: datetime("updated_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    uniqueIndex("ads_visitor_frequency_uq").on(t.bannerId, t.visitorHash),
    index("ads_visitor_frequency_updated_idx").on(t.updatedAt),
  ],
);

export const hfBannerDailyMetrics = mysqlTable(
  "ads_daily_metrics",
  {
    id: int("id").autoincrement().primaryKey(),
    bannerId: int("banner_id").notNull(),
    metricDate: date("metric_date", { mode: "string" }).notNull(),
    device: mysqlEnum("device", ["desktop", "mobile"]).notNull(),
    scopeKey: varchar("scope_key", { length: 190 }).notNull().default("global"),
    impressions: int("impressions").notNull().default(0),
    uniqueImpressions: int("unique_impressions").notNull().default(0),
    clicks: int("clicks").notNull().default(0),
    uniqueClicks: int("unique_clicks").notNull().default(0),
    updatedAt: datetime("updated_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    uniqueIndex("ads_daily_metrics_uq").on(t.bannerId, t.metricDate, t.device, t.scopeKey),
    index("ads_daily_metrics_date_idx").on(t.metricDate, t.bannerId),
  ],
);

export const hfBannerMetricUniques = mysqlTable(
  "ads_metric_uniques",
  {
    id: int("id").autoincrement().primaryKey(),
    bannerId: int("banner_id").notNull(),
    metricDate: date("metric_date", { mode: "string" }).notNull(),
    visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
    eventType: mysqlEnum("event_type", ["impression", "click"]).notNull(),
    device: mysqlEnum("device", ["desktop", "mobile"]).notNull(),
    scopeKey: varchar("scope_key", { length: 190 }).notNull().default("global"),
  },
  (t) => [
    uniqueIndex("ads_metric_uniques_uq").on(t.bannerId, t.metricDate, t.visitorHash, t.eventType, t.device, t.scopeKey),
    index("ads_metric_uniques_date_idx").on(t.metricDate),
  ],
);

export const hfBannerConversions = mysqlTable(
  "ads_conversions",
  {
    id: int("id").autoincrement().primaryKey(),
    bannerId: int("banner_id").notNull(),
    eventType: mysqlEnum("event_type", [
      "listing_view", "offer_submit", "phone_click", "whatsapp_click",
      "seller_contact", "directions_click", "favorite_add",
    ]).notNull(),
    entityType: mysqlEnum("entity_type", ["listing", "seller", "product"]).notNull(),
    entityId: varchar("entity_id", { length: 128 }).notNull(),
    visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
    sourcePosition: varchar("source_position", { length: 64 }).notNull(),
    createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    uniqueIndex("ads_conversions_unique").on(t.bannerId, t.eventType, t.entityType, t.entityId, t.visitorHash),
    index("ads_conversions_date_idx").on(t.createdAt, t.bannerId),
    index("ads_conversions_entity_idx").on(t.entityType, t.entityId),
  ],
);

export const hfAdPayments = mysqlTable(
  "ads_payments",
  {
    id: int("id").autoincrement().primaryKey(),
    bannerId: int("banner_id").notNull(),
    transactionType: mysqlEnum("transaction_type", ["payment", "refund"]).notNull().default("payment"),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("TRY"),
    paymentMethod: mysqlEnum("payment_method", ["cash", "bank_transfer", "card", "other"]).notNull(),
    paidAt: datetime("paid_at", { fsp: 3 }).notNull(),
    referenceNumber: varchar("reference_number", { length: 160 }),
    notes: varchar("notes", { length: 500 }),
    createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    index("ads_payments_banner_idx").on(t.bannerId, t.paidAt),
    index("ads_payments_reference_idx").on(t.referenceNumber),
  ],
);

export const hfAdWaitlist = mysqlTable(
  "ads_waitlist",
  {
    id: int("id").autoincrement().primaryKey(),
    position: varchar("position", { length: 64 }).notNull(),
    title: varchar("title", { length: 190 }).notNull(),
    advertiser: varchar("advertiser", { length: 160 }),
    sourceType: mysqlEnum("source_type", ["custom", "listing", "seller", "code"]).notNull().default("custom"),
    listingId: char("listing_id", { length: 36 }),
    sellerId: char("seller_id", { length: 36 }),
    device: mysqlEnum("device", ["all", "desktop", "mobile"]).notNull().default("all"),
    preferredStartAt: datetime("preferred_start_at", { fsp: 3 }),
    preferredEndAt: datetime("preferred_end_at", { fsp: 3 }),
    priority: int("priority").notNull().default(0),
    status: mysqlEnum("status", ["waiting", "offered", "converted", "cancelled"]).notNull().default("waiting"),
    notes: varchar("notes", { length: 500 }),
    createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime("updated_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    index("ads_waitlist_status_idx").on(t.status, t.priority, t.createdAt),
    index("ads_waitlist_position_idx").on(t.position, t.preferredStartAt, t.preferredEndAt),
  ],
);

export const hfBannerTargets = mysqlTable(
  "ads_targets",
  {
    id: int("id").autoincrement().primaryKey(),
    bannerId: int("banner_id").notNull(),
    scopeType: mysqlEnum("scope_type", [
      "global", "page_type", "city", "district", "product", "category", "seller", "listing",
    ]).notNull(),
    scopeValue: varchar("scope_value", { length: 190 }),
    createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    uniqueIndex("ads_targets_unique").on(t.bannerId, t.scopeType, t.scopeValue),
    index("ads_targets_lookup_idx").on(t.scopeType, t.scopeValue, t.bannerId),
  ],
);

export const hfAdSlots = mysqlTable(
  "ads_slots",
  {
    id: int("id").autoincrement().primaryKey(),
    slotKey: varchar("slot_key", { length: 64 }).notNull(),
    label: varchar("label", { length: 160 }).notNull(),
    pageType: varchar("page_type", { length: 64 }).notNull(),
    placementDescription: varchar("placement_description", { length: 300 }).notNull(),
    desktopCapacity: int("desktop_capacity").notNull().default(1),
    mobileCapacity: int("mobile_capacity").notNull().default(1),
    mobileBehavior: mysqlEnum("mobile_behavior", ["stack", "hide", "single", "scroll"]).notNull().default("stack"),
    recommendedSize: varchar("recommended_size", { length: 80 }),
    aspectRatio: varchar("aspect_ratio", { length: 32 }),
    sourceTypes: json("source_types").$type<Array<"custom" | "listing" | "seller" | "code">>().notNull(),
    deliveryMode: mysqlEnum("delivery_mode", ["fixed", "rotation"]).notNull().default("fixed"),
    baseDailyPrice: decimal("base_daily_price", { precision: 12, scale: 2 }).notNull().default("100"),
    trafficMultiplier: decimal("traffic_multiplier", { precision: 6, scale: 3 }).notNull().default("1"),
    visibilityMultiplier: decimal("visibility_multiplier", { precision: 6, scale: 3 }).notNull().default("1"),
    desktopMultiplier: decimal("desktop_multiplier", { precision: 6, scale: 3 }).notNull().default("1"),
    mobileMultiplier: decimal("mobile_multiplier", { precision: 6, scale: 3 }).notNull().default("1"),
    isActive: tinyint("is_active").notNull().default(1),
    displayOrder: int("display_order").notNull().default(0),
    createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime("updated_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    uniqueIndex("ads_slots_key_uq").on(t.slotKey),
    index("ads_slots_active_idx").on(t.isActive, t.displayOrder),
  ],
);

export const hfAdPackages = mysqlTable(
  "ads_packages",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 96 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    billingPeriod: mysqlEnum("billing_period", ["daily", "weekly", "monthly", "custom"]).notNull().default("monthly"),
    durationDays: int("duration_days").notNull().default(30),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("TRY"),
    devices: json("devices").$type<Array<"all" | "desktop" | "mobile">>(),
    impressionLimit: int("impression_limit"),
    clickLimit: int("click_limit"),
    includesFirmProfile: tinyint("includes_firm_profile").notNull().default(0),
    discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).notNull().default("0"),
    customPriceAllowed: tinyint("custom_price_allowed").notNull().default(0),
    isActive: tinyint("is_active").notNull().default(1),
    createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime("updated_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    uniqueIndex("ads_packages_slug_uq").on(t.slug),
    index("ads_packages_active_idx").on(t.isActive, t.billingPeriod),
  ],
);

export const hfAdPackageSlots = mysqlTable(
  "ads_package_slots",
  {
    id: int("id").autoincrement().primaryKey(),
    packageId: int("package_id").notNull(),
    slotKey: varchar("slot_key", { length: 64 }).notNull(),
  },
  (t) => [
    uniqueIndex("ads_package_slots_uq").on(t.packageId, t.slotKey),
    index("ads_package_slots_slot_idx").on(t.slotKey, t.packageId),
  ],
);

export const hfAdPriceOverrides = mysqlTable(
  "ads_price_overrides",
  {
    id: int("id").autoincrement().primaryKey(),
    bannerId: int("banner_id"),
    slotKey: varchar("slot_key", { length: 64 }).notNull(),
    suggestedPrice: decimal("suggested_price", { precision: 12, scale: 2 }).notNull(),
    appliedPrice: decimal("applied_price", { precision: 12, scale: 2 }).notNull(),
    discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).notNull().default("0"),
    reason: varchar("reason", { length: 500 }).notNull(),
    calculation: json("calculation").$type<Record<string, unknown>>().notNull(),
    createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    index("ads_price_overrides_banner_idx").on(t.bannerId, t.createdAt),
    index("ads_price_overrides_slot_idx").on(t.slotKey, t.createdAt),
  ],
);

// Kaman İlan seller/property taxonomy adapters used by the ported ad engine.
export const hfFirms = mysqlTable("seller_stores", {
  id: char("id", { length: 36 }).primaryKey(),
  ownerUserId: char("user_id", { length: 36 }).notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull(),
  description: text("description"),
  isActive: tinyint("is_active").notNull().default(1),
});

export const hfFirmMembers = mysqlTable("seller_members", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: char("seller_id", { length: 36 }).notNull(),
  userId: char("user_id", { length: 36 }).notNull(),
  role: mysqlEnum("role", ["owner", "manager", "creative", "finance", "viewer"]).notNull().default("viewer"),
  canViewFinancials: tinyint("can_view_financials").notNull().default(0),
  isActive: tinyint("is_active").notNull().default(1),
  invitedBy: char("invited_by", { length: 36 }),
  createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime("updated_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
});

export const hfFirmDeals = mysqlTable("ads_seller_deals", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: char("seller_id", { length: 36 }).notNull(),
  status: mysqlEnum("status", ["lead", "contacted", "negotiating", "won", "lost"]).notNull().default("lead"),
  dealType: mysqlEnum("deal_type", ["reklam", "sponsorluk", "premium", "diger"]).notNull().default("reklam"),
  notes: text("notes"),
  createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
});

export const hfFirmSponsorships = mysqlTable("ads_seller_sponsorships", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: char("seller_id", { length: 36 }).notNull(),
  startsAt: datetime("starts_at", { fsp: 3 }).notNull(),
  endsAt: datetime("ends_at", { fsp: 3 }).notNull(),
  isActive: tinyint("is_active").notNull().default(1),
});

export const hfProducts = mysqlTable("sub_categories", {
  id: char("id", { length: 36 }).primaryKey(),
  slug: varchar("slug", { length: 255 }),
  nameTr: varchar("name", { length: 255 }),
  categorySlug: char("category_id", { length: 36 }).notNull(),
  canonicalSlug: varchar("slug", { length: 255 }),
  searchVolume: int("display_order").notNull().default(0),
  isActive: tinyint("is_active").notNull().default(1),
});

export const hfMarkets = mysqlTable("categories", {
  id: char("id", { length: 36 }).primaryKey(),
  slug: varchar("slug", { length: 255 }),
  name: varchar("name", { length: 255 }),
  isActive: tinyint("is_active").notNull().default(1),
});

/**
 * CTA huni olaylari — bulten formlarinin gosterim/etkilesim/donusum olcumu.
 * Detay ve gerekce: db/seed/sql/052_cta_events_schema.sql
 */
