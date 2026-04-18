// =============================================================
// FILE: scripts/e2e-imports-xml.ts
// Faz 2 Sprint 1-5 E2E integration test (HTTP'siz, module cagrilari).
// Usage:  bun scripts/e2e-imports-xml.ts
// Temizlik: test property_id'lerin hepsini siler (transaction cascade).
// =============================================================
import * as XLSX from "xlsx";
import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";

import { parseSpreadsheet } from "@/modules/imports/parser";
import { parseXmlFeed } from "@/modules/xmlFeeds/parser";
import {
  loadTaxonomyCache,
  validateRow,
  type ImportMapping,
} from "@/modules/imports/validator";
import {
  createJob,
  insertItemsBatch,
  updateJob,
  listItemsByJob,
  updateItem,
} from "@/modules/imports/repository";
import { importJobs, importJobItems } from "@/modules/imports/schema";
import { properties, property_assets } from "@/modules/proporties/schema";
import { enqueuePhotosBatch } from "@/modules/photoQueue/repository";
import { photoDownloadQueue } from "@/modules/photoQueue/schema";
import { createProperty, replacePropertyAssets } from "@/modules/proporties/repository";
import {
  hasFeature,
  canImportMore,
  getMaxPhotosPerListing,
  getListingCapacity,
} from "@/modules/subscription/service";

const ADMIN_USER_ID = "4f618a8d-6fdb-498c-898a-395d368b2193";

// -------------------------------------------------------------
// Log helpers
// -------------------------------------------------------------
const passed: string[] = [];
const failed: string[] = [];

function ok(label: string) {
  console.log(`  ✅ ${label}`);
  passed.push(label);
}
function fail(label: string, detail?: unknown) {
  console.log(`  ❌ ${label}`, detail !== undefined ? detail : "");
  failed.push(label);
}
function section(t: string) {
  console.log(`\n━━━ ${t} ━━━`);
}

// -------------------------------------------------------------
// Test 1: XML Parser (pure)
// -------------------------------------------------------------
async function testXmlParser() {
  section("1. XML Parser (sahibinden format)");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<realty>
  <item>
    <id>TEST-001</id>
    <title>E2E Test 3+1 Satilik Kaman Merkez</title>
    <description>E2E test aciklama. Buyuk ev.</description>
    <price currency="TRY">1850000</price>
    <city>Kirsehir</city>
    <district>Kaman</district>
    <neighborhood>Cumhuriyet</neighborhood>
    <address>E2E test adres 1</address>
    <category>emlak-kira</category>
    <sub_category>daire-satilik</sub_category>
    <status>active</status>
    <photos>
      <photo order="1"><url>https://example.com/test/1.jpg</url></photo>
      <photo order="2"><url>https://example.com/test/2.jpg</url></photo>
    </photos>
    <updated_at>2026-04-10T14:30:00+03:00</updated_at>
  </item>
  <item>
    <id>TEST-002</id>
    <title>E2E Test 2+1 Kiralik</title>
    <price currency="TRY">15000</price>
    <city>Kirsehir</city>
    <district>Kaman</district>
    <address>E2E test adres 2</address>
    <category>emlak-kira</category>
    <status>active</status>
  </item>
  <item>
    <id>TEST-003-INVALID</id>
    <!-- title eksik: parser bu satiri reddetmeli -->
    <price currency="TRY">100</price>
    <city>Kirsehir</city>
    <district>Kaman</district>
  </item>
</realty>`;

  const items = parseXmlFeed(xml, "sahibinden");
  if (items.length === 2) ok(`2 item parse edildi (invalid atildi) — got ${items.length}`);
  else fail(`expected 2 items, got ${items.length}`, items);

  const first = items[0];
  if (first?.external_id === "TEST-001" && first.title.includes("E2E Test")) ok("external_id + title dogru");
  else fail("first item external_id/title", first);

  if (first?.photos.length === 2) ok("2 foto URL cekildi");
  else fail(`expected 2 photos, got ${first?.photos.length}`, first?.photos);

  if (first?.price === 1850000) ok("price parse 1850000");
  else fail(`price expected 1850000, got ${first?.price}`);

  if (first?.content_hash && first.content_hash.length === 64) ok("SHA-256 content_hash hesaplandi");
  else fail("content_hash yok veya kisa", first?.content_hash);

  // Idempotency check: ayni XML → ayni hash
  const items2 = parseXmlFeed(xml, "sahibinden");
  if (items2[0]?.content_hash === first?.content_hash) ok("idempotent hash (2x parse ayni sonuc)");
  else fail("hash idempotency broken");

  return items;
}

// -------------------------------------------------------------
// Test 2: Excel Parser (pure)
// -------------------------------------------------------------
function buildTestXlsx(): Buffer {
  const rows = [
    ["Baslik", "Fiyat", "Sehir", "Ilce", "Mahalle", "Adres", "Kategori", "Foto"],
    ["E2E Excel Ilan 1", "2500000", "Kirsehir", "Kaman", "Cumhuriyet", "Test adres 1", "emlak-kira", "https://example.com/x1.jpg"],
    ["E2E Excel Ilan 2", "175000", "Kirsehir", "Kaman", "", "Test adres 2", "emlak-kira", ""],
    ["", "100", "Kirsehir", "Kaman", "", "Baslik yok", "emlak-kira", ""], // invalid
    ["E2E Excel Ilan 3", "not-a-number", "Kirsehir", "Kaman", "", "Adres", "emlak-kira", ""], // invalid price becomes null, satir valid
    ["E2E Excel Ilan 4", "500", "Kirsehir", "Kaman", "", "Adres", "bilinmeyen-kategori", ""], // invalid category
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

async function testExcelParser() {
  section("2. Excel Parser");
  const buf = buildTestXlsx();
  const parsed = parseSpreadsheet(buf, { mime: "xlsx", filename: "test.xlsx" });

  if (parsed.source_type === "excel") ok("source_type='excel'");
  else fail(`source_type expected excel, got ${parsed.source_type}`);

  if (parsed.columns.length === 8) ok("8 kolon tespit edildi");
  else fail(`expected 8 columns, got ${parsed.columns.length}`, parsed.columns);

  if (parsed.total_rows === 5) ok("5 satir parse edildi (bos ilk satir header)");
  else fail(`expected 5 rows, got ${parsed.total_rows}`, parsed.rows);

  return parsed;
}

// -------------------------------------------------------------
// Test 3: Validator (DB dependency — categories)
// -------------------------------------------------------------
async function testValidator() {
  section("3. Validator + Taxonomy Cache");

  const taxonomy = await loadTaxonomyCache("tr");
  if (taxonomy.categoryIdBySlug.has("emlak-kira")) ok("taxonomy cache: emlak-kira slug bulundu");
  else fail("emlak-kira bulunamadi", [...taxonomy.categoryIdBySlug.keys()].slice(0, 10));

  const mapping: ImportMapping = {
    title:             "Baslik",
    city:              "Sehir",
    district:          "Ilce",
    neighborhood:      "Mahalle",
    address:           "Adres",
    price:             "Fiyat",
    category_slug:     "Kategori",
    photos:            "Foto",
  };

  const used = new Set<string>();

  const r1 = validateRow(
    { Baslik: "Valid Test", Fiyat: "100000", Sehir: "Kirsehir", Ilce: "Kaman", Mahalle: "A", Adres: "Adr", Kategori: "emlak-kira", Foto: "" },
    mapping, taxonomy, used,
  );
  if (r1.ok && r1.normalized?.category_id) ok("valid row + kategori resolved");
  else fail("valid row", r1);

  const r2 = validateRow(
    { Baslik: "", Fiyat: "100", Sehir: "Kirsehir", Ilce: "Kaman", Mahalle: "", Adres: "", Kategori: "", Foto: "" },
    mapping, taxonomy, used,
  );
  if (!r2.ok && r2.errors.includes("missing_title")) ok("missing title → invalid");
  else fail("missing title should be invalid", r2);

  const r3 = validateRow(
    { Baslik: "Bad Category", Fiyat: "100", Sehir: "Kirsehir", Ilce: "Kaman", Mahalle: "", Adres: "A", Kategori: "bilinmeyen-xxx", Foto: "" },
    mapping, taxonomy, used,
  );
  if (!r3.ok && r3.errors.some((e) => e.startsWith("unknown_category"))) ok("unknown category → invalid");
  else fail("unknown category should be invalid", r3);

  // Slug collision: ayni title 2 kere
  const rA = validateRow(
    { Baslik: "Duplicate Title", Fiyat: "100", Sehir: "Kirsehir", Ilce: "Kaman", Mahalle: "", Adres: "A", Kategori: "emlak-kira", Foto: "" },
    mapping, taxonomy, used,
  );
  const rB = validateRow(
    { Baslik: "Duplicate Title", Fiyat: "100", Sehir: "Kirsehir", Ilce: "Kaman", Mahalle: "", Adres: "A", Kategori: "emlak-kira", Foto: "" },
    mapping, taxonomy, used,
  );
  if (rA.normalized?.slug && rB.normalized?.slug && rA.normalized.slug !== rB.normalized.slug) {
    ok(`slug collision → suffix eklendi (${rA.normalized.slug} vs ${rB.normalized.slug})`);
  } else fail("slug uniquify", { a: rA.normalized?.slug, b: rB.normalized?.slug });

  return { taxonomy, mapping };
}

// -------------------------------------------------------------
// Test 4: Subscription helpers (DB)
// -------------------------------------------------------------
async function testSubscription() {
  section("4. Subscription Helpers");

  const hasImport = await hasFeature(ADMIN_USER_ID, "bulk_import_enabled");
  if (hasImport) ok("admin hasFeature(bulk_import_enabled)=true (launch default)");
  else fail("bulk_import_enabled false — seed yanlis");

  const hasXml = await hasFeature(ADMIN_USER_ID, "xml_feed_enabled");
  if (hasXml) ok("xml_feed_enabled=true");
  else fail("xml_feed_enabled false — seed yanlis");

  const cap = await getListingCapacity(ADMIN_USER_ID);
  if (cap.limit === null) ok(`limit=null (sinirsiz) launch defaults — current=${cap.current}`);
  else fail(`limit expected null, got ${cap.limit}`);

  const canImport = await canImportMore(ADMIN_USER_ID, 10);
  if (canImport.allowed) ok("canImportMore(10) allowed=true");
  else fail("canImportMore(10) should be allowed", canImport);

  const maxPhotos = await getMaxPhotosPerListing(ADMIN_USER_ID);
  if (maxPhotos === 20) ok(`max_photos=20 (Ucretsiz launch)`);
  else fail(`max_photos expected 20, got ${maxPhotos}`);
}

// -------------------------------------------------------------
// Test 5: Full import flow — job → items → commit
// -------------------------------------------------------------
async function testFullImportFlow(taxonomy: Awaited<ReturnType<typeof loadTaxonomyCache>>, mapping: ImportMapping) {
  section("5. Full Import Flow (job → validate → commit)");

  // 5.1 parse
  const buf = buildTestXlsx();
  const parsed = parseSpreadsheet(buf, { mime: "xlsx", filename: "e2e.xlsx" });

  // 5.2 create job + items
  const job = await createJob({
    user_id:     ADMIN_USER_ID,
    source_type: parsed.source_type,
    file_name:   "e2e.xlsx",
    file_size:   buf.length,
    total_rows:  parsed.total_rows,
  });
  ok(`job olustu — id=${job.id.slice(0, 8)}…`);

  await insertItemsBatch(
    parsed.rows.map((r, i) => ({
      job_id:    job.id,
      row_index: i,
      raw_json:  r,
      status:    "valid",
    })),
  );
  ok(`items insert: ${parsed.rows.length} adet`);

  // 5.3 validate all
  const { items } = await listItemsByJob(job.id, { limit: 200 });
  const used = new Set<string>();
  let valid = 0, invalid = 0;
  for (const it of items) {
    const raw = it.raw_json as Record<string, string>;
    const res = validateRow(raw, mapping, taxonomy, used);
    await updateItem(it.id, {
      status: res.ok ? "valid" : "invalid",
      normalized_json: res.normalized as unknown,
      errors_json: res.errors.length > 0 ? res.errors : null,
    });
    if (res.ok) valid++;
    else invalid++;
  }
  await updateJob(job.id, { status: "review", mapping_json: mapping, valid_rows: valid, invalid_rows: invalid });
  // 5 satir: 2 valid (ilk iki) + 3 invalid (bos baslik, bad price, bilinmeyen kategori)
  if (valid === 2 && invalid === 3) ok(`validation: ${valid} valid, ${invalid} invalid`);
  else fail(`expected 2 valid / 3 invalid, got ${valid}/${invalid}`);

  // 5.4 commit — sadece valid'leri insert et
  const maxPhotos = await getMaxPhotosPerListing(ADMIN_USER_ID);
  const { items: validItems } = await listItemsByJob(job.id, { status: "valid" });
  let imported = 0;
  for (const item of validItems) {
    const n = item.normalized_json as any;
    if (!n) continue;
    try {
      await createProperty(
        {
          id:              n.id,
          user_id:         ADMIN_USER_ID,
          title:           n.title,
          slug:            n.slug,
          status:          n.status || "active",
          address:         n.address,
          district:        n.district,
          city:            n.city,
          neighborhood:    n.neighborhood ?? null,
          excerpt:         n.excerpt ?? null,
          description:     n.description ?? null,
          price:           n.price != null ? n.price.toFixed(2) : null,
          currency:        n.currency,
          category_id:     n.category_id ?? null,
          sub_category_id: n.sub_category_id ?? null,
          brand_id:        n.brand_id ?? null,
          is_active:       1,
          display_order:   0,
          created_at:      new Date(),
          updated_at:      new Date(),
        } as any,
        { ownerUserId: ADMIN_USER_ID, isAdmin: true },
      );

      if (Array.isArray(n.photos) && n.photos.length > 0) {
        const capped = n.photos.slice(0, maxPhotos);
        await replacePropertyAssets(n.id, capped.map((url: string, idx: number) => ({
          id: `tmp-${idx}`, url, kind: "image" as const, is_cover: idx === 0 ? 1 : 0, display_order: idx,
        })));
        await enqueuePhotosBatch(capped.map((url: string, idx: number) => ({
          property_id:   n.id,
          source:        "excel_import" as const,
          source_ref_id: job.id,
          source_url:    url,
          display_order: idx,
          is_cover:      idx === 0,
        })));
      }
      await updateItem(item.id, { status: "imported", property_id: n.id });
      imported++;
    } catch (err) {
      await updateItem(item.id, { status: "failed", errors_json: [String((err as Error)?.message ?? err)] });
    }
  }

  await updateJob(job.id, { status: imported > 0 ? "completed" : "failed", imported_count: imported, finished_at: new Date() });
  if (imported === 2) ok(`commit: 2 property insert edildi`);
  else fail(`commit expected 2 imports, got ${imported}`);

  // 5.5 verify properties table
  const createdItems = await db.select().from(importJobItems).where(and(
    eq(importJobItems.job_id, job.id),
    eq(importJobItems.status, "imported"),
  ));
  const propIds = createdItems.map((r) => r.property_id).filter((x): x is string => !!x);
  const propRows = await db.select().from(properties).where(inArray(properties.id, propIds));
  if (propRows.length === imported) ok(`properties tablosunda ${propRows.length} kayit dogrulandi`);
  else fail(`properties row count`, { expected: imported, got: propRows.length });

  // 5.6 verify assets + queue
  const assetRows = await db.select().from(property_assets).where(inArray(property_assets.property_id, propIds));
  const queueRows = await db.select().from(photoDownloadQueue).where(inArray(photoDownloadQueue.property_id, propIds));
  if (assetRows.length >= 1) ok(`property_assets: ${assetRows.length} satir (en az 1 foto bekleniyor)`);
  else fail(`property_assets expected >=1, got ${assetRows.length}`);
  if (queueRows.length === assetRows.length) ok(`photo_download_queue: ${queueRows.length} pending (assets ile esit)`);
  else fail(`queue count mismatch`, { assets: assetRows.length, queue: queueRows.length });

  // 5.7 temizlik
  await db.delete(properties).where(inArray(properties.id, propIds));
  await db.delete(importJobs).where(eq(importJobs.id, job.id));
  // importJobItems + property_assets + photoDownloadQueue cascade ile gider
  ok("cleanup: test property + job silindi");
}

// -------------------------------------------------------------
// MAIN
// -------------------------------------------------------------
async function main() {
  console.log("═══ Faz 2 E2E Integration Test ═══");
  try {
    await testXmlParser();
    await testExcelParser();
    const { taxonomy, mapping } = await testValidator();
    await testSubscription();
    await testFullImportFlow(taxonomy, mapping);
  } catch (err) {
    console.error("\n💥 Fatal error:", err);
    process.exit(2);
  }

  console.log(`\n━━━ SONUC ━━━`);
  console.log(`✅ passed: ${passed.length}`);
  console.log(`❌ failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log("\nFAILED:");
    for (const f of failed) console.log(`  - ${f}`);
    process.exit(1);
  }
  process.exit(0);
}

main();
