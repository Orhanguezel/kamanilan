import { and, asc, desc, eq, like, sql, type SQL } from 'drizzle-orm';
import { db } from '@/db/client';
import { listingVariants, type NewListingVariantRow } from './schema';

type Sortable = 'name' | 'display_order' | 'created_at' | 'updated_at';
type BoolLike = boolean | 0 | 1 | '0' | '1';

export type ListVariantsParams = {
  q?: string;
  category_id?: string;
  sub_category_id?: string;
  unit_id?: string;
  value_type?: string;
  is_active?: BoolLike;
  is_filterable?: BoolLike;
  limit?: number;
  offset?: number;
  sort?: Sortable;
  order?: 'asc' | 'desc';
};

const toBoolMaybe = (v: BoolLike | undefined): boolean | undefined => {
  if (v === true || v === 1 || v === '1') return true;
  if (v === false || v === 0 || v === '0') return false;
  return undefined;
};

export async function listVariants(params: ListVariantsParams) {
  const where: SQL[] = [];
  if (params.category_id) where.push(eq(listingVariants.category_id, params.category_id));
  if (params.sub_category_id) where.push(eq(listingVariants.sub_category_id, params.sub_category_id));
  if (params.unit_id) where.push(eq(listingVariants.unit_id, params.unit_id));
  if (params.value_type) where.push(eq(listingVariants.value_type, params.value_type));

  const active = toBoolMaybe(params.is_active);
  if (active !== undefined) where.push(eq(listingVariants.is_active, active ? 1 : 0));
  const filterable = toBoolMaybe(params.is_filterable);
  if (filterable !== undefined) where.push(eq(listingVariants.is_filterable, filterable ? 1 : 0));

  if (params.q?.trim()) {
    const s = `%${params.q.trim()}%`;
    where.push(sql`(${listingVariants.name} LIKE ${s} OR ${listingVariants.slug} LIKE ${s})`);
  }

  const whereExpr = where.length ? (and(...where) as SQL) : undefined;
  const sort: Sortable = params.sort ?? 'display_order';
  const orderBy = (params.order ?? 'asc') === 'asc' ? asc(listingVariants[sort]) : desc(listingVariants[sort]);
  const limit = params.limit && params.limit > 0 ? params.limit : 100;
  const offset = params.offset && params.offset >= 0 ? params.offset : 0;

  const [items, cnt] = await Promise.all([
    db.select().from(listingVariants).where(whereExpr).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ c: sql<number>`COUNT(1)` }).from(listingVariants).where(whereExpr),
  ]);

  return { items, total: Number(cnt[0]?.c ?? 0) };
}

export async function getVariantById(id: string) {
  const rows = await db.select().from(listingVariants).where(eq(listingVariants.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createVariant(values: NewListingVariantRow) {
  await db.insert(listingVariants).values(values);
  return getVariantById(values.id);
}

export async function updateVariant(id: string, patch: Partial<NewListingVariantRow>) {
  await db.update(listingVariants).set({ ...patch, updated_at: new Date() }).where(eq(listingVariants.id, id));
  return getVariantById(id);
}

export async function deleteVariant(id: string) {
  const res = await db.delete(listingVariants).where(eq(listingVariants.id, id)).execute();
  return typeof (res as any)?.affectedRows === 'number' ? (res as any).affectedRows : 0;
}

