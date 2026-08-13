import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import type { RouteHandler } from "fastify";

import { db } from "@/db/client";
import { userRoles } from "@vps/shared-backend/modules/userRoles/schema";
import { sellerApplications } from "./schema";
import {
  createSellerApplicationBody,
  reviewSellerApplicationBody,
} from "./validation";

function userIdOf(req: Parameters<RouteHandler>[0]): string | null {
  const user = (req as typeof req & { user?: { sub?: unknown } }).user;
  return typeof user?.sub === "string" ? user.sub : null;
}

export const getMySellerApplication: RouteHandler = async (req, reply) => {
  const userId = userIdOf(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });
  const [application] = await db
    .select()
    .from(sellerApplications)
    .where(eq(sellerApplications.user_id, userId))
    .orderBy(desc(sellerApplications.created_at))
    .limit(1);
  return reply.send(application ?? null);
};

export const createSellerApplication: RouteHandler = async (req, reply) => {
  const userId = userIdOf(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });
  const parsed = createSellerApplicationBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });
  }
  const [pending] = await db
    .select({ id: sellerApplications.id })
    .from(sellerApplications)
    .where(and(eq(sellerApplications.user_id, userId), eq(sellerApplications.status, "pending")))
    .limit(1);
  if (pending) return reply.code(409).send({ error: { message: "seller_application_pending" } });

  const id = randomUUID();
  await db.insert(sellerApplications).values({ id, user_id: userId, ...parsed.data });
  const [created] = await db.select().from(sellerApplications).where(eq(sellerApplications.id, id)).limit(1);
  return reply.code(201).send(created);
};

export const listSellerApplicationsAdmin: RouteHandler = async (req, reply) => {
  const status = (req.query as { status?: string }).status;
  const query = db.select().from(sellerApplications).$dynamic();
  const rows = await (status === "pending" || status === "approved" || status === "rejected"
    ? query.where(eq(sellerApplications.status, status))
    : query
  ).orderBy(desc(sellerApplications.created_at));
  return reply.send(rows);
};

export const reviewSellerApplicationAdmin: RouteHandler = async (req, reply) => {
  const reviewerId = userIdOf(req);
  if (!reviewerId) return reply.code(401).send({ error: { message: "unauthorized" } });
  const id = String((req.params as { id?: string }).id ?? "");
  const parsed = reviewSellerApplicationBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });
  }
  const [application] = await db.select().from(sellerApplications).where(eq(sellerApplications.id, id)).limit(1);
  if (!application) return reply.code(404).send({ error: { message: "not_found" } });
  if (application.status !== "pending") {
    return reply.code(409).send({ error: { message: "seller_application_already_reviewed" } });
  }

  await db.transaction(async (tx) => {
    await tx.update(sellerApplications).set({
      status: parsed.data.status,
      review_note: parsed.data.review_note ?? null,
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
      updated_at: new Date(),
    }).where(eq(sellerApplications.id, id));
    if (parsed.data.status === "approved") {
      await tx.delete(userRoles).where(eq(userRoles.user_id, application.user_id));
      await tx.insert(userRoles).values({
        id: randomUUID(),
        user_id: application.user_id,
        role: "seller",
      });
    }
  });
  const [updated] = await db.select().from(sellerApplications).where(eq(sellerApplications.id, id)).limit(1);
  return reply.send(updated);
};
