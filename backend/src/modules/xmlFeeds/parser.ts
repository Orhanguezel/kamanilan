// =============================================================
// FILE: src/modules/xmlFeeds/parser.ts
// Sahibinden-uyumlu XML adaptor
// Bkz. docs/toplu-import-plani.md §6
// =============================================================
import { XMLParser } from "fast-xml-parser";
import { createHash } from "node:crypto";
import type { XmlFeedFormat } from "./schema";

// -------------------------------------------------------------
// Normalized item (parser output — fetcher'in diff + upsert'i bunu kullanir)
// -------------------------------------------------------------
export type ParsedFeedItem = {
  external_id: string;
  title: string;
  description: string | null;
  excerpt: string | null;

  price: number | null;
  currency: string;

  city: string;
  district: string;
  neighborhood: string | null;
  address: string;

  category: string | null;            // XML'deki ham string — xml_feed_category_map ile eslenir
  sub_category: string | null;
  status: string;

  photos: string[];                   // URL listesi
  updated_at: string | null;          // ISO or null

  // Diff icin hash — fetcher hesaplar
  content_hash: string;
};

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function str(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  // fast-xml-parser bazi attribute'lu elementleri {"#text": "x", "@_attr": "y"} seklinde verir
  if (typeof v === "object") {
    const rec = v as Record<string, unknown>;
    if (typeof rec["#text"] === "string") return String(rec["#text"]).trim();
    if (typeof rec["#text"] === "number") return String(rec["#text"]);
  }
  return "";
}

function strOrNull(v: unknown): string | null {
  const s = str(v);
  return s.length > 0 ? s : null;
}

function attr(v: unknown, key: string): string | null {
  if (v && typeof v === "object") {
    const rec = v as Record<string, unknown>;
    const raw = rec[`@_${key}`];
    if (typeof raw === "string") return raw.trim();
    if (typeof raw === "number") return String(raw);
  }
  return null;
}

function parseNumber(raw: string | null): number | null {
  if (!raw) return null;
  const s = raw.trim().replace(/\s/g, "").replace(/[^\d.,-]/g, "");
  if (!s) return null;

  let normalized = s;
  if (s.includes(",") && s.includes(".")) {
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) normalized = s.replace(/\./g, "").replace(",", ".");
    else normalized = s.replace(/,/g, "");
  } else if (s.includes(",")) {
    const parts = s.split(",");
    if (parts.length === 2 && parts[1].length <= 2) normalized = s.replace(",", ".");
    else normalized = s.replace(/,/g, "");
  }

  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function extractPhotos(photosNode: unknown): string[] {
  if (!photosNode) return [];

  // Desteklenen formatlar:
  //   <photos><photo>url</photo></photos>
  //   <photos><photo><url>url</url></photo></photos>
  //   <photos><photo url="..."/></photos>
  const wrapper = photosNode as Record<string, unknown>;
  const items = asArray<unknown>((wrapper.photo ?? wrapper["photos"]) as unknown);

  const out: string[] = [];
  for (const ph of items) {
    if (typeof ph === "string") {
      const s = ph.trim();
      if (s) out.push(s);
      continue;
    }
    if (ph && typeof ph === "object") {
      const rec = ph as Record<string, unknown>;
      const fromUrl = strOrNull(rec.url);
      const fromAttr = attr(ph, "url");
      const fromText = strOrNull(rec["#text"]);
      const candidate = fromUrl ?? fromAttr ?? fromText;
      if (candidate && /^https?:\/\//i.test(candidate)) out.push(candidate);
    }
  }
  return out;
}

// -------------------------------------------------------------
// Sahibinden-style XML → ParsedFeedItem[]
// -------------------------------------------------------------
function normalizeSahibindenItem(item: Record<string, unknown>): ParsedFeedItem | null {
  const external_id = str(item.id ?? item.external_id ?? item.code);
  const title = str(item.title);
  if (!external_id || !title) return null;

  const priceRaw = str(item.price);
  const priceCurrency = attr(item.price, "currency") || str((item as any).currency) || "TRY";
  const price = parseNumber(priceRaw);

  const city = str(item.city);
  const district = str(item.district);
  if (!city || !district) return null;

  const description = strOrNull(item.description);
  const excerpt = strOrNull(item.excerpt ?? item.summary);

  const address = str(item.address) || [district, city].filter(Boolean).join(", ");
  const neighborhood = strOrNull(item.neighborhood);

  const category = strOrNull(item.category);
  const sub_category = strOrNull(item.sub_category ?? item.subcategory);

  const status = (strOrNull(item.status) || "active").toLowerCase().slice(0, 64);

  const photos = extractPhotos(item.photos);
  const updated_at = strOrNull(item.updated_at ?? item.updatedAt ?? item.modified);

  // Hash hesaplanacak icerik (parser disinda)
  const base: Omit<ParsedFeedItem, "content_hash"> = {
    external_id,
    title:           title.slice(0, 255),
    description,
    excerpt:         excerpt ? excerpt.slice(0, 500) : null,
    price,
    currency:        (priceCurrency || "TRY").toUpperCase().slice(0, 8),
    city:            city.slice(0, 255),
    district:        district.slice(0, 255),
    neighborhood:    neighborhood ? neighborhood.slice(0, 255) : null,
    address:         address.slice(0, 500),
    category,
    sub_category,
    status,
    photos,
    updated_at,
  };

  const content_hash = createHash("sha256").update(JSON.stringify(base)).digest("hex");

  return { ...base, content_hash };
}

// -------------------------------------------------------------
// Public: parseXmlFeed
// -------------------------------------------------------------
export function parseXmlFeed(xml: string, format: XmlFeedFormat): ParsedFeedItem[] {
  if (format !== "sahibinden") {
    throw new Error(`unsupported_format:${format}`);
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
    parseAttributeValue: false,
    parseTagValue: false,
  });

  let doc: unknown;
  try {
    doc = parser.parse(xml);
  } catch (err) {
    throw new Error("xml_parse_failed: " + (err as Error)?.message);
  }

  // Root: <realty><item>...</item></realty>
  // Bazen wrapper adi farkli olabilir (listings, data vb.) — esneklik:
  const root = doc as Record<string, unknown>;
  const rootKey = Object.keys(root).find((k) => k !== "?xml") ?? null;
  if (!rootKey) return [];

  const rootNode = root[rootKey] as Record<string, unknown> | undefined;
  if (!rootNode) return [];

  // rootNode.item olabilir, rootNode["realty"]?.item olabilir
  const itemsRaw =
    asArray<unknown>(rootNode.item as any) ??
    asArray<unknown>((rootNode.realty as any)?.item);

  const items: ParsedFeedItem[] = [];
  for (const raw of itemsRaw) {
    if (!raw || typeof raw !== "object") continue;
    const n = normalizeSahibindenItem(raw as Record<string, unknown>);
    if (n) items.push(n);
  }
  return items;
}
