// =============================================================
// FILE: src/modules/chat/schema.ts
// İki kullanıcı arasında direkt mesajlaşma
// conversations: bire-bir konuşma oturumları
// chat_messages:  mesajlar
// =============================================================
import {
  mysqlTable,
  char,
  text,
  tinyint,
  datetime,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const conversations = mysqlTable(
  "conversations",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),

    // Katılımcılar (user_a < user_b sıralı tutulur → unique pair)
    user_a: char("user_a", { length: 36 }).notNull(),
    user_b: char("user_b", { length: 36 }).notNull(),

    // İlanla ilgili mi? (opsiyonel)
    property_id: char("property_id", { length: 36 }),

    last_message_at: datetime("last_message_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    // Aynı ikili arasında tek konuşma (property başına)
    uniqueIndex("conv_pair_property_uq").on(t.user_a, t.user_b, t.property_id),
    index("conv_user_a_idx").on(t.user_a),
    index("conv_user_b_idx").on(t.user_b),
    index("conv_last_msg_idx").on(t.last_message_at),
  ],
);

export const chat_messages = mysqlTable(
  "chat_messages",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),

    conversation_id: char("conversation_id", { length: 36 }).notNull(),
    sender_id: char("sender_id", { length: 36 }).notNull(),

    body: text("body").notNull(),
    is_read: tinyint("is_read", { unsigned: true }).notNull().default(0),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    index("chat_msg_conv_idx").on(t.conversation_id),
    index("chat_msg_sender_idx").on(t.sender_id),
    index("chat_msg_created_idx").on(t.conversation_id, t.created_at),
  ],
);

export type ConversationRow = typeof conversations.$inferSelect;
export type ConversationInsert = typeof conversations.$inferInsert;
export type ChatMessageRow = typeof chat_messages.$inferSelect;
export type ChatMessageInsert = typeof chat_messages.$inferInsert;
