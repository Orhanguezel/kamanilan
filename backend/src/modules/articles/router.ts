// =============================================================
// FILE: src/modules/articles/router.ts – Public
// =============================================================
import type { FastifyInstance } from "fastify";
import {
  listArticles, getArticle, articlesRss,
  listArticleComments, createArticleComment,
  getArticleLikes, toggleArticleLike,
} from "./controller";
import { requireAuth } from "@/common/middleware/auth";

export async function registerArticles(app: FastifyInstance) {
  const pub  = { config: { public: true } };
  const auth = { preHandler: [requireAuth] };

  app.get("/articles",       pub, listArticles);
  app.get("/articles/rss",   pub, articlesRss);
  app.get("/articles/:slug", pub, getArticle);

  // Comments
  app.get("/articles/:slug/comments",  pub,  listArticleComments);
  app.post("/articles/:slug/comments", auth, createArticleComment);

  // Likes (GET is public so anyone can see the count)
  app.get("/articles/:slug/likes",  pub,  getArticleLikes);
  app.post("/articles/:slug/like",  auth, toggleArticleLike);
}
