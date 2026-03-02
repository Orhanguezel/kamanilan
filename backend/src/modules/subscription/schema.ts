// =============================================================
// FILE: src/modules/subscription/schema.ts
// Abonelik planları, özellikler, kullanıcı abonelikleri
// =============================================================
import {
  mysqlTable,
  int,
  varchar,
  text,
  tinyint,
  datetime,
  char,
  decimal,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ------------------------------------------------------------------
// subscription_plans — mevcut paketler (Ücretsiz, Temel, Pro, ...)
// ------------------------------------------------------------------
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id:            int("id").autoincrement().primaryKey(),
  slug:          varchar("slug",  { length: 100 }).notNull(),
  name:          varchar("name",  { length: 100 }).notNull(),
  description:   text("description"),
  price_monthly: decimal("price_monthly", { precision: 10, scale: 2 }).notNull().default("0.00"),
  price_yearly:  decimal("price_yearly",  { precision: 10, scale: 2 }),
  is_active:     tinyint("is_active").notNull().default(1).$type<boolean>(),
  is_default:    tinyint("is_default").notNull().default(0).$type<boolean>(),
  display_order: int("display_order").notNull().default(0),
  created_at:    datetime("created_at", { mode: "string", fsp: 3 })
                   .notNull()
                   .default(sql`CURRENT_TIMESTAMP(3)`),
  updated_at:    datetime("updated_at", { mode: "string", fsp: 3 })
                   .notNull()
                   .default(sql`CURRENT_TIMESTAMP(3)`)
                   .$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
}, (t) => ({
  slugUniq: uniqueIndex("subscription_plans_slug_unique").on(t.slug),
}));

// ------------------------------------------------------------------
// subscription_plan_features — plan başına özellik değerleri
// feature_value: "-1" = sınırsız, "30" = 30 gün, "true"/"false"
// ------------------------------------------------------------------
export const subscriptionPlanFeatures = mysqlTable("subscription_plan_features", {
  id:            int("id").autoincrement().primaryKey(),
  plan_id:       int("plan_id").notNull(),
  feature_key:   varchar("feature_key",   { length: 100 }).notNull(),
  feature_value: varchar("feature_value", { length: 255 }).notNull(),
  is_enabled:    tinyint("is_enabled").notNull().default(1).$type<boolean>(),
}, (t) => ({
  planFeatureUniq: uniqueIndex("spf_plan_key_unique").on(t.plan_id, t.feature_key),
  planIdx:         index("spf_plan_idx").on(t.plan_id),
}));

// ------------------------------------------------------------------
// user_subscriptions — kullanıcının aktif planı (user_id UNIQUE)
// expires_at = null → sonsuz (ücretsiz / ömür boyu)
// ------------------------------------------------------------------
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id:         int("id").autoincrement().primaryKey(),
  user_id:    char("user_id",  { length: 36 }).notNull(),
  plan_id:    int("plan_id").notNull(),
  starts_at:  datetime("starts_at",  { mode: "string", fsp: 3 })
                .notNull()
                .default(sql`CURRENT_TIMESTAMP(3)`),
  expires_at: datetime("expires_at", { mode: "string", fsp: 3 }),
  is_active:  tinyint("is_active").notNull().default(1).$type<boolean>(),
  created_at: datetime("created_at", { mode: "string", fsp: 3 })
                .notNull()
                .default(sql`CURRENT_TIMESTAMP(3)`),
  updated_at: datetime("updated_at", { mode: "string", fsp: 3 })
                .notNull()
                .default(sql`CURRENT_TIMESTAMP(3)`)
                .$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
}, (t) => ({
  userUniq: uniqueIndex("user_subscriptions_user_unique").on(t.user_id),
  planIdx:  index("us_plan_idx").on(t.plan_id),
}));

export type SubscriptionPlanRow    = typeof subscriptionPlans.$inferSelect;
export type SubscriptionPlanInsert = typeof subscriptionPlans.$inferInsert;
export type PlanFeatureRow         = typeof subscriptionPlanFeatures.$inferSelect;
export type UserSubscriptionRow    = typeof userSubscriptions.$inferSelect;
