// =============================================================
// FILE: src/modules/articles/admin.routes.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import { requireAdmin } from "@/common/middleware/roles";
import {
  adminListArticles,
  adminGetArticle,
  adminCreateArticle,
  adminUpdateArticle,
  adminDeleteArticle,
  adminSetArticlePublished,
  adminAiEnhanceArticle,
  adminListArticleComments,
  adminApproveComment,
  adminDeleteComment,
} from "./admin.controller";

export async function registerArticlesAdmin(app: FastifyInstance) {
  const BASE = "/articles";

  app.get<{ Querystring: unknown }>(
    `${BASE}`,
    { preHandler: [requireAuth, requireAdmin] },
    adminListArticles
  );

  app.get<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminGetArticle
  );

  app.post<{ Body: unknown }>(
    `${BASE}`,
    { preHandler: [requireAuth, requireAdmin] },
    adminCreateArticle
  );

  app.patch<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminUpdateArticle
  );

  app.delete<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminDeleteArticle
  );

  app.patch<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/:id/publish`,
    { preHandler: [requireAuth, requireAdmin] },
    adminSetArticlePublished
  );

  app.post<{ Params: { id: string } }>(
    `${BASE}/:id/ai-enhance`,
    { preHandler: [requireAuth, requireAdmin] },
    adminAiEnhanceArticle
  );

  // Comments
  app.get<{ Params: { id: string } }>(
    `${BASE}/:id/comments`,
    { preHandler: [requireAuth, requireAdmin] },
    adminListArticleComments
  );

  app.patch<{ Params: { cid: string }; Body: unknown }>(
    `${BASE}/comments/:cid/approve`,
    { preHandler: [requireAuth, requireAdmin] },
    adminApproveComment
  );

  app.delete<{ Params: { cid: string } }>(
    `${BASE}/comments/:cid`,
    { preHandler: [requireAuth, requireAdmin] },
    adminDeleteComment
  );
}
