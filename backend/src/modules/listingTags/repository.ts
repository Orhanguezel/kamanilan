import { and, asc, desc, eq, sql, type SQL } from 'drizzle-orm';
import { db } from '@/db/client';
import { listingTags, type NewListingTagRow } from './schema';

type Sortable = 'name' | 'display_order' | 'created_at' | 'updated_at';
type BoolLike = boolean | 0 | 1 | '0' | '1';

export type ListListingTagsParams = {
  q?: string;
  category_id?: string;
  sub_category_id?: string;
  is_active?: BoolLike;
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

export async function listListingTags(params: ListListingTagsParams) {
  const where: SQL[] = [];

  if (params.category_id) where.push(eq(listingTags.category_id, params.category_id));
  if (params.sub_category_id) where.push(eq(listingTags.sub_category_id, params.sub_category_id));

  const active = toBoolMaybe(params.is_active);
  if (active !== undefined) where.push(eq(listingTags.is_active, active ? 1 : 0));

  if (params.q?.trim()) {
    const s = `%${params.q.trim()}%`;
    where.push(sql`(${listingTags.name} LIKE ${s} OR ${listingTags.slug} LIKE ${s})`);
  }

  const whereExpr = where.length ? (and(...where) as SQL) : undefined;
  const sort: Sortable = params.sort ?? 'display_order';
  const orderBy = (params.order ?? 'asc') === 'asc' ? asc(listingTags[sort]) : desc(listingTags[sort]);
  const limit = params.limit && params.limit > 0 ? params.limit : 200;
  const offset = params.offset && params.offset >= 0 ? params.offset : 0;

  const [items, cnt] = await Promise.all([
    db.select().from(listingTags).where(whereExpr).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ c: sql<number>`COUNT(1)` }).from(listingTags).where(whereExpr),
  ]);

  return { items, total: Number(cnt[0]?.c ?? 0) };
}

export async function getListingTagById(id: string) {
  const rows = await db.select().from(listingTags).where(eq(listingTags.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createListingTag(values: NewListingTagRow) {
  await db.insert(listingTags).values(values);
  return getListingTagById(values.id);
}

export async function updateListingTag(id: string, patch: Partial<NewListingTagRow>) {
  await db.update(listingTags).set({ ...patch, updated_at: new Date() }).where(eq(listingTags.id, id));
  return getListingTagById(id);
}

export async function deleteListingTag(id: string) {
  const res = await db.delete(listingTags).where(eq(listingTags.id, id)).execute();
  return typeof (res as any)?.affectedRows === 'number' ? (res as any).affectedRows : 0;
}
