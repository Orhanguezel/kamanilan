import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { properties } from "@/modules/proporties/schema";
import {
  sellerCampaigns,
  sellerCampaignScopes,
  sellerStores,
  type SellerCampaignScopeType,
} from "./schema";
import {
  createCampaignBody,
  createStoreBody,
  updateCampaignBody,
  updateStoreBody,
} from "./validation";

type CampaignScope = {
  scope_type: SellerCampaignScopeType;
  target_id: string;
};

function getUserId(req: any): string | null {
  return ((req as any)?.user?.sub as string | undefined) ?? null;
}

function dedupeScopes(scopes: CampaignScope[]): CampaignScope[] {
  const seen = new Set<string>();
  const out: CampaignScope[] = [];
  for (const s of scopes) {
    const key = `${s.scope_type}:${s.target_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function collectIds(scopes: CampaignScope[], type: SellerCampaignScopeType): string[] {
  return scopes.filter((s) => s.scope_type === type).map((s) => s.target_id);
}

async function assertScopesOwnedBySeller(userId: string, scopes: CampaignScope[]) {
  const listingIds = collectIds(scopes, "listing");
  if (listingIds.length) {
    const rows = await db
      .select({ id: properties.id })
      .from(properties)
      .where(and(inArray(properties.id, listingIds), eq(properties.user_id, userId)));
    const found = new Set(rows.map((r) => r.id));
    const missing = listingIds.filter((id) => !found.has(id));
    if (missing.length) {
      throw new Error(`scope_not_owned:listing:${missing.join(",")}`);
    }
  }

  const storeIds = collectIds(scopes, "store");
  if (storeIds.length) {
    const rows = await db
      .select({ id: sellerStores.id })
      .from(sellerStores)
      .where(and(inArray(sellerStores.id, storeIds), eq(sellerStores.user_id, userId)));
    const found = new Set(rows.map((r) => r.id));
    const missing = storeIds.filter((id) => !found.has(id));
    if (missing.length) {
      throw new Error(`scope_not_owned:store:${missing.join(",")}`);
    }
  }

  const categoryIds = collectIds(scopes, "category");
  if (categoryIds.length) {
    const rows = await db
      .select({ id: properties.category_id })
      .from(properties)
      .where(and(inArray(properties.category_id, categoryIds), eq(properties.user_id, userId)));
    const found = new Set(rows.map((r) => r.id).filter((v): v is string => Boolean(v)));
    const missing = categoryIds.filter((id) => !found.has(id));
    if (missing.length) {
      throw new Error(`scope_not_owned:category:${missing.join(",")}`);
    }
  }

  const subCategoryIds = collectIds(scopes, "subcategory");
  if (subCategoryIds.length) {
    const rows = await db
      .select({ id: properties.sub_category_id })
      .from(properties)
      .where(and(inArray(properties.sub_category_id, subCategoryIds), eq(properties.user_id, userId)));
    const found = new Set(rows.map((r) => r.id).filter((v): v is string => Boolean(v)));
    const missing = subCategoryIds.filter((id) => !found.has(id));
    if (missing.length) {
      throw new Error(`scope_not_owned:subcategory:${missing.join(",")}`);
    }
  }

  const sellerIds = collectIds(scopes, "seller");
  if (sellerIds.some((id) => id !== userId)) {
    throw new Error("scope_not_owned:seller:only_self");
  }
}

async function loadScopeMap(campaignIds: string[]) {
  if (!campaignIds.length) return new Map<string, CampaignScope[]>();
  const rows = await db
    .select({
      campaign_id: sellerCampaignScopes.campaign_id,
      scope_type: sellerCampaignScopes.scope_type,
      target_id: sellerCampaignScopes.target_id,
    })
    .from(sellerCampaignScopes)
    .where(inArray(sellerCampaignScopes.campaign_id, campaignIds));

  const map = new Map<string, CampaignScope[]>();
  for (const r of rows) {
    if (!map.has(r.campaign_id)) map.set(r.campaign_id, []);
    map.get(r.campaign_id)!.push({
      scope_type: r.scope_type as SellerCampaignScopeType,
      target_id: r.target_id,
    });
  }
  return map;
}

export const listMyStores: RouteHandler = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const rows = await db
    .select()
    .from(sellerStores)
    .where(eq(sellerStores.user_id, userId));

  return reply.send(rows);
};

export const createMyStore: RouteHandler = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const parsed = createStoreBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });
  }

  const id = randomUUID();

  try {
    await db.insert(sellerStores).values({
      id,
      user_id: userId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      logo_url: parsed.data.logo_url ?? null,
      banner_url: parsed.data.banner_url ?? null,
      is_active: parsed.data.is_active === false ? 0 : 1,
    });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return reply.code(409).send({ error: { message: "store_slug_exists" } });
    }
    throw err;
  }

  const row = (await db.select().from(sellerStores).where(eq(sellerStores.id, id)).limit(1))[0];
  return reply.code(201).send(row);
};

export const updateMyStore: RouteHandler = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const id = String((req.params as any)?.id ?? "");
  const parsed = updateStoreBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });
  }

  const existing = (
    await db
      .select({ id: sellerStores.id })
      .from(sellerStores)
      .where(and(eq(sellerStores.id, id), eq(sellerStores.user_id, userId)))
      .limit(1)
  )[0];

  if (!existing) return reply.code(404).send({ error: { message: "not_found" } });

  const patch: Record<string, unknown> = { updated_at: new Date() };
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.slug !== undefined) patch.slug = parsed.data.slug;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description ?? null;
  if (parsed.data.logo_url !== undefined) patch.logo_url = parsed.data.logo_url ?? null;
  if (parsed.data.banner_url !== undefined) patch.banner_url = parsed.data.banner_url ?? null;
  if (parsed.data.is_active !== undefined) patch.is_active = parsed.data.is_active ? 1 : 0;

  try {
    await db
      .update(sellerStores)
      .set(patch as any)
      .where(and(eq(sellerStores.id, id), eq(sellerStores.user_id, userId)));
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return reply.code(409).send({ error: { message: "store_slug_exists" } });
    }
    throw err;
  }

  const row = (await db.select().from(sellerStores).where(eq(sellerStores.id, id)).limit(1))[0];
  return reply.send(row);
};

export const listMyCampaigns: RouteHandler = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const campaigns = await db
    .select()
    .from(sellerCampaigns)
    .where(eq(sellerCampaigns.seller_id, userId));

  const scopeMap = await loadScopeMap(campaigns.map((c) => c.id));
  return reply.send(
    campaigns.map((c) => ({
      ...c,
      scopes: scopeMap.get(c.id) ?? [],
    })),
  );
};

export const createMyCampaign: RouteHandler = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const parsed = createCampaignBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });
  }

  const scopes = dedupeScopes(parsed.data.scopes as CampaignScope[]);

  try {
    await assertScopesOwnedBySeller(userId, scopes);
  } catch (err: any) {
    const msg = String(err?.message ?? "scope_validation_failed");
    return reply.code(400).send({ error: { message: msg } });
  }

  const id = randomUUID();

  try {
    await db.transaction(async (tx) => {
      await tx.insert(sellerCampaigns).values({
        id,
        seller_id: userId,
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description ?? null,
        discount_type: parsed.data.discount_type,
        discount_value: parsed.data.discount_value.toFixed(2),
        start_at: parsed.data.start_at,
        end_at: parsed.data.end_at,
        is_active: parsed.data.is_active === false ? 0 : 1,
      });

      await tx.insert(sellerCampaignScopes).values(
        scopes.map((s) => ({
          campaign_id: id,
          scope_type: s.scope_type,
          target_id: s.target_id,
        })),
      );
    });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return reply.code(409).send({ error: { message: "campaign_slug_exists" } });
    }
    throw err;
  }

  const row = (await db.select().from(sellerCampaigns).where(eq(sellerCampaigns.id, id)).limit(1))[0];
  return reply.code(201).send({ ...row, scopes });
};

export const updateMyCampaign: RouteHandler = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const id = String((req.params as any)?.id ?? "");
  const parsed = updateCampaignBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });
  }

  const campaign = (
    await db
      .select()
      .from(sellerCampaigns)
      .where(and(eq(sellerCampaigns.id, id), eq(sellerCampaigns.seller_id, userId)))
      .limit(1)
  )[0];

  if (!campaign) return reply.code(404).send({ error: { message: "not_found" } });

  const patch: Record<string, unknown> = { updated_at: new Date() };
  if (parsed.data.title !== undefined) patch.title = parsed.data.title;
  if (parsed.data.slug !== undefined) patch.slug = parsed.data.slug;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description ?? null;
  if (parsed.data.discount_type !== undefined) patch.discount_type = parsed.data.discount_type;
  if (parsed.data.discount_value !== undefined) patch.discount_value = parsed.data.discount_value.toFixed(2);
  if (parsed.data.start_at !== undefined) patch.start_at = parsed.data.start_at;
  if (parsed.data.end_at !== undefined) patch.end_at = parsed.data.end_at;
  if (parsed.data.is_active !== undefined) patch.is_active = parsed.data.is_active ? 1 : 0;

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(sellerCampaigns)
        .set(patch as any)
        .where(and(eq(sellerCampaigns.id, id), eq(sellerCampaigns.seller_id, userId)));

      if (parsed.data.scopes) {
        const scopes = dedupeScopes(parsed.data.scopes as CampaignScope[]);
        await assertScopesOwnedBySeller(userId, scopes);
        await tx.delete(sellerCampaignScopes).where(eq(sellerCampaignScopes.campaign_id, id));
        await tx.insert(sellerCampaignScopes).values(
          scopes.map((s) => ({
            campaign_id: id,
            scope_type: s.scope_type,
            target_id: s.target_id,
          })),
        );
      }
    });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return reply.code(409).send({ error: { message: "campaign_slug_exists" } });
    }
    const msg = String(err?.message ?? "update_failed");
    if (msg.startsWith("scope_not_owned:")) {
      return reply.code(400).send({ error: { message: msg } });
    }
    throw err;
  }

  const row = (await db.select().from(sellerCampaigns).where(eq(sellerCampaigns.id, id)).limit(1))[0];
  const scopeRows = await db
    .select({ scope_type: sellerCampaignScopes.scope_type, target_id: sellerCampaignScopes.target_id })
    .from(sellerCampaignScopes)
    .where(eq(sellerCampaignScopes.campaign_id, id));

  return reply.send({
    ...row,
    scopes: scopeRows,
  });
};

export const removeMyCampaign: RouteHandler = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const id = String((req.params as any)?.id ?? "");

  await db.transaction(async (tx) => {
    const campaign = (
      await tx
        .select({ id: sellerCampaigns.id })
        .from(sellerCampaigns)
        .where(and(eq(sellerCampaigns.id, id), eq(sellerCampaigns.seller_id, userId)))
        .limit(1)
    )[0];

    if (!campaign) return;

    await tx.delete(sellerCampaignScopes).where(eq(sellerCampaignScopes.campaign_id, id));
    await tx.delete(sellerCampaigns).where(eq(sellerCampaigns.id, id));
  });

  return reply.send({ ok: true });
};
