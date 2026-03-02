import {
  mysqlTable,
  char,
  varchar,
  tinyint,
  int,
  datetime,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const units = mysqlTable(
  'units',
  {
    id: char('id', { length: 36 }).primaryKey().notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    symbol: varchar('symbol', { length: 20 }).notNull(),
    type: varchar('type', { length: 24 }).notNull().default('custom'),
    precision: tinyint('precision', { unsigned: true }).notNull().default(0),
    is_active: tinyint('is_active').notNull().default(1),
    display_order: int('display_order').notNull().default(0),
    created_at: datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime('updated_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex('ux_units_slug').on(t.slug),
    index('idx_units_active').on(t.is_active),
    index('idx_units_type').on(t.type),
    index('idx_units_order').on(t.display_order),
  ],
);

export type UnitRow = typeof units.$inferSelect;
export type NewUnitRow = typeof units.$inferInsert;

