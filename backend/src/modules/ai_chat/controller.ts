// =============================================================
// FILE: src/modules/ai_chat/controller.ts
// AI chat - OpenAI / uyumlu endpoint üzerinden çalışır
// AI_API_KEY ve AI_API_BASE env'den okunur
// =============================================================
import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { db } from "@/db/client";
import { asc, eq } from "drizzle-orm";
import { ai_sessions, ai_messages } from "./schema";
import { z } from "zod";

const AI_API_BASE = process.env.AI_API_BASE || "https://api.openai.com/v1";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "gpt-3.5-turbo";
const AI_SYSTEM_PROMPT =
  process.env.AI_SYSTEM_PROMPT ||
  "Sen Kaman (Kırşehir) ilan sitesinin AI asistanısın. Kullanıcılara ilan verme, arama ve site kullanımı konularında Türkçe yardım et. Kısa ve net yanıtlar ver.";

function getOptionalUserId(req: any): string | null {
  try {
    const sub = req.user?.sub ?? req.user?.id ?? null;
    return sub ? String(sub) : null;
  } catch {
    return null;
  }
}

async function ensureSession(sessionId: string, userId: string | null) {
  const [existing] = await db
    .select()
    .from(ai_sessions)
    .where(eq(ai_sessions.id, sessionId))
    .limit(1);

  if (existing) {
    await db
      .update(ai_sessions)
      .set({ last_active_at: new Date() })
      .where(eq(ai_sessions.id, sessionId));
    return existing;
  }

  const id = sessionId || randomUUID();
  await db.insert(ai_sessions).values({
    id,
    user_id: userId ?? undefined,
    last_active_at: new Date(),
  });
  const [row] = await db
    .select()
    .from(ai_sessions)
    .where(eq(ai_sessions.id, id))
    .limit(1);
  return row;
}

async function callAI(
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  if (!AI_API_KEY) {
    return "AI hizmeti şu an yapılandırılmamış. Lütfen daha sonra tekrar deneyin.";
  }

  const res = await fetch(`${AI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: "system", content: AI_SYSTEM_PROMPT }, ...messages],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`AI API error: ${res.status}`);
  }

  const data = (await res.json()) as any;
  return data?.choices?.[0]?.message?.content?.trim() ?? "Yanıt alınamadı.";
}

// ─── GET /ai-chat/status ──────────────────────────────────────
export const getStatus: RouteHandler = async (_req, reply) => {
  return reply.send({
    enabled: Boolean(AI_API_KEY),
    model: AI_API_KEY ? AI_MODEL : null,
  });
};

// ─── POST /ai-chat/send (public + authenticated) ──────────────
export const sendAiMessage: RouteHandler = async (req, reply) => {
  try {
    const userId = getOptionalUserId(req);

    const { message, session_id } = z
      .object({
        message: z.string().min(1).max(2000),
        session_id: z.string().min(8).max(36).optional(),
      })
      .parse(req.body ?? {});

    const resolvedSessionId = session_id || randomUUID();
    await ensureSession(resolvedSessionId, userId);

    // Oturum geçmişini yükle (son 10 mesaj)
    const history = await db
      .select()
      .from(ai_messages)
      .where(eq(ai_messages.session_id, resolvedSessionId))
      .orderBy(asc(ai_messages.created_at))
      .limit(20);

    // Kullanıcı mesajını kaydet
    const userMsgId = randomUUID();
    await db.insert(ai_messages).values({
      id: userMsgId,
      session_id: resolvedSessionId,
      role: "user",
      content: message,
    });

    // AI'ya gönder
    const aiMessages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const aiResponse = await callAI(aiMessages);

    // AI yanıtını kaydet
    const aiMsgId = randomUUID();
    await db.insert(ai_messages).values({
      id: aiMsgId,
      session_id: resolvedSessionId,
      role: "assistant",
      content: aiResponse,
    });

    return reply.send({
      session_id: resolvedSessionId,
      data: {
        message: aiResponse,
      },
    });
  } catch (e: any) {
    if (e?.name === "ZodError")
      return reply.code(400).send({ error: { message: "validation_error", details: e.issues } });
    req.log.error(e);
    return reply.code(500).send({ error: { message: "ai_chat_failed" } });
  }
};
