import { db } from "@/db/client";
import { coupons, type NewCouponRow } from "./schema";
import { and, asc, desc, eq, like, sql, gte, lte, type SQL } from "drizzle-orm";
import { randomUUID } from "crypto";

type SortCol = "created_at" | "updated_at" | "title" | "discount_value" | "end_at";

export type ListCouponsParams = {
  q?:         string;
  is_active?: boolean;
  limit?:     number;
  offset?:    number;
  sort?:      SortCol;
  orderDir?:  "asc" | "desc";
  active_now?: boolean; // end_at >= NOW
};

function buildWhere(p: ListCouponsParams): SQL | undefined {
  const filters: SQL[] = [];
  if (typeof p.is_active === "boolean")
    filters.push(eq(coupons.is_active, p.is_active ? 1 : 0));
  if (p.active_now)
    filters.push(gte(coupons.end_at, new Date()));
  if (p.q?.trim())
    filters.push(like(coupons.title, `%${p.q.trim()}%`));
  return filters.length ? and(...filters) : undefined;
}

export async function listCoupons(p: ListCouponsParams) {
  const where  = buildWhere(p);
  const take   = p.limit  ?? 20;
  const skip   = p.offset ?? 0;
  const col    = (p.sort ?? "created_at") as SortCol;
  const dir    = p.orderDir === "asc" ? asc : desc;
  const orderBy = dir(coupons[col]);

  const [items, cnt] = await Promise.all([
    db.select().from(coupons).where(where).orderBy(orderBy).limit(take).offset(skip),
    db.select({ c: sql<number>`COUNT(1)` }).from(coupons).where(where),
  ]);
  return { items, total: cnt[0]?.c ?? 0 };
}

export async function getCouponById(id: string) {
  const rows = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getCouponByCode(code: string) {
  const rows = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
  return rows[0] ?? null;
}

export async function createCoupon(data: Omit<NewCouponRow, "id" | "created_at" | "updated_at">) {
  const id = randomUUID();
  await db.insert(coupons).values({ ...data, id });
  return getCouponById(id);
}

export async function updateCoupon(id: string, patch: Partial<NewCouponRow>) {
  await db.update(coupons).set({ ...patch, updated_at: new Date() }).where(eq(coupons.id, id));
  return getCouponById(id);
}

export async function deleteCoupon(id: string) {
  const res = await db.delete(coupons).where(eq(coupons.id, id)).execute();
  return (res as any).affectedRows ?? 0;
}
