// Explicit demo setup only: not run automatically during production builds.
require('@next/env').loadEnvConfig(process.cwd());
const { PrismaClient } = require('../lib/generated/prisma-suppliers');
const db = new PrismaClient();
async function main() {
  const products = await db.product.findMany({ where: { status: 'active', category: { status: 'active' }, price: { gte: 399 } }, select: { id: true, categoryId: true }, orderBy: { id: 'asc' } });
  const groups = new Map();
  for (const product of products) { if (!groups.has(product.categoryId)) groups.set(product.categoryId, []); groups.get(product.categoryId).push(product.id); }
  const selected = [];
  while (selected.length < 5 && [...groups.values()].some(group => group.length)) {
    for (const group of groups.values()) if (group.length && selected.length < 5) selected.push(group.shift());
  }
  const demos = [
    { code: 'DEMOBOGO', description: 'Demo offer: buy 1 get 1 free.', type: 'buy_get', rules: { productIds: [], buyQuantity: 1, getQuantity: 1 } },
    { code: 'DEMO2GET1', description: 'Demo offer: buy 2 get 1 free.', type: 'buy_get', rules: { productIds: [], buyQuantity: 2, getQuantity: 1 } },
    { code: 'BUY2SAVE50', description: 'Buy any 2 eligible items and save INR 50.', type: 'quantity_discount', rules: { productIds: [], tiers: [{ quantity: 2, price: 50 }] } },
    { code: 'BUY3SAVE90', description: 'Buy any 3 eligible items and save INR 90.', type: 'quantity_discount', rules: { productIds: [], tiers: [{ quantity: 3, price: 90 }] } },
    ...(selected.length ? [{ code: 'DEMOMORE', description: 'Demo offer on selected products: buy 3 at INR 399 each, or 4+ at INR 299 each.', type: 'quantity_price', rules: { productIds: selected, priceMode: 'unit', tiers: [{ quantity: 3, price: 399 }, { quantity: 4, price: 299 }] } }] : []),
  ];
  await db.$transaction(async tx => {
    for (const demo of demos) await tx.coupon.upsert({ where: { code: demo.code }, update: {}, create: { ...demo, value: 0, minimumOrder: 0, active: true } });
  });
  console.log('Demo offers ready:', demos.map(offer => offer.code).join(', '));
  console.log('Quantity-price eligible product IDs:', selected.join(', '));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
