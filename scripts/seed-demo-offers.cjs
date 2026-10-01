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
    { code: 'WELCOME10', description: '10% off your first order above ₹799.', type: 'percentage', value: 10, minimumOrder: 799, maximumDiscount: 250 },
    { code: 'STYLE250', description: 'Save ₹250 on orders above ₹2,499.', type: 'fixed', value: 250, minimumOrder: 2499 },
    { code: 'FESTIVE15', description: '15% festive saving on orders above ₹1,499.', type: 'percentage', value: 15, minimumOrder: 1499, maximumDiscount: 500 },
    { code: 'DEMOBOGO', description: 'Buy 1, get 1 free on eligible products.', type: 'buy_get', value: 0, rules: { productIds: [], buyQuantity: 1, getQuantity: 1 } },
    { code: 'DEMO2GET1', description: 'Buy 2, get 1 free on eligible products.', type: 'buy_get', value: 0, rules: { productIds: [], buyQuantity: 2, getQuantity: 1 } },
    { code: 'BUY2SAVE50', description: 'Buy any 2 eligible items and save INR 50.', type: 'quantity_discount', rules: { productIds: [], tiers: [{ quantity: 2, price: 50 }] } },
    { code: 'BUY3SAVE90', description: 'Buy any 3 eligible items and save INR 90.', type: 'quantity_discount', rules: { productIds: [], tiers: [{ quantity: 3, price: 90 }] } },
    { code: 'BUNDLE699', description: 'Get 3 eligible items for ₹699 each.', type: 'quantity_price', value: 0, rules: { productIds: selected, priceMode: 'unit', tiers: [{ quantity: 3, price: 699 }] } },
    { code: 'MORELESS', description: 'Buy 4 eligible pieces for ₹599 each.', type: 'quantity_price', value: 0, rules: { productIds: selected, priceMode: 'unit', tiers: [{ quantity: 4, price: 599 }] } },
    { code: 'WEEKEND100', description: '₹100 off orders above ₹1,199.', type: 'fixed', value: 100, minimumOrder: 1199 },
  ];
  await db.$transaction(async tx => {
    for (const demo of demos) await tx.coupon.upsert({ where: { code: demo.code }, update: { ...demo, active: true }, create: { ...demo, value: demo.value ?? 0, minimumOrder: demo.minimumOrder ?? 0, active: true } });
    const banner = { title: '10 live offers · Limited-time savings', subtitle: 'Use a code at checkout and discover bundle prices, buy-get offers and exclusive savings.', image: '/uploads/banners/offer-saree-editorial.png', link: '/offers', placement: 'offer-zone', active: true, sortOrder: 0 };
    const existingBanner = await tx.banner.findFirst({ where: { title: banner.title } });
    if (existingBanner) await tx.banner.update({ where: { id: existingBanner.id }, data: banner }); else await tx.banner.create({ data: banner });
  });
  console.log('Demo offers ready:', demos.map(offer => offer.code).join(', '));
  console.log('Quantity-price eligible product IDs:', selected.join(', '));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
