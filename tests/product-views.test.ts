import assert from "node:assert/strict";
import { test } from "node:test";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { ACTIVE_VIEW_WINDOW_MS, readTotalViews, recordProductView, totalViewKey } from "../lib/product-views";

test("total-view parsing handles absent and invalid stored values", () => {
  assert.equal(readTotalViews(null), 0);
  assert.equal(readTotalViews({ totalViews: -1 }), 0);
  assert.equal(readTotalViews({ totalViews: "5" }), 0);
  assert.equal(readTotalViews({ totalViews: 5 }), 5);
});

test("database tracking deduplicates heartbeats, tabs, and expires inactive viewers", async () => {
  loadEnvConfig(process.cwd());
  const prisma = new PrismaClient();
  const rollback = new Error("Rollback view-tracking test");
  try {
    await assert.rejects(prisma.$transaction(async tx => {
      // Synthetic IDs avoid touching existing product metrics. All writes roll back.
      const productId = -Math.floor(Math.random() * 1_000_000_000) - 1;
      const visitorA = crypto.randomUUID();
      const visitorB = crypto.randomUUID();
      const visitA = crypto.randomUUID();
      const now = new Date();
      assert.equal(await recordProductView(tx, productId, visitorA, visitA, now), 1);
      assert.equal(await recordProductView(tx, productId, visitorA, visitA, now), 1);
      let total = await tx.storeSetting.findUniqueOrThrow({ where: { key: totalViewKey(productId) } });
      assert.equal(readTotalViews(total.value), 1, "heartbeat must not count as a page view");
      assert.equal(await recordProductView(tx, productId, visitorA, crypto.randomUUID(), now), 1, "same browser's second tab is one active viewer");
      assert.equal(await recordProductView(tx, productId, visitorB, crypto.randomUUID(), now), 2);
      total = await tx.storeSetting.findUniqueOrThrow({ where: { key: totalViewKey(productId) } });
      assert.equal(readTotalViews(total.value), 3, "new page visits increase total");
      const later = new Date(now.getTime() + ACTIVE_VIEW_WINDOW_MS + 1);
      assert.equal(await recordProductView(tx, productId, visitorA, visitA, later), 1, "expired visitor must leave active count");
      total = await tx.storeSetting.findUniqueOrThrow({ where: { key: totalViewKey(productId) } });
      assert.equal(readTotalViews(total.value), 3, "returning heartbeat retains total");
      throw rollback;
    }, { timeout: 15_000 }), error => error === rollback);
  } finally { await prisma.$disconnect(); }
});
