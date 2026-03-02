// src/modules/faqs/schema.ts
import {
  mysqlTable,
  char,
  varchar,
  boolean,      // 👈 ekle
  datetime,
  index,
  uniqueIndex,
  customType,
  int,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/** LONGTEXT */
const longtext = customType<{ data: string; driverData: string }>({
  dataType() {
    return "longtext";
  },
});

export const faqs = mysqlTable(
  "faqs",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    question: varchar("question", { length: 500 }).notNull(),
    /** düz HTML veya düz metin */
    answer: longtext("answer").notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    locale: varchar("locale", { length: 10 }).notNull().default("tr"),
    // NULL olabilir (SQL'de DEFAULT NULL)
    category: varchar("category", { length: 255 }),

    // 👇 boolean kullan; MySQL'de TINYINT(1) olarak oluşturulur
    is_active: boolean("is_active").notNull().default(true),

    display_order: int("display_order").notNull().default(0),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_faqs_slug_locale").on(t.slug, t.locale),
    index("faqs_locale_idx").on(t.locale),
    index("faqs_active_idx").on(t.is_active),
    index("faqs_order_idx").on(t.display_order),
    index("faqs_created_idx").on(t.created_at),
    index("faqs_updated_idx").on(t.updated_at),
    index("faqs_category_idx").on(t.category),
  ],
);

export type FaqRow = typeof faqs.$inferSelect;
export type NewFaqRow = typeof faqs.$inferInsert;
