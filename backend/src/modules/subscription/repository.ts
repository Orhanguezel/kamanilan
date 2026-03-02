// =============================================================
// FILE: src/modules/subscription/repository.ts
// =============================================================
import { db } from "@/db/client";
import { eq, and, ne, sql } from "drizzle-orm";
import {
  subscriptionPlans,
  subscriptionPlanFeatures,
  userSubscriptions,
  type SubscriptionPlanInsert,
} from "./schema";
import { properties } from "@/modules/proporties/schema";
import type { PlanCreateInput, PlanUpdateInput, AssignPlanInput } from "./validation";

// ------------------------------------------------------------------
// PLANS
// ------------------------------------------------------------------

export async function repoListPlans() {
  return db.select().from(subscriptionPlans).orderBy(subscriptionPlans.display_order);
}

export async function repoGetPlan(id: number) {
  const rows = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function repoGetPlanBySlug(slug: string) {
  const rows = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function repoGetDefaultPlan() {
  const rows = await db
    .select()
    .from(subscriptionPlans)
    .where(and(eq(subscriptionPlans.is_default, true as any), eq(subscriptionPlans.is_active, true as any)))
    .limit(1);
  return rows[0] ?? null;
}

export async function repoCreatePlan(data: PlanCreateInput) {
  const payload: SubscriptionPlanInsert = {
    slug:          data.slug,
    name:          data.name,
    description:   data.description ?? null,
    price_monthly: String(data.price_monthly ?? 0),
    price_yearly:  data.price_yearly != null ? String(data.price_yearly) : null,
    is_active:     data.is_active ?? true,
    is_default:    data.is_default ?? false,
    display_order: data.display_order ?? 0,
  };
  const result = await db.insert(subscriptionPlans).values(payload as any);
  const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;
  return repoGetPlan(Number(insertId));
}

export async function repoUpdatePlan(id: number, data: PlanUpdateInput) {
  // Bir plan varsayılan yapılırken diğerlerinin varsayılan bayrağı kaldırılır
  if (data.is_default === true) {
    await db
      .update(subscriptionPlans)
      .set({ is_default: 0 as any })
      .where(ne(subscriptionPlans.id, id));
  }

  const set: Record<string, unknown> = {
    updated_at: sql`CURRENT_TIMESTAMP(3)`,
  };
  if (data.slug          !== undefined) set.slug          = data.slug;
  if (data.name          !== undefined) set.name          = data.name;
  if (data.description   !== undefined) set.description   = data.description ?? null;
  if (data.price_monthly !== undefined) set.price_monthly = String(data.price_monthly);
  if (data.price_yearly  !== undefined) set.price_yearly  = data.price_yearly != null ? String(data.price_yearly) : null;
  if (data.is_active     !== undefined) set.is_active     = data.is_active ? 1 : 0;
  if (data.is_default    !== undefined) set.is_default    = data.is_default ? 1 : 0;
  if (data.display_order !== undefined) set.display_order = data.display_order;

  await db.update(subscriptionPlans).set(set as any).where(eq(subscriptionPlans.id, id));
  return repoGetPlan(id);
}

export async function repoDeletePlan(id: number) {
  await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
}

// ------------------------------------------------------------------
// FEATURES
// ------------------------------------------------------------------

export async function repoGetFeatures(planId: number) {
  return db
    .select()
    .from(subscriptionPlanFeatures)
    .where(eq(subscriptionPlanFeatures.plan_id, planId));
}

export async function repoUpsertFeatures(
  planId: number,
  features: Array<{ key: string; value: string; is_enabled?: boolean }>,
) {
  // Delete existing, then re-insert (simple & clean for small feature sets)
  await db
    .delete(subscriptionPlanFeatures)
    .where(eq(subscriptionPlanFeatures.plan_id, planId));

  if (features.length === 0) return;

  await db.insert(subscriptionPlanFeatures).values(
    features.map((f) => ({
      plan_id:       planId,
      feature_key:   f.key,
      feature_value: f.value,
      is_enabled:    f.is_enabled !== false ? 1 : 0,
    })) as any,
  );
}

// ------------------------------------------------------------------
// USER SUBSCRIPTIONS
// ------------------------------------------------------------------

export async function repoGetUserSubscription(userId: string) {
  const rows = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.user_id, userId))
    .limit(1);
  return rows[0] ?? null;
}

/** INSERT … ON DUPLICATE KEY UPDATE (user_id UNIQUE) */
export async function repoAssignPlan(
  userId: string,
  planId: number,
  expiresAt: string | null = null,
) {
  await db
    .insert(userSubscriptions)
    .values({
      user_id:    userId,
      plan_id:    planId,
      starts_at:  sql`CURRENT_TIMESTAMP(3)` as any,
      expires_at: expiresAt as any,
      is_active:  1 as any,
    } as any)
    .$dynamic()
    // Drizzle MySQL: onDuplicateKeyUpdate
    .onDuplicateKeyUpdate({
      set: {
        plan_id:    planId,
        starts_at:  sql`CURRENT_TIMESTAMP(3)` as any,
        expires_at: expiresAt as any,
        is_active:  1 as any,
        updated_at: sql`CURRENT_TIMESTAMP(3)` as any,
      },
    });
}

/** Kullanıcının aktif (is_active=1, süresi dolmamış) ilan sayısı */
export async function repoCountActiveListings(userId: string): Promise<number> {
  const rows = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(properties)
    .where(
      and(
        eq(properties.user_id, userId),
        eq(properties.is_active, 1),
      ),
    );
  return Number(rows[0]?.total ?? 0);
}

/** Tüm kullanıcı abonelikleri (admin liste) */
export async function repoListUserSubscriptions(opts?: {
  limit?: number;
  offset?: number;
}) {
  const limit  = Math.min(opts?.limit  ?? 50, 200);
  const offset = opts?.offset ?? 0;

  const rows = await db
    .select()
    .from(userSubscriptions)
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(userSubscriptions);

  return { items: rows, total: Number(total) };
}

/** Kullanıcıya plan atama/değiştirme (admin) */
export async function repoAdminAssignPlan(
  userId: string,
  input: AssignPlanInput,
) {
  return repoAssignPlan(userId, input.plan_id, input.expires_at ?? null);
}
