import type { FastifyInstance, FastifyRequest } from "fastify";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";
import { pool } from "@/db/client";
import { isValidContentApiKey } from "./auth";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(24),
  offset: z.coerce.number().int().min(0).default(0),
  q: z.string().trim().max(160).optional(),
  updated_since: z.string().datetime().optional(),
  sort: z.enum(["newest", "popular"]).default("newest"),
  locale: z.string().trim().max(10).default("tr"),
});

interface ContentRow extends RowDataPacket {
  id: string;
  content_type: "news" | "announcement" | "page";
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  tags: string | null;
  published_at: string | Date | null;
  updated_at: string | Date | null;
  popularity: number | string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface InventoryRow extends CountRow {
  lastUpdated: string | null;
}

interface ListingRow extends RowDataPacket {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  image_url: string | null;
  price: string | number | null;
  currency: string;
  view_count: number;
  status: string;
  is_negotiable: number | boolean;
  city: string;
  district: string;
  created_at: string | Date | null;
  updated_at: string | Date | null;
  category: string | null;
  subcategory: string | null;
}

interface CategoryRow extends RowDataPacket {
  name: string;
}

function authorized(req: FastifyRequest): boolean {
  return isValidContentApiKey(
    process.env.TANITIO_CONTENT_API_KEY,
    req.headers.authorization,
    req.headers["x-api-key"],
  );
}

function dateOrNull(value: string | Date | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function tagsOf(value: string | null): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))];
}

export async function registerWebConnection(app: FastifyInstance) {
  app.addHook("onRequest", async (req, reply) => {
    if (!authorized(req)) return reply.status(401).send({ error: "invalid_api_key" });
  });

  app.get("/contract", async () => ({
    contract: "kamanilan-tanitio-web-connection",
    version: "1.0",
    tenant: "kamanilan",
    locale: "tr-TR",
    timezone: "Europe/Istanbul",
    capabilities: {
      read: ["articles", "products", "context"],
      write: [],
      publish: false,
    },
    endpoints: {
      articles: "/articles",
      products: "/products",
      context: "/context",
    },
    auth: { type: "bearer", header: "Authorization" },
  }));

  app.get("/articles", async (req) => {
    const q = querySchema.parse(req.query);
    const search = q.q ? `%${q.q}%` : null;
    const updatedSince = q.updated_since ? new Date(q.updated_since) : null;
    const filters: string[] = [];
    const args: unknown[] = [];
    if (search) {
      filters.push("(content.title LIKE ? OR content.excerpt LIKE ?)");
      args.push(search, search);
    }
    if (updatedSince) {
      filters.push("content.updated_at >= ?");
      args.push(updatedSince);
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const contentSql = `
      SELECT CONCAT('article:', a.id) id, 'news' content_type, a.slug, a.title,
             a.excerpt, COALESCE(sa.url, a.cover_image_url) image_url,
             a.category, a.tags, COALESCE(a.published_at, a.created_at) published_at,
             a.updated_at, (a.is_featured * 100000 + a.display_order) popularity
      FROM articles a
      LEFT JOIN storage_assets sa ON sa.id = a.cover_asset_id
      WHERE a.is_published = 1 AND a.locale = ?
      UNION ALL
      SELECT CONCAT('announcement:', n.id), 'announcement', n.slug, n.title,
             n.excerpt, COALESCE(sa.url, n.cover_image_url), n.category, NULL,
             COALESCE(n.published_at, n.created_at), n.updated_at,
             (n.is_featured * 100000 + n.display_order)
      FROM announcements n
      LEFT JOIN storage_assets sa ON sa.id = n.cover_asset_id
      WHERE n.is_published = 1 AND n.locale = ?
      UNION ALL
      SELECT CONCAT('page:', p.id), 'page', pi.slug, pi.title,
             pi.summary, p.featured_image, p.module_key, NULL,
             p.created_at, GREATEST(p.updated_at, pi.updated_at), p.display_order
      FROM custom_pages p
      JOIN custom_pages_i18n pi ON pi.page_id = p.id
      WHERE p.is_published = 1 AND p.module_key IN ('about', 'quality') AND pi.locale = ?`;
    const baseArgs = [q.locale, q.locale, q.locale];
    const order = q.sort === "popular" ? "content.popularity DESC, content.updated_at DESC" : "content.published_at DESC";
    const [countResult, rowsResult] = await Promise.all([
      pool.query<CountRow[]>(`SELECT COUNT(*) total FROM (${contentSql}) content ${where}`, [...baseArgs, ...args]),
      pool.query<ContentRow[]>(`SELECT * FROM (${contentSql}) content ${where} ORDER BY ${order} LIMIT ? OFFSET ?`, [...baseArgs, ...args, q.limit, q.offset]),
    ]);
    const total = Number(countResult[0][0]?.total ?? 0);
    const items = rowsResult[0].map((row) => ({
      id: row.id,
      kind: "article",
      contentType: row.content_type,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      url: row.content_type === "announcement"
        ? `https://kamanilan.com/duyurular/${row.slug}`
        : row.content_type === "page"
          ? `https://kamanilan.com/${row.slug}`
          : `https://kamanilan.com/haberler/${row.slug}`,
      image_url: row.image_url,
      category: row.category,
      tags: tagsOf(row.tags),
      popularity: Number(row.popularity ?? 0),
      published_at: dateOrNull(row.published_at),
      updated_at: dateOrNull(row.updated_at),
    }));
    return { items, total, hasMore: q.offset + items.length < total };
  });

  app.get("/products", async (req) => {
    const q = querySchema.parse(req.query);
    const where = ["p.is_active = 1"];
    const args: unknown[] = [];
    if (q.q) {
      where.push("(p.title LIKE ? OR p.excerpt LIKE ? OR p.description LIKE ?)");
      args.push(`%${q.q}%`, `%${q.q}%`, `%${q.q}%`);
    }
    if (q.updated_since) {
      where.push("p.updated_at >= ?");
      args.push(new Date(q.updated_since));
    }
    const order = q.sort === "popular" ? "p.view_count DESC, p.updated_at DESC" : "p.updated_at DESC";
    const [countResult, rowsResult] = await Promise.all([
      pool.query<CountRow[]>(`SELECT COUNT(*) total FROM properties p WHERE ${where.join(" AND ")}`, args),
      pool.query<ListingRow[]>(`
        SELECT p.id,p.slug,p.title,p.excerpt,p.description,p.image_url,p.price,p.currency,
               p.view_count,p.status,p.is_negotiable,p.city,p.district,p.created_at,p.updated_at,
               c.name category,sc.name subcategory
        FROM properties p
        LEFT JOIN categories c ON c.id=p.category_id
        LEFT JOIN sub_categories sc ON sc.id=p.sub_category_id
        WHERE ${where.join(" AND ")}
        ORDER BY ${order} LIMIT ? OFFSET ?`, [...args, q.limit, q.offset]),
    ]);
    const total = Number(countResult[0][0]?.total ?? 0);
    const items = rowsResult[0].map((row) => ({
      id: String(row.id),
      kind: "product",
      contentType: "listing",
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt ?? row.description,
      url: `https://kamanilan.com/ilan/${row.slug}`,
      image_url: row.image_url,
      category: row.category,
      subcategory: row.subcategory,
      price: row.price == null ? null : Number(row.price),
      currency: row.currency,
      popularity: Number(row.view_count ?? 0),
      inStock: row.status !== "tukendi",
      negotiable: Boolean(row.is_negotiable),
      location: [row.district, row.city].filter(Boolean).join(", "),
      published_at: dateOrNull(row.created_at as string | Date | null),
      updated_at: dateOrNull(row.updated_at as string | Date | null),
    }));
    return { items, total, hasMore: q.offset + items.length < total };
  });

  app.get("/context", async () => {
    const [listingsResult, articlesResult, announcementsResult, pagesResult, categoriesResult] = await Promise.all([
      pool.query<InventoryRow[]>("SELECT COUNT(*) total, MAX(updated_at) lastUpdated FROM properties WHERE is_active=1"),
      pool.query<InventoryRow[]>("SELECT COUNT(*) total, MAX(updated_at) lastUpdated FROM articles WHERE is_published=1"),
      pool.query<InventoryRow[]>("SELECT COUNT(*) total, MAX(updated_at) lastUpdated FROM announcements WHERE is_published=1"),
      pool.query<InventoryRow[]>("SELECT COUNT(*) total, MAX(updated_at) lastUpdated FROM custom_pages WHERE is_published=1 AND module_key IN ('about', 'quality')"),
      pool.query<CategoryRow[]>("SELECT name FROM categories WHERE is_active=1 ORDER BY display_order LIMIT 30"),
    ]);
    const inventory = (result: InventoryRow[]) => ({
      total: Number(result[0]?.total ?? 0),
      lastUpdated: dateOrNull(result[0]?.lastUpdated ?? null),
    });
    return {
      tenant: "kamanilan",
      brand: "Kaman İlan",
      website: "https://kamanilan.com",
      sector: "Kaman ve Kırşehir yerel ilan ve içerik platformu",
      audience: ["Kaman halkı", "Kırşehir bölgesi", "yerel üreticiler", "alıcılar", "satıcılar"],
      contentPillars: ["yerel ilanlar", "tarım ve hayvancılık", "Kaman cevizi", "yerel haberler", "duyurular"],
      defaultHashtags: ["#kamanilan", "#kaman", "#kirsehir", "#yerelilan", "#yerelhaber"],
      categories: categoriesResult[0].map((row) => row.name),
      inventory: {
        listings: inventory(listingsResult[0]),
        articles: inventory(articlesResult[0]),
        announcements: inventory(announcementsResult[0]),
        pages: inventory(pagesResult[0]),
      },
    };
  });
}
