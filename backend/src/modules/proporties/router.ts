// =============================================================
// FILE: src/modules/properties/router.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import {
  listPropertiesPublic,
  getPropertyPublic,
  getPropertyBySlugPublic,
  listDistrictsPublic,
  listCitiesPublic,
  listNeighborhoodsPublic,
  listStatusesPublic,
  listPropertiesRss,
} from "./controller";

const BASE = "/properties";

export async function registerProperties(app: FastifyInstance) {
  app.get(`${BASE}`,               { config: { public: true } }, listPropertiesPublic);
  app.get(`${BASE}/rss`,           { config: { public: true } }, listPropertiesRss);
  app.get(`${BASE}/:id`,           { config: { public: true } }, getPropertyPublic);
  app.get(`${BASE}/by-slug/:slug`, { config: { public: true } }, getPropertyBySlugPublic);

  app.get(`${BASE}/_meta/districts`,     { config: { public: true } }, listDistrictsPublic);
  app.get(`${BASE}/_meta/cities`,        { config: { public: true } }, listCitiesPublic);
  app.get(`${BASE}/_meta/neighborhoods`, { config: { public: true } }, listNeighborhoodsPublic);
  app.get(`${BASE}/_meta/statuses`,      { config: { public: true } }, listStatusesPublic);
}
