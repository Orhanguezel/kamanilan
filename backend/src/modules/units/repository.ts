import { and, asc, desc, eq, like, sql, type SQL } from 'drizzle-orm';
import { db } from '@/db/client';
import { units, type NewUnitRow } from './schema';

type Sortable = 'name' | 'type' | 'display_order' | 'created_at' | 'updated_at';
type BoolLike = boolean | 0 | 1 | '0' | '1';

export type ListUnitsParams = {
  q?: string;
  type?: string;
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

export async function listUnits(params: ListUnitsParams) {
  const where: SQL[] = [];
  const active = toBoolMaybe(params.is_active);
  if (active !== undefined) where.push(eq(units.is_active, active ? 1 : 0));
  if (params.type?.trim()) where.push(eq(units.type, params.type.trim()));

  if (params.q?.trim()) {
    const s = `%${params.q.trim()}%`;
    where.push(sql`(${units.name} LIKE ${s} OR ${units.slug} LIKE ${s} OR ${units.symbol} LIKE ${s})`);
  }

  const whereExpr = where.length ? (and(...where) as SQL) : undefined;
  const sort: Sortable = params.sort ?? 'display_order';
  const orderBy = (params.order ?? 'asc') === 'asc' ? asc(units[sort]) : desc(units[sort]);
  const limit = params.limit && params.limit > 0 ? params.limit : 100;
  const offset = params.offset && params.offset >= 0 ? params.offset : 0;

  const [items, cnt] = await Promise.all([
    db.select().from(units).where(whereExpr).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ c: sql<number>`COUNT(1)` }).from(units).where(whereExpr),
  ]);
  return { items, total: Number(cnt[0]?.c ?? 0) };
}

export async function getUnitById(id: string) {
  const rows = await db.select().from(units).where(eq(units.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createUnit(values: NewUnitRow) {
  await db.insert(units).values(values);
  return getUnitById(values.id);
}

export async function updateUnit(id: string, patch: Partial<NewUnitRow>) {
  await db.update(units).set({ ...patch, updated_at: new Date() }).where(eq(units.id, id));
  return getUnitById(id);
}

export async function deleteUnit(id: string) {
  const res = await db.delete(units).where(eq(units.id, id)).execute();
  return typeof (res as any)?.affectedRows === 'number' ? (res as any).affectedRows : 0;
}

