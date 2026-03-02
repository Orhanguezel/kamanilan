// =============================================================
// FILE: src/modules/ai_chat/schema.ts
// AI chat oturumları ve mesaj geçmişi
// =============================================================
import {
  mysqlTable,
  char,
  varchar,
  text,
  tinyint,
  datetime,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const ai_sessions = mysqlTable(
  "ai_sessions",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    // Kayıtlı kullanıcı veya anonim için null
    user_id: char("user_id", { length: 36 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    last_active_at: datetime("last_active_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    index("ai_sess_user_idx").on(t.user_id),
    index("ai_sess_active_idx").on(t.last_active_at),
  ],
);

export const ai_messages = mysqlTable(
  "ai_messages",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    session_id: char("session_id", { length: 36 }).notNull(),

    role: varchar("role", { length: 16 }).notNull().default("user"), // user | assistant
    content: text("content").notNull(),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    index("ai_msg_session_idx").on(t.session_id),
    index("ai_msg_created_idx").on(t.session_id, t.created_at),
  ],
);

export type AiSessionRow = typeof ai_sessions.$inferSelect;
export type AiSessionInsert = typeof ai_sessions.$inferInsert;
export type AiMessageRow = typeof ai_messages.$inferSelect;
export type AiMessageInsert = typeof ai_messages.$inferInsert;
