import { and, asc, desc, eq, inArray, like, or, sql, type SQL } from 'drizzle-orm';
import { db, pool } from '@/db/client';
import {
  flashSales,
  flashSaleCategories,
  flashSaleSubcategories,
  flashSaleProperties,
  flashSaleSellers,
  type FlashSaleRow,
  type NewFlashSaleRow,
  type FlashSaleScopeType,
} from './schema';

type Sortable = 'created_at' | 'updated_at' | 'display_order' | 'start_at' | 'end_at' | 'title';

export type ListFlashSalesParams = {
  orderParam?: string;
  sort?: Sortable;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  is_active?: boolean | 0 | 1 | '0' | '1' | 'true' | 'false';
  active_now?: boolean | 0 | 1 | '0' | '1' | 'true' | 'false';
  q?: string;
  slug?: string;
  locale?: string;
  ids?: number[];  // belirli ID'leri filtrele
};

const toBoolMaybe = (v: ListFlashSalesParams['is_active']): boolean | undefined => {
  if (v === true || v === 1 || v === '1' || v === 'true') return true;
  if (v === false || v === 0 || v === '0' || v === 'false') return false;
  return undefined;
};

const parseOrder = (
  orderParam?: string,
  sort?: ListFlashSalesParams['sort'],
  ord?: ListFlashSalesParams['order'],
): { col: Sortable; dir: 'asc' | 'desc' } | null => {
  if (orderParam) {
    const m = orderParam.match(/^([a-zA-Z0-9_]+)\.(asc|desc)$/);
    const col = m?.[1] as Sortable | undefined;
    const dir = m?.[2] as 'asc' | 'desc' | undefined;
    if (col && dir && ['created_at', 'updated_at', 'display_order', 'start_at', 'end_at', 'title'].includes(col)) {
      return { col, dir };
    }
  }
  if (sort && ord) return { col: sort, dir: ord };
  return null;
};

export async function listFlashSales(params: ListFlashSalesParams) {
  const filters: SQL[] = [];

  const active = toBoolMaybe(params.is_active);
  if (active !== undefined) filters.push(eq(flashSales.is_active, active ? 1 : 0));

  const activeNow = toBoolMaybe(params.active_now);
  if (activeNow !== undefined && activeNow) {
    filters.push(sql`${flashSales.start_at} <= CURRENT_TIMESTAMP(3)`);
    filters.push(sql`${flashSales.end_at} >= CURRENT_TIMESTAMP(3)`);
  }

  if (params.slug?.trim()) filters.push(eq(flashSales.slug, params.slug.trim()));
  if (params.locale?.trim()) filters.push(eq(flashSales.locale, params.locale.trim()));

  if (params.ids?.length) filters.push(inArray(flashSales.id, params.ids.map(String)));

  if (params.q?.trim()) {
    const s = `%${params.q.trim()}%`;
    filters.push(or(like(flashSales.title, s), like(flashSales.slug, s), like(flashSales.description as any, s)) as SQL);
  }

  const whereExpr = filters.length ? (and(...filters) as SQL) : undefined;
  const orderParsed = parseOrder(params.orderParam, params.sort, params.order);

  const colMap = {
    created_at: flashSales.created_at,
    updated_at: flashSales.updated_at,
    display_order: flashSales.display_order,
    start_at: flashSales.start_at,
    end_at: flashSales.end_at,
    title: flashSales.title,
  } as const;

  const orderBy = orderParsed
    ? orderParsed.dir === 'asc'
      ? asc(colMap[orderParsed.col])
      : desc(colMap[orderParsed.col])
    : asc(flashSales.display_order);

  const take = params.limit && params.limit > 0 ? params.limit : 50;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  const [items, cnt] = await Promise.all([
    db.select().from(flashSales).where(whereExpr).orderBy(orderBy).limit(take).offset(skip),
    db.select({ c: sql<number>`COUNT(1)` }).from(flashSales).where(whereExpr),
  ]);

  return { items, total: cnt[0]?.c ?? 0 };
}

export async function getFlashSaleById(id: string) {
  const rows = await db.select().from(flashSales).where(eq(flashSales.id, id)).limit(1);
  const row = rows[0] ?? null;
  if (!row) return null;
  const scope_ids = await getFlashSaleScopeIds(id, row.scope_type as FlashSaleScopeType);
  return { ...row, scope_ids };
}

export async function getFlashSaleBySlug(slug: string, locale = 'tr') {
  const rows = await db
    .select()
    .from(flashSales)
    .where(and(eq(flashSales.slug, slug), eq(flashSales.locale, locale)))
    .limit(1);
  const row = rows[0] ?? null;
  if (!row) return null;
  const scope_ids = await getFlashSaleScopeIds(row.id, row.scope_type as FlashSaleScopeType);
  return { ...row, scope_ids };
}

export async function createFlashSale(values: NewFlashSaleRow) {
  await db.insert(flashSales).values(values);
  return getFlashSaleById(values.id);
}

export async function updateFlashSale(id: string, patch: Partial<NewFlashSaleRow>) {
  await db
    .update(flashSales)
    .set({ ...patch, updated_at: new Date() })
    .where(eq(flashSales.id, id));
  return getFlashSaleById(id);
}

export async function deleteFlashSale(id: string) {
  const res = await db.delete(flashSales).where(eq(flashSales.id, id)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === 'number'
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

/* ── Scope yönetimi ──────────────────────────────────────── */

export async function getFlashSaleScopeIds(flashSaleId: string, scopeType: FlashSaleScopeType): Promise<string[]> {
  if (scopeType === 'all') return [];

  if (scopeType === 'categories') {
    const rows = await db
      .select({ id: flashSaleCategories.category_id })
      .from(flashSaleCategories)
      .where(eq(flashSaleCategories.flash_sale_id, flashSaleId));
    return rows.map((r) => r.id);
  }

  if (scopeType === 'subcategories') {
    const rows = await db
      .select({ id: flashSaleSubcategories.sub_category_id })
      .from(flashSaleSubcategories)
      .where(eq(flashSaleSubcategories.flash_sale_id, flashSaleId));
    return rows.map((r) => r.id);
  }

  if (scopeType === 'properties') {
    const rows = await db
      .select({ id: flashSaleProperties.property_id })
      .from(flashSaleProperties)
      .where(eq(flashSaleProperties.flash_sale_id, flashSaleId));
    return rows.map((r) => r.id);
  }

  if (scopeType === 'sellers') {
    const rows = await db
      .select({ id: flashSaleSellers.seller_id })
      .from(flashSaleSellers)
      .where(eq(flashSaleSellers.flash_sale_id, flashSaleId));
    return rows.map((r) => r.id);
  }

  return [];
}

export async function replaceFlashSaleScope(
  flashSaleId: string,
  scopeType: FlashSaleScopeType,
  ids: string[],
): Promise<void> {
  // Tüm scope tablolarını temizle
  await Promise.all([
    db.delete(flashSaleCategories).where(eq(flashSaleCategories.flash_sale_id, flashSaleId)),
    db.delete(flashSaleSubcategories).where(eq(flashSaleSubcategories.flash_sale_id, flashSaleId)),
    db.delete(flashSaleProperties).where(eq(flashSaleProperties.flash_sale_id, flashSaleId)),
    db.delete(flashSaleSellers).where(eq(flashSaleSellers.flash_sale_id, flashSaleId)),
  ]);

  if (!ids.length || scopeType === 'all') return;

  const uniq = [...new Set(ids)];

  if (scopeType === 'categories') {
    await db.insert(flashSaleCategories).values(
      uniq.map((category_id) => ({ flash_sale_id: flashSaleId, category_id })),
    );
  } else if (scopeType === 'subcategories') {
    await db.insert(flashSaleSubcategories).values(
      uniq.map((sub_category_id) => ({ flash_sale_id: flashSaleId, sub_category_id })),
    );
  } else if (scopeType === 'properties') {
    await db.insert(flashSaleProperties).values(
      uniq.map((property_id) => ({ flash_sale_id: flashSaleId, property_id })),
    );
  } else if (scopeType === 'sellers') {
    await db.insert(flashSaleSellers).values(
      uniq.map((seller_id) => ({ flash_sale_id: flashSaleId, seller_id })),
    );
  }
}

/* ── İlan için aktif kampanyalar ─────────────────────────── */

export type PropertyForFlashSale = {
  id: string;
  category_id: string | null;
  sub_category_id: string | null;
};

export type FlashSaleSnippet = {
  id: string;
  title: string;
  slug: string;
  discount_type: string;
  discount_value: string;
  end_at: Date;
};

/**
 * Bir ilan için geçerli olan tüm aktif kampanyaları döndürür.
 * Çok sayıda kampanya yoksa (genellikle <20) uygulama katmanında filtreler.
 */
export async function getActiveFlashSalesForProperty(
  property: PropertyForFlashSale,
): Promise<FlashSaleSnippet[]> {
  // 1. Tüm aktif kampanyaları getir
  const activeCampaigns = await db
    .select()
    .from(flashSales)
    .where(
      and(
        eq(flashSales.is_active, 1),
        sql`${flashSales.start_at} <= CURRENT_TIMESTAMP(3)`,
        sql`${flashSales.end_at} >= CURRENT_TIMESTAMP(3)`,
      ),
    );

  if (!activeCampaigns.length) return [];

  const result: FlashSaleSnippet[] = [];

  for (const campaign of activeCampaigns) {
    const scope = campaign.scope_type as FlashSaleScopeType;
    let matches = false;

    if (scope === 'all') {
      matches = true;
    } else if (scope === 'categories' && property.category_id) {
      const rows = await db
        .select({ id: flashSaleCategories.category_id })
        .from(flashSaleCategories)
        .where(
          and(
            eq(flashSaleCategories.flash_sale_id, campaign.id),
            eq(flashSaleCategories.category_id, property.category_id),
          ),
        )
        .limit(1);
      matches = rows.length > 0;
    } else if (scope === 'subcategories' && property.sub_category_id) {
      const rows = await db
        .select({ id: flashSaleSubcategories.sub_category_id })
        .from(flashSaleSubcategories)
        .where(
          and(
            eq(flashSaleSubcategories.flash_sale_id, campaign.id),
            eq(flashSaleSubcategories.sub_category_id, property.sub_category_id),
          ),
        )
        .limit(1);
      matches = rows.length > 0;
    } else if (scope === 'properties') {
      const rows = await db
        .select({ id: flashSaleProperties.property_id })
        .from(flashSaleProperties)
        .where(
          and(
            eq(flashSaleProperties.flash_sale_id, campaign.id),
            eq(flashSaleProperties.property_id, property.id),
          ),
        )
        .limit(1);
      matches = rows.length > 0;
    }

    if (matches) {
      result.push({
        id: campaign.id,
        title: campaign.title,
        slug: campaign.slug,
        discount_type: campaign.discount_type,
        discount_value: campaign.discount_value,
        end_at: campaign.end_at,
      });
    }
  }

  return result;
}

/**
 * Liste sorgusu için toplu kampanya eşleştirmesi.
 * Önce tüm aktif kampanyaları ve scope verilerini yükler,
 * ardından her property için uygulama katmanında eşleştirir.
 */
export async function batchGetActiveFlashSalesForProperties(
  properties: PropertyForFlashSale[],
): Promise<Map<string, FlashSaleSnippet[]>> {
  const result = new Map<string, FlashSaleSnippet[]>(properties.map((p) => [p.id, []]));
  if (!properties.length) return result;

  const activeCampaigns = await db
    .select()
    .from(flashSales)
    .where(
      and(
        eq(flashSales.is_active, 1),
        sql`${flashSales.start_at} <= CURRENT_TIMESTAMP(3)`,
        sql`${flashSales.end_at} >= CURRENT_TIMESTAMP(3)`,
      ),
    );

  if (!activeCampaigns.length) return result;

  // Scope verilerini toplu yükle
  const campaignIds = activeCampaigns.map((c) => c.id);

  const [catLinks, subcatLinks, propLinks] = await Promise.all([
    campaignIds.length
      ? db
          .select()
          .from(flashSaleCategories)
          .where(inArray(flashSaleCategories.flash_sale_id, campaignIds))
      : [],
    campaignIds.length
      ? db
          .select()
          .from(flashSaleSubcategories)
          .where(inArray(flashSaleSubcategories.flash_sale_id, campaignIds))
      : [],
    campaignIds.length
      ? db
          .select()
          .from(flashSaleProperties)
          .where(inArray(flashSaleProperties.flash_sale_id, campaignIds))
      : [],
  ]);

  // Lookup map'leri
  const catMap = new Map<string, Set<string>>(); // campaignId → Set<categoryId>
  for (const l of catLinks) {
    if (!catMap.has(l.flash_sale_id)) catMap.set(l.flash_sale_id, new Set());
    catMap.get(l.flash_sale_id)!.add(l.category_id);
  }

  const subcatMap = new Map<string, Set<string>>();
  for (const l of subcatLinks) {
    if (!subcatMap.has(l.flash_sale_id)) subcatMap.set(l.flash_sale_id, new Set());
    subcatMap.get(l.flash_sale_id)!.add(l.sub_category_id);
  }

  const propMap = new Map<string, Set<string>>();
  for (const l of propLinks) {
    if (!propMap.has(l.flash_sale_id)) propMap.set(l.flash_sale_id, new Set());
    propMap.get(l.flash_sale_id)!.add(l.property_id);
  }

  // Her property için eşleşen kampanyaları bul
  for (const property of properties) {
    for (const campaign of activeCampaigns) {
      const scope = campaign.scope_type as FlashSaleScopeType;
      let matches = false;

      if (scope === 'all') {
        matches = true;
      } else if (scope === 'categories' && property.category_id) {
        matches = catMap.get(campaign.id)?.has(property.category_id) ?? false;
      } else if (scope === 'subcategories' && property.sub_category_id) {
        matches = subcatMap.get(campaign.id)?.has(property.sub_category_id) ?? false;
      } else if (scope === 'properties') {
        matches = propMap.get(campaign.id)?.has(property.id) ?? false;
      }

      if (matches) {
        result.get(property.id)!.push({
          id: campaign.id,
          title: campaign.title,
          slug: campaign.slug,
          discount_type: campaign.discount_type,
          discount_value: campaign.discount_value,
          end_at: campaign.end_at,
        });
      }
    }
  }

  return result;
}

/* ── Ana sayfa: Aktif kampanya + eşleşen ilanlar ─────────── */

export type FlashListingItem = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  price: string | null;
  flash_price: string | null;
  discount_label: string;
  currency: string;
  status: string;
  district: string;
  city: string;
  neighborhood: string | null;
  created_at: string;
};

export type ActiveFlashSaleWithListings = {
  sale: FlashSaleRow;
  items: FlashListingItem[];
};

function computeFlashPrice(
  price: string | null,
  discountType: string,
  discountValue: string,
): { flash_price: string | null; discount_label: string } {
  const p = parseFloat(String(price ?? 0));
  if (!p) return { flash_price: null, discount_label: '' };
  const dv = parseFloat(String(discountValue));
  if (discountType === 'percent') {
    const fp = Math.round(p * (1 - dv / 100) * 100) / 100;
    return { flash_price: fp.toFixed(2), discount_label: `%${dv} İndirim` };
  }
  const fp = Math.max(0, p - dv);
  return { flash_price: fp.toFixed(2), discount_label: `${dv}₺ İndirim` };
}

export async function getActiveFlashSaleWithListings(
  limit = 5,
): Promise<ActiveFlashSaleWithListings | null> {
  const { items: sales } = await listFlashSales({ is_active: true, active_now: true, limit: 1 });
  const sale = sales[0] as FlashSaleRow | undefined;
  if (!sale) return null;

  const scope = sale.scope_type as FlashSaleScopeType;
  let rows: any[] = [];

  const BASE_SELECT =
    'SELECT id, slug, title, image_url, price, currency, status, district, city, neighborhood, created_at FROM properties WHERE is_active = 1';

  if (scope === 'all') {
    const [r] = await pool.execute(
      `${BASE_SELECT} ORDER BY featured DESC, created_at DESC LIMIT ?`,
      [limit],
    );
    rows = r as any[];
  } else if (scope === 'categories') {
    const cats = await db
      .select({ id: flashSaleCategories.category_id })
      .from(flashSaleCategories)
      .where(eq(flashSaleCategories.flash_sale_id, sale.id));
    if (cats.length) {
      const ids = cats.map((c) => c.id);
      const placeholders = ids.map(() => '?').join(',');
      const [r] = await pool.execute(
        `${BASE_SELECT} AND category_id IN (${placeholders}) ORDER BY featured DESC, created_at DESC LIMIT ?`,
        [...ids, limit],
      );
      rows = r as any[];
    }
  } else if (scope === 'subcategories') {
    const subs = await db
      .select({ id: flashSaleSubcategories.sub_category_id })
      .from(flashSaleSubcategories)
      .where(eq(flashSaleSubcategories.flash_sale_id, sale.id));
    if (subs.length) {
      const ids = subs.map((s) => s.id);
      const placeholders = ids.map(() => '?').join(',');
      const [r] = await pool.execute(
        `${BASE_SELECT} AND sub_category_id IN (${placeholders}) ORDER BY featured DESC, created_at DESC LIMIT ?`,
        [...ids, limit],
      );
      rows = r as any[];
    }
  } else if (scope === 'properties') {
    const props = await db
      .select({ id: flashSaleProperties.property_id })
      .from(flashSaleProperties)
      .where(eq(flashSaleProperties.flash_sale_id, sale.id));
    if (props.length) {
      const ids = props.map((p) => p.id);
      const placeholders = ids.map(() => '?').join(',');
      const [r] = await pool.execute(
        `${BASE_SELECT} AND id IN (${placeholders}) ORDER BY featured DESC, created_at DESC LIMIT ?`,
        [...ids, limit],
      );
      rows = r as any[];
    }
  }

  const items: FlashListingItem[] = (rows as any[]).map((p) => {
    const { flash_price, discount_label } = computeFlashPrice(
      p.price,
      sale.discount_type,
      sale.discount_value,
    );
    return {
      id:           p.id,
      slug:         p.slug,
      title:        p.title,
      image_url:    p.image_url ?? null,
      price:        p.price ?? null,
      flash_price,
      discount_label,
      currency:     p.currency ?? 'TRY',
      status:       p.status,
      district:     p.district,
      city:         p.city,
      neighborhood: p.neighborhood ?? null,
      created_at:   p.created_at,
    };
  });

  return { sale, items };
}
