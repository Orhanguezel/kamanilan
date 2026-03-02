import { mysqlTable, char, varchar, text, decimal, int, tinyint, datetime } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const coupons = mysqlTable("coupons", {
  id:               char("id", { length: 36 }).primaryKey(),
  code:             varchar("code", { length: 50 }).notNull(),
  title:            varchar("title", { length: 255 }).notNull(),
  description:      text("description"),
  discount_type:    varchar("discount_type", { length: 16 }).notNull().default("percent"), // 'percent' | 'amount'
  discount_value:   decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  min_order_amount: decimal("min_order_amount", { precision: 10, scale: 2 }),
  max_discount:     decimal("max_discount", { precision: 10, scale: 2 }),
  max_uses:         int("max_uses"),
  uses_count:       int("uses_count").notNull().default(0),
  start_at:         datetime("start_at", { fsp: 3 }),
  end_at:           datetime("end_at", { fsp: 3 }),
  is_active:        tinyint("is_active").notNull().default(1),
  image_url:        varchar("image_url", { length: 500 }),
  created_at:       datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  updated_at:       datetime("updated_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
});

export type CouponRow    = typeof coupons.$inferSelect;
export type NewCouponRow = typeof coupons.$inferInsert;
