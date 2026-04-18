// =============================================================
// FILE: src/modules/xmlFeeds/fetcher.ts
// Bir feed'i cek → parse → diff (hash) → property upsert + xml_feed_items update
// =============================================================
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { properties } from "@/modules/proporties/schema";
import { generateSlug, uniquifySlug } from "@/modules/imports/validator";
import { parseXmlFeed, type ParsedFeedItem } from "./parser";
import {
  buildCategoryMapLookup,
  createRun,
  finalizeRun,
  findFeedItem,
  markMissingItemsStale,
  upsertCategoryMap,
  upsertFeedItem,
  updateFeed,
} from "./repository";
import { replacePropertyAssets } from "@/modules/proporties/repository";
import { enqueuePhotosBatch } from "@/modules/photoQueue/repository";
import { getMaxPhotosPerListing } from "@/modules/subscription/service";
import type { XmlFeedRow, XmlFeedRunStatus } from "./schema";

const FETCH_TIMEOUT_MS = 60_000;
const MAX_ITEMS_PER_RUN = 5_000;

export type FetchResult = {
  run_id: string;
  status: XmlFeedRunStatus;
  items_found: number;
  items_added: number;
  items_updated: number;
  items_skipped: number;
  items_failed: number;
  errors: Array<{ external_id?: string; message: string }>;
};

// -------------------------------------------------------------
// HTTP GET with optional auth header + timeout
// -------------------------------------------------------------
async function fetchXml(feed: XmlFeedRow): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "application/xml, text/xml, */*",
    "User-Agent": "KamanIlan-XmlFetcher/1.0",
  };
  if (feed.auth_header_name && feed.auth_header_value) {
    headers[feed.auth_header_name] = feed.auth_header_value;
  }

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(feed.url, { headers, signal: ctrl.signal });
    if (!res.ok) throw new Error(`http_${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(to);
  }
}

// -------------------------------------------------------------
// Slug ve asset yardimcilari
// -------------------------------------------------------------
async function ensureUniqueSlug(base: string, excludePropertyId: string | null): Promise<string> {
  // DB'de collision varsa -2, -3 ekle; var olanin dışındakileri (excludePropertyId) kendini saymadan
  const used = new Set<string>();
  let candidate = base || "ilan";
  let finalSlug = candidate;
  let attempt = 1;

  while (true) {
    const rows = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, finalSlug))
      .limit(1);
    const row = rows[0];
    if (!row || row.id === excludePropertyId) return finalSlug;
    attempt++;
    finalSlug = `${candidate}-${attempt}`;
    if (used.has(finalSlug)) throw new Error("slug_generation_loop");
    used.add(finalSlug);
    if (attempt > 100) throw new Error("slug_too_many_attempts");
  }
}

async function upsertPropertyAssetsFromUrls(
  propertyId: string,
  urls: string[],
  feedId: string,
  maxPhotos: number,
): Promise<void> {
  if (urls.length === 0) return;
  const capped = urls.slice(0, maxPhotos);
  await replacePropertyAssets(
    propertyId,
    capped.map((url, idx) => ({
      id:            `xml-${idx}`,
      url,
      kind:          "image" as const,
      is_cover:      idx === 0 ? 1 : 0,
      display_order: idx,
    })),
  );
  await enqueuePhotosBatch(
    capped.map((url, idx) => ({
      property_id:   propertyId,
      source:        "xml_feed" as const,
      source_ref_id: feedId,
      source_url:    url,
      display_order: idx,
      is_cover:      idx === 0,
    })),
  );
}

// -------------------------------------------------------------
// Tek bir item isleme
// -------------------------------------------------------------
async function upsertOneItem(
  feed: XmlFeedRow,
  parsed: ParsedFeedItem,
  categoryLookup: Map<string, { category_id: string | null; sub_category_id: string | null }>,
  maxPhotos: number,
): Promise<"added" | "updated" | "skipped" | "failed" | "unmapped"> {
  const existing = await findFeedItem(feed.id, parsed.external_id);

  // Hash degismedi → skip
  if (existing && existing.last_hash === parsed.content_hash && existing.property_id) {
    await upsertFeedItem({
      feed_id:     feed.id,
      external_id: parsed.external_id,
      property_id: existing.property_id,
      last_hash:   parsed.content_hash,
      status:      "active",
    });
    return "skipped";
  }

  // Kategori eslemesi
  const catKey = (parsed.sub_category || parsed.category || "").toLowerCase();
  const mapped = catKey ? categoryLookup.get(catKey) : undefined;
  const category_id = mapped?.category_id ?? null;
  const sub_category_id = mapped?.sub_category_id ?? null;

  // Kategori XML'de var ama hic eslenmemis → category_map'a "unmapped" ekle, property'yi yine de olustur
  // (admin sonra eslesitirir, is_active=0 ile pasif birakabilir)
  if (catKey && !mapped) {
    await upsertCategoryMap({
      feed_id:              feed.id,
      external_category:    catKey.slice(0, 200),
      local_category_id:    null,
      local_subcategory_id: null,
    });
  }

  try {
    if (existing && existing.property_id) {
      // UPDATE
      const slug = await ensureUniqueSlug(generateSlug(parsed.title), existing.property_id);
      await db.update(properties).set({
        title:           parsed.title,
        slug,
        excerpt:         parsed.excerpt,
        description:     parsed.description,
        address:         parsed.address,
        district:        parsed.district,
        city:            parsed.city,
        neighborhood:    parsed.neighborhood,
        price:           parsed.price != null ? parsed.price.toFixed(2) : null,
        currency:        parsed.currency,
        category_id,
        sub_category_id,
        status:          parsed.status,
        is_active:       category_id ? 1 : 0,   // unmapped ise pasif
        updated_at:      new Date(),
      } as any).where(eq(properties.id, existing.property_id));

      await upsertPropertyAssetsFromUrls(existing.property_id, parsed.photos, feed.id, maxPhotos);
      await upsertFeedItem({
        feed_id:     feed.id,
        external_id: parsed.external_id,
        property_id: existing.property_id,
        last_hash:   parsed.content_hash,
        status:      category_id ? "active" : "unmapped",
      });
      return "updated";
    }

    // INSERT — yeni property
    const usedLocal = new Set<string>();
    const slugBase = uniquifySlug(generateSlug(parsed.title), usedLocal);
    const slug = await ensureUniqueSlug(slugBase, null);
    const propertyId = randomUUID();

    await db.insert(properties).values({
      id:              propertyId,
      user_id:         feed.user_id,
      title:           parsed.title,
      slug,
      excerpt:         parsed.excerpt,
      description:     parsed.description,
      address:         parsed.address,
      district:        parsed.district,
      city:            parsed.city,
      neighborhood:    parsed.neighborhood,
      price:           parsed.price != null ? parsed.price.toFixed(2) : null,
      currency:        parsed.currency,
      category_id,
      sub_category_id,
      status:          parsed.status,
      is_active:       category_id ? 1 : 0,
      display_order:   0,
      created_at:      new Date(),
      updated_at:      new Date(),
    } as any);

    await upsertPropertyAssetsFromUrls(propertyId, parsed.photos, feed.id, maxPhotos);
    await upsertFeedItem({
      feed_id:     feed.id,
      external_id: parsed.external_id,
      property_id: propertyId,
      last_hash:   parsed.content_hash,
      status:      category_id ? "active" : "unmapped",
    });
    return category_id ? "added" : "unmapped";
  } catch (err) {
    // Hata durumunda feed_item'i "failed" yerine yine de sabit tut — bir sonraki run retry edecek
    throw err;
  }
}

// -------------------------------------------------------------
// Public: runFeed — tek feed icin tam dongu
// -------------------------------------------------------------
export async function runFeed(feed: XmlFeedRow): Promise<FetchResult> {
  const run = await createRun(feed.id);

  let items: ParsedFeedItem[] = [];
  const errors: Array<{ external_id?: string; message: string }> = [];

  try {
    const xml = await fetchXml(feed);
    items = parseXmlFeed(xml, (feed.format as any) || "sahibinden");
  } catch (err) {
    const msg = (err as Error)?.message || "fetch_failed";
    const status: XmlFeedRunStatus = msg.startsWith("http_") ? "http_error" : "parse_error";
    await finalizeRun(run.id, {
      status,
      items_found: 0,
      errors: [{ message: msg }],
    });
    await updateFeed(feed.id, {
      last_status:     status,
      last_fetched_at: new Date(),
    });
    return {
      run_id:        run.id,
      status,
      items_found:   0,
      items_added:   0,
      items_updated: 0,
      items_skipped: 0,
      items_failed:  0,
      errors:        [{ message: msg }],
    };
  }

  if (items.length > MAX_ITEMS_PER_RUN) {
    items = items.slice(0, MAX_ITEMS_PER_RUN);
    errors.push({ message: `items_capped_at_${MAX_ITEMS_PER_RUN}` });
  }

  const categoryLookup = await buildCategoryMapLookup(feed.id);
  const maxPhotos = await getMaxPhotosPerListing(feed.user_id);

  let added = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const seenExternalIds: string[] = [];

  for (const it of items) {
    seenExternalIds.push(it.external_id);
    try {
      const result = await upsertOneItem(feed, it, categoryLookup, maxPhotos);
      if (result === "added") added++;
      else if (result === "updated") updated++;
      else if (result === "skipped") skipped++;
      else if (result === "unmapped") added++; // property yaratildi, kategori eslesmesi admin'i bekliyor
    } catch (err) {
      failed++;
      const msg = (err as Error)?.message || "item_failed";
      if (errors.length < 20) {
        errors.push({ external_id: it.external_id, message: msg });
      }
    }
  }

  // Bu run'da gorulmeyenleri stale'e cek
  try {
    await markMissingItemsStale(feed.id, seenExternalIds);
  } catch {
    // sessiz — istatistik bozulmasin
  }

  const status: XmlFeedRunStatus = failed === 0
    ? "success"
    : (added + updated > 0 ? "partial" : "failed");

  await finalizeRun(run.id, {
    status,
    items_found:   items.length,
    items_added:   added,
    items_updated: updated,
    items_skipped: skipped,
    items_failed:  failed,
    errors:        errors.length > 0 ? errors : null,
  });

  await updateFeed(feed.id, {
    last_status:     status,
    last_fetched_at: new Date(),
  });

  return {
    run_id:        run.id,
    status,
    items_found:   items.length,
    items_added:   added,
    items_updated: updated,
    items_skipped: skipped,
    items_failed:  failed,
    errors,
  };
}
