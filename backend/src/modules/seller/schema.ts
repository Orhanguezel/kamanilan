import {
  mysqlTable,
  char,
  varchar,
  text,
  tinyint,
  datetime,
  decimal,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const sellerStores = mysqlTable(
  "seller_stores",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    user_id: char("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    description: text("description"),
    logo_url: varchar("logo_url", { length: 500 }),
    banner_url: varchar("banner_url", { length: 500 }),
    is_active: tinyint("is_active").notNull().default(1),
    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_seller_stores_slug").on(t.slug),
    index("idx_seller_stores_user").on(t.user_id),
    index("idx_seller_stores_active").on(t.is_active),
  ],
);

export const sellerCampaigns = mysqlTable(
  "seller_campaigns",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    seller_id: char("seller_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    description: text("description"),
    discount_type: varchar("discount_type", { length: 16 }).notNull().default("percent"),
    discount_value: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
    start_at: datetime("start_at", { fsp: 3 }).notNull(),
    end_at: datetime("end_at", { fsp: 3 }).notNull(),
    is_active: tinyint("is_active").notNull().default(1),
    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_seller_campaigns_seller_slug").on(t.seller_id, t.slug),
    index("idx_seller_campaigns_seller").on(t.seller_id),
    index("idx_seller_campaigns_active").on(t.is_active),
    index("idx_seller_campaigns_window").on(t.start_at, t.end_at),
  ],
);

export const sellerCampaignScopes = mysqlTable(
  "seller_campaign_scopes",
  {
    campaign_id: char("campaign_id", { length: 36 }).notNull(),
    scope_type: varchar("scope_type", { length: 24 }).notNull(),
    target_id: char("target_id", { length: 36 }).notNull(),
    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    primaryKey({ columns: [t.campaign_id, t.scope_type, t.target_id] }),
    index("idx_seller_campaign_scopes_campaign").on(t.campaign_id),
    index("idx_seller_campaign_scopes_type_target").on(t.scope_type, t.target_id),
  ],
);

export type SellerCampaignScopeType =
  | "listing"
  | "store"
  | "category"
  | "subcategory"
  | "seller";
