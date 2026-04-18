// =============================================================
// FILE: src/modules/subscription/service.ts
// Abonelik iş mantığı
// =============================================================
import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import { categories } from '@/modules/proporties/local-schemas';
import {
  subscriptionPlanFeatures,
  subscriptionPlans,
} from "./schema";
import {
  repoGetDefaultPlan,
  repoAssignPlan,
  repoGetUserSubscription,
  repoGetFeatures,
  repoCountActiveListings,
} from "./repository";

// ------------------------------------------------------------------
// assignDefaultPlan
// Yeni kullanıcı oluşturulduğunda (signup) çağrılır.
// is_default=1 planı bulur ve user_subscriptions'a ekler.
// ------------------------------------------------------------------
export async function assignDefaultPlan(userId: string): Promise<void> {
  const plan = await repoGetDefaultPlan();
  if (!plan) return; // default plan yoksa sessizce geç
  await repoAssignPlan(userId, plan.id, null);
}

// ------------------------------------------------------------------
// getFeatureMap
// Kullanıcının aktif planının feature key→value haritasını döner.
// Kullanıcının aboneliği yoksa default planı kullanır.
// ------------------------------------------------------------------
export async function getFeatureMap(userId: string): Promise<Record<string, string>> {
  let planId: number | null = null;

  const sub = await repoGetUserSubscription(userId);
  if (sub) {
    planId = sub.plan_id;
  } else {
    const defaultPlan = await repoGetDefaultPlan();
    planId = defaultPlan?.id ?? null;
  }

  if (!planId) return {};

  const features = await repoGetFeatures(planId);
  const map: Record<string, string> = {};
  for (const f of features) {
    if (f.is_enabled) {
      map[f.feature_key] = f.feature_value;
    }
  }
  return map;
}

// ------------------------------------------------------------------
// getUserPlan
// Kullanıcının plan bilgisi + feature map (public + admin için)
// ------------------------------------------------------------------
export async function getUserPlan(userId: string) {
  const sub = await repoGetUserSubscription(userId);

  let plan = sub
    ? (await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, sub.plan_id))
        .limit(1))[0] ?? null
    : await repoGetDefaultPlan();

  if (!plan) return null;

  const features = await repoGetFeatures(plan.id);
  const featureMap: Record<string, string> = {};
  for (const f of features) {
    if (f.is_enabled) featureMap[f.feature_key] = f.feature_value;
  }

  return {
    subscription: sub ?? null,
    plan,
    features: featureMap,
  };
}

// ------------------------------------------------------------------
// hasFeature
// Import/XML feed gibi boolean feature'lari kontrol eder.
// "true" string'i → true; diger her sey (yoksa dahil) → false.
// ------------------------------------------------------------------
export async function hasFeature(
  userId: string,
  key: "bulk_import_enabled" | "xml_feed_enabled" | "can_add_video" | "can_feature_listing" | "can_boost_listing",
): Promise<boolean> {
  const map = await getFeatureMap(userId);
  return String(map[key] ?? "").toLowerCase() === "true";
}

// ------------------------------------------------------------------
// getListingCapacity
// Kullanicinin mevcut aktif ilan + plan limiti bilgisi.
// limit = null -> sinirsiz (plan max_active_listings="-1")
// ------------------------------------------------------------------
export async function getListingCapacity(userId: string): Promise<{
  current: number;
  limit: number | null;
}> {
  const featureMap = await getFeatureMap(userId);
  const maxStr = featureMap["max_active_listings"];
  const current = await repoCountActiveListings(userId);

  if (!maxStr) return { current, limit: null };
  const max = Number(maxStr);
  if (!Number.isFinite(max) || max < 0) return { current, limit: null };
  return { current, limit: max };
}

// ------------------------------------------------------------------
// canImportMore
// Toplu import icin N yeni ilan ekleyebilir mi?
// Mevcut + N <= limit kontrolu.
// ------------------------------------------------------------------
export async function canImportMore(userId: string, count: number): Promise<{
  allowed: boolean;
  current: number;
  limit: number | null;
  overage: number;
}> {
  const { current, limit } = await getListingCapacity(userId);
  if (limit === null) return { allowed: true, current, limit, overage: 0 };
  const projected = current + Math.max(0, count);
  const overage = Math.max(0, projected - limit);
  return { allowed: overage === 0, current, limit, overage };
}

// ------------------------------------------------------------------
// getMaxPhotosPerListing
// Per-ilan foto limiti. Feature yoksa default 20.
// ------------------------------------------------------------------
export async function getMaxPhotosPerListing(userId: string): Promise<number> {
  const map = await getFeatureMap(userId);
  const raw = map["max_photos_per_listing"];
  if (!raw) return 20;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

// ------------------------------------------------------------------
// checkListingLimit
// POST /my/listings öncesinde çağrılır.
// Önce kategori is_unlimited kontrolü, sonra plan limiti.
// ------------------------------------------------------------------
export async function checkListingLimit(
  userId: string,
  categoryId: string | null,
): Promise<{ allowed: boolean; reason?: string }> {
  // 1. Kategori sınırsız mı?
  if (categoryId) {
    const catRows = await db
      .select({ is_unlimited: categories.is_unlimited })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);
    if (catRows[0]?.is_unlimited) {
      return { allowed: true };
    }
  }

  // 2. Kullanıcının plan feature'larını al
  const featureMap = await getFeatureMap(userId);

  const maxStr = featureMap["max_active_listings"];
  if (!maxStr) {
    // Feature tanımlı değilse default: sınırsız (admin konfigüre etmemiş)
    return { allowed: true };
  }

  const max = Number(maxStr);

  // -1 = sınırsız
  if (max < 0) return { allowed: true };

  // 3. Mevcut aktif ilan sayısını kontrol et
  const current = await repoCountActiveListings(userId);
  if (current >= max) {
    return { allowed: false, reason: "listing_limit_exceeded" };
  }

  return { allowed: true };
}
