import { PrismaClient } from "../lib/generated/prisma-suppliers";
import { publicOffer, reserveCoupon } from "../lib/coupons";
import { offerDiscount, type OfferItem } from "../lib/product-offers";

const db = new PrismaClient();
const fail = (message: string): never => { throw new Error(`Offer verification failed: ${message}`); };

async function main() {
  const coupons = await db.coupon.findMany({ orderBy: { code: "asc" } });
  const expectedCodes = ["VAYZIQ10", "STYLE250", "WEEKEND15", "BUY2GET1", "MATCH2GET1", "TRIO120", "QUAD300", "PREMIUM3FOR699", "PREMIUMBUNDLE1999", "VALUE2FOR299"];
  if (coupons.length !== expectedCodes.length || expectedCodes.some(code => !coupons.some(coupon => coupon.code === code))) fail("campaign set is incomplete or contains an old coupon");
  if (coupons.some(coupon => !coupon.active || coupon.usageCount !== 0)) fail("new campaigns must start active with zero usage");

  const products = await db.product.findMany({ where: { status: "active", stock: { gt: 0 } }, select: { id: true, price: true }, orderBy: { id: "asc" } });
  const byId = new Map(products.map(product => [product.id, Number(product.price)]));
  const eligibleIds = [...new Set(coupons.flatMap(coupon => ((coupon.rules as { productIds?: number[] } | null)?.productIds ?? [])))];
  if (eligibleIds.some(id => !byId.has(id))) fail("a selected-product campaign points to an inactive or out-of-stock product");
  const item = (id: number, quantity: number): OfferItem => ({ id, quantity, price: byId.get(id) ?? 0 });
  const premium = [...products].sort((a, b) => Number(b.price) - Number(a.price)).slice(0, 3);
  const valueProduct = products.find(product => Number(product.price) <= 499);
  if (premium.length !== 3 || !valueProduct) fail("catalog fixtures missing");
  const value = valueProduct!;
  const basic = products.slice(0, 4);
  const cases: Record<string, OfferItem[]> = {
    VAYZIQ10: [item(basic[0].id, 2)], STYLE250: [item(premium[0].id, 2)], WEEKEND15: [item(premium[0].id, 1)],
    BUY2GET1: [item(basic[0].id, 3)], MATCH2GET1: [item(value.id, 3)], TRIO120: [item(basic[0].id, 3)], QUAD300: [item(basic[0].id, 4)],
    PREMIUM3FOR699: premium.map(product => item(product.id, 1)), PREMIUMBUNDLE1999: premium.map(product => item(product.id, 1)), VALUE2FOR299: [item(value.id, 2)],
  };

  for (const code of expectedCodes) {
    const items = cases[code]; const subtotal = items.reduce((sum, current) => sum + current.price * current.quantity, 0);
    const discount = offerDiscount(code, subtotal, coupons.map(publicOffer), items);
    if (!(discount > 0 && discount < subtotal)) fail(`${code} did not produce a valid discount`);
  }
  if (offerDiscount("VAYZIQ10", 998, coupons.map(publicOffer), [item(basic[0].id, 1)]) !== 0) fail("minimum-spend guard failed");

  const code = "STYLE250", items = cases[code], subtotal = items.reduce((sum, current) => sum + current.price * current.quantity, 0);
  try { await db.$transaction(async tx => { if ((await reserveCoupon(tx, code, subtotal, items)) <= 0) fail("checkout reservation returned no discount"); throw new Error("ROLLBACK_VERIFICATION_ONLY"); }); }
  catch (error) { if (!(error instanceof Error) || error.message !== "ROLLBACK_VERIFICATION_ONLY") throw error; }
  if ((await db.coupon.findUniqueOrThrow({ where: { code } })).usageCount !== 0) fail("verification must not consume coupon usage");
  console.log(`Verified ${expectedCodes.length} campaigns, price rules, minimum spend and checkout reservation.`);
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
