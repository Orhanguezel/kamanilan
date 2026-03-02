import {
  mysqlTable, char, mediumtext, datetime, tinyint,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

/**
 * theme_config — tek satır (ID = sabit UUID), tüm tema konfigürasyonunu JSON olarak saklar.
 * is_active: ilerde çoklu tema desteği için. Şu an her zaman 1.
 */
export const themeConfig = mysqlTable('theme_config', {
  id:         char('id',  { length: 36 }).primaryKey().notNull(),
  is_active:  tinyint('is_active').notNull().default(1),
  config:     mediumtext('config').notNull(),
  created_at: datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  updated_at: datetime('updated_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`).$onUpdateFn(() => new Date()),
});
