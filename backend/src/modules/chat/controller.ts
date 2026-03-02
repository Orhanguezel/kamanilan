// =============================================================
// FILE: src/modules/chat/controller.ts
// =============================================================
import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { db } from "@/db/client";
import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { conversations, chat_messages } from "./schema";
import { z } from "zod";

function getAuthUserId(req: any): string {
  const sub = req.user?.sub ?? req.user?.id ?? null;
  if (!sub) throw new Error("unauthorized");
  return String(sub);
}

// İkili tuple'ı sıralı şekilde döndür (user_a < user_b)
function sortedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

// ─── GET /conversations ────────────────────────────────────────
export const listConversations: RouteHandler = async (req, reply) => {
  try {
    const userId = getAuthUserId(req);
    const { limit = 30, offset = 0 } = (req.query ?? {}) as {
      limit?: number;
      offset?: number;
    };

    const rows = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.user_a, userId),
          eq(conversations.user_b, userId),
        ),
      )
      .orderBy(desc(conversations.last_message_at))
      .limit(Number(limit))
      .offset(Number(offset));

    // Son mesajı ve okunmamış sayısını ekle
    const enriched = await Promise.all(
      rows.map(async (conv) => {
        const [lastMsg] = await db
          .select()
          .from(chat_messages)
          .where(eq(chat_messages.conversation_id, conv.id))
          .orderBy(desc(chat_messages.created_at))
          .limit(1);

        const [unreadRow] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(chat_messages)
          .where(
            and(
              eq(chat_messages.conversation_id, conv.id),
              eq(chat_messages.is_read, 0),
              // Karşı tarafın mesajları (bana gönderilen)
              eq(chat_messages.sender_id, conv.user_a === userId ? conv.user_b : conv.user_a),
            ),
          );

        return {
          ...conv,
          last_message: lastMsg ?? null,
          unread_count: Number(unreadRow?.count ?? 0),
          other_user_id: conv.user_a === userId ? conv.user_b : conv.user_a,
        };
      }),
    );

    return reply.send(enriched);
  } catch (e: any) {
    if (e?.message === "unauthorized")
      return reply.code(401).send({ error: { message: "unauthorized" } });
    req.log.error(e);
    return reply.code(500).send({ error: { message: "conversations_list_failed" } });
  }
};

// ─── POST /conversations ──────────────────────────────────────
// Yeni konuşma başlat (yoksa getir)
export const createOrGetConversation: RouteHandler = async (req, reply) => {
  try {
    const userId = getAuthUserId(req);
    const body = z
      .object({
        other_user_id: z.string().uuid(),
        property_id: z.string().uuid().optional().nullable(),
      })
      .parse(req.body ?? {});

    if (body.other_user_id === userId)
      return reply.code(400).send({ error: { message: "cannot_chat_with_self" } });

    const [ua, ub] = sortedPair(userId, body.other_user_id);
    const propId = body.property_id ?? null;

    // Mevcut konuşmayı ara
    const existing = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.user_a, ua),
          eq(conversations.user_b, ub),
          propId
            ? eq(conversations.property_id, propId)
            : sql`property_id IS NULL`,
        ),
      )
      .limit(1);

    if (existing[0]) return reply.send(existing[0]);

    // Yeni konuşma oluştur
    const id = randomUUID();
    await db.insert(conversations).values({
      id,
      user_a: ua,
      user_b: ub,
      property_id: propId ?? undefined,
      last_message_at: new Date(),
    });

    const [row] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    return reply.code(201).send(row);
  } catch (e: any) {
    if (e?.name === "ZodError")
      return reply.code(400).send({ error: { message: "validation_error", details: e.issues } });
    if (e?.message === "unauthorized")
      return reply.code(401).send({ error: { message: "unauthorized" } });
    req.log.error(e);
    return reply.code(500).send({ error: { message: "conversation_create_failed" } });
  }
};

// ─── GET /conversations/:id/messages ──────────────────────────
export const listMessages: RouteHandler = async (req, reply) => {
  const { id } = req.params as { id: string };
  try {
    const userId = getAuthUserId(req);
    const { limit = 50, before } = (req.query ?? {}) as {
      limit?: number;
      before?: string; // ISO date for cursor pagination
    };

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (!conv || (conv.user_a !== userId && conv.user_b !== userId))
      return reply.code(404).send({ error: { message: "not_found" } });

    const msgs = await db
      .select()
      .from(chat_messages)
      .where(eq(chat_messages.conversation_id, id))
      .orderBy(asc(chat_messages.created_at))
      .limit(Number(limit));

    return reply.send(msgs);
  } catch (e: any) {
    if (e?.message === "unauthorized")
      return reply.code(401).send({ error: { message: "unauthorized" } });
    req.log.error(e);
    return reply.code(500).send({ error: { message: "messages_list_failed" } });
  }
};

// ─── POST /conversations/:id/messages ─────────────────────────
export const sendMessage: RouteHandler = async (req, reply) => {
  const { id } = req.params as { id: string };
  try {
    const userId = getAuthUserId(req);
    const { body: msgBody } = z
      .object({ body: z.string().min(1).max(4000) })
      .parse(req.body ?? {});

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (!conv || (conv.user_a !== userId && conv.user_b !== userId))
      return reply.code(404).send({ error: { message: "not_found" } });

    const msgId = randomUUID();
    await db.insert(chat_messages).values({
      id: msgId,
      conversation_id: id,
      sender_id: userId,
      body: msgBody,
      is_read: 0,
    });

    // Konuşmanın son mesaj zamanını güncelle
    await db
      .update(conversations)
      .set({ last_message_at: new Date() })
      .where(eq(conversations.id, id));

    const [msg] = await db
      .select()
      .from(chat_messages)
      .where(eq(chat_messages.id, msgId))
      .limit(1);

    return reply.code(201).send(msg);
  } catch (e: any) {
    if (e?.name === "ZodError")
      return reply.code(400).send({ error: { message: "validation_error", details: e.issues } });
    if (e?.message === "unauthorized")
      return reply.code(401).send({ error: { message: "unauthorized" } });
    req.log.error(e);
    return reply.code(500).send({ error: { message: "message_send_failed" } });
  }
};

// ─── POST /conversations/:id/seen ─────────────────────────────
export const markSeen: RouteHandler = async (req, reply) => {
  const { id } = req.params as { id: string };
  try {
    const userId = getAuthUserId(req);

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (!conv || (conv.user_a !== userId && conv.user_b !== userId))
      return reply.code(404).send({ error: { message: "not_found" } });

    const otherId = conv.user_a === userId ? conv.user_b : conv.user_a;

    await db
      .update(chat_messages)
      .set({ is_read: 1 })
      .where(
        and(
          eq(chat_messages.conversation_id, id),
          eq(chat_messages.sender_id, otherId),
          eq(chat_messages.is_read, 0),
        ),
      );

    return reply.send({ ok: true });
  } catch (e: any) {
    if (e?.message === "unauthorized")
      return reply.code(401).send({ error: { message: "unauthorized" } });
    req.log.error(e);
    return reply.code(500).send({ error: { message: "seen_failed" } });
  }
};
