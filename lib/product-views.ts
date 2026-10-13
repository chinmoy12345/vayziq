import type { Prisma } from "@prisma/client";

export const ACTIVE_VIEW_WINDOW_MS = 60_000;
export const VIEW_PREFIX = "product_view_";
export const totalViewKey = (id: number) => `${VIEW_PREFIX}total_${id}`;
export const presencePrefix = (id: number) => `${VIEW_PREFIX}active_${id}_`;

// StoreSetting provides shared, persistent storage across server instances.
// Visit tokens deduplicate heartbeat retries; the SQL increment is atomic.
export async function recordProductView(tx: Prisma.TransactionClient, productId: number, visitorId: string, visitId: string, now = new Date()) {
  const visitKey = `${VIEW_PREFIX}visit_${productId}_${visitId}`;
  const visit = await tx.storeSetting.createMany({
    data: [{ key: visitKey, value: true, updatedAt: now }],
    skipDuplicates: true,
  });
  if (visit.count) {
    const key = totalViewKey(productId);
    await tx.$executeRaw`
      INSERT INTO "StoreSetting" ("key", "value", "updatedAt")
      VALUES (${key}, '{"totalViews":1}'::jsonb, ${now})
      ON CONFLICT ("key") DO UPDATE SET
        "value" = jsonb_build_object('totalViews', COALESCE(("StoreSetting"."value"->>'totalViews')::bigint, 0) + 1),
        "updatedAt" = ${now}
    `;
  } else {
    await tx.storeSetting.update({ where: { key: visitKey }, data: { updatedAt: now } });
  }
  const key = `${presencePrefix(productId)}${visitorId}`;
  await tx.storeSetting.upsert({ where: { key }, create: { key, value: true, updatedAt: now }, update: { value: true, updatedAt: now } });
  return tx.storeSetting.count({ where: { key: { startsWith: presencePrefix(productId) }, updatedAt: { gt: new Date(now.getTime() - ACTIVE_VIEW_WINDOW_MS) } } });
}

export function readTotalViews(value: unknown): number {
  if (!value || typeof value !== "object" || !("totalViews" in value)) return 0;
  return typeof value.totalViews === "number" && Number.isSafeInteger(value.totalViews) && value.totalViews >= 0 ? value.totalViews : 0;
}
