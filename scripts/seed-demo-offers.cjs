// Explicit merchandising reset. It replaces every live coupon with the
// current VAYZIQ campaign set; historical Order.couponCode values are not changed.
require("@next/env").loadEnvConfig(process.cwd());
const { PrismaClient } = require("../lib/generated/prisma-suppliers");
const db = new PrismaClient();

async function main() {
  const products = await db.product.findMany({
    where: { status: "active", category: { status: "active" }, stock: { gt: 0 } },
    select: { id: true, name: true, price: true },
    orderBy: { id: "asc" },
  });
  if (products.length < 4) throw new Error("At least four active, in-stock products are required to build the campaign set.");

  const allIds = products.map(product => product.id);
  const lowPriceIds = products.filter(product => Number(product.price) <= 499).map(product => product.id);
  const premium = [...products].sort((a, b) => Number(b.price) - Number(a.price)).slice(0, 3);
  if (lowPriceIds.length < 1 || premium.length < 3) throw new Error("The catalog does not have enough products for the configured offer groups.");

  const campaigns = [
    { code: "VAYZIQ10", description: "Welcome saving: 10% off orders above ₹999, capped at ₹250.", type: "percentage", value: 10, minimumOrder: 999, maximumDiscount: 250 },
    { code: "STYLE250", description: "Save ₹250 when your bag is ₹1,999 or more.", type: "fixed", value: 250, minimumOrder: 1999 },
    { code: "WEEKEND15", description: "Weekend edit: 15% off orders above ₹1,499, capped at ₹500.", type: "percentage", value: 15, minimumOrder: 1499, maximumDiscount: 500 },
    { code: "BUY2GET1", description: "Buy any two selected essentials and get one selected essential free.", type: "buy_get", value: 0, rules: { productIds: allIds.slice(0, 4), mode: "selected", freeRule: "cheapest", buyQuantity: 2, getQuantity: 1 } },
    { code: "MATCH2GET1", description: "Buy 2, get 1 free when all three items have the same selling price.", type: "buy_get", value: 0, rules: { productIds: [], mode: "same_price", freeRule: "cheapest", buyQuantity: 2, getQuantity: 1 } },
    { code: "TRIO120", description: "Save ₹120 when you buy any 3 items.", type: "quantity_discount", value: 0, rules: { productIds: [], tiers: [{ quantity: 3, price: 120 }] } },
    { code: "QUAD300", description: "Save ₹300 when you buy any 4 items.", type: "quantity_discount", value: 0, rules: { productIds: [], tiers: [{ quantity: 4, price: 300 }] } },
    { code: "PREMIUM3FOR699", description: "Choose 3 premium styles for ₹699 each.", type: "quantity_price", value: 0, rules: { productIds: premium.map(product => product.id), tiers: [{ quantity: 3, price: 699 }], priceMode: "unit" } },
    { code: "PREMIUMBUNDLE1999", description: "Build a 3-piece premium bundle for ₹1,999.", type: "quantity_price", value: 0, rules: { productIds: premium.map(product => product.id), tiers: [{ quantity: 3, price: 1999 }], priceMode: "bundle" } },
    { code: "VALUE2FOR299", description: "Pick any 2 value styles for ₹299 each.", type: "quantity_price", value: 0, rules: { productIds: lowPriceIds, tiers: [{ quantity: 2, price: 299 }], priceMode: "unit" } },
  ];

  await db.$transaction(async tx => {
    await tx.coupon.deleteMany();
    await tx.coupon.createMany({ data: campaigns.map(campaign => ({ ...campaign, minimumOrder: campaign.minimumOrder ?? 0, active: true, usageCount: 0 })) });
    const banner = { title: "VAYZIQ offer drop · 10 live savings", subtitle: "Use a code at checkout for percentage savings, bundles and buy-get offers.", image: "/uploads/banners/offer-saree-editorial.png", link: "/offers", placement: "offer-zone", active: true, sortOrder: 0 };
    await tx.banner.deleteMany({ where: { placement: "offer-zone" } });
    await tx.banner.create({ data: banner });
  });

  console.log("Campaign reset complete:", campaigns.map(campaign => campaign.code).join(", "));
  console.log("Premium campaign products:", premium.map(product => `${product.id}:${product.name}`).join(" | "));
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
