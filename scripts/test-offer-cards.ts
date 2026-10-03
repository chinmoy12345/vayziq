import assert from "node:assert/strict";
import { offerCardPreview } from "../lib/offer-card";
import { offerDiscount, type ProductOffer } from "../lib/product-offers";
import { couponInput } from "../lib/coupon-input";

const base: ProductOffer = { code: "TEST10", type: "percentage", value: 10, minimum: 0, maximum: null, rules: { productIds: [1] } };
assert.equal(offerCardPreview(base, 1, 1000)?.unit, 900);
assert.equal(offerCardPreview(base, 2, 1000), null);
assert.equal(offerCardPreview(base, 1, 0), null);
assert.equal(offerCardPreview({ ...base, expiresAt: "2020-01-01" }, 1, 1000), null);
assert.equal(offerCardPreview({ ...base, startsAt: "2099-01-01" }, 1, 1000), null);
assert.equal(offerCardPreview({ ...base, maximum: 50 }, 1, 1000)?.unit, 950);
assert.equal(offerCardPreview({ ...base, minimum: 2000 }, 1, 1000)?.quantity, 2);
const offers: ProductOffer[] = [base,
  { ...base, type: "fixed", value: 150, minimum: 1500 },
  { ...base, type: "quantity_price", rules: { productIds: [1], priceMode: "bundle", tiers: [{ quantity: 2, price: 1099 }] } },
  { ...base, type: "quantity_price", rules: { productIds: [1], priceMode: "unit", tiers: [{ quantity: 2, price: 505 }, { quantity: 3, price: 499 }] } },
  { ...base, type: "quantity_discount", rules: { productIds: [1], tiers: [{ quantity: 3, price: 100 }] } },
  { ...base, type: "buy_get", rules: { productIds: [1], buyQuantity: 2, getQuantity: 1, mode: "same_price" } },
];
for (const offer of offers) {
  const result = offerCardPreview(offer, 1, 999)!;
  assert.ok(result && result.quantity && result.unit);
  const total = 999 * result.quantity;
  const discount = offerDiscount(offer.code, total, [offer], [{ id: 1, price: 999, quantity: result.quantity }]);
  assert.equal(result.unit, Math.ceil((total - discount) / result.quantity * 100) / 100);
}
assert.equal(offerCardPreview(offers[2], 1, 999)?.label, "Buy 2 for ₹1,099");
assert.equal(offerCardPreview({ ...base, type: "buy_get", rules: { productIds: [1, 2], freeProductIds: [2], freeRule: "specific", buyQuantity: 1, getQuantity: 1 } }, 1, 999)?.unit, null);
const input = { code: "TEST10", type: "percentage", value: 10, active: true, rules: { productIds: [1], heading: "Weekend styles", bannerImage: "/offers/weekend.webp", priority: 10, showOnCards: false } };
assert.equal(couponInput(input).rules.heading, "Weekend styles");
assert.equal(couponInput(input).rules.showOnCards, false);
assert.throws(() => couponInput({ ...input, rules: { ...input.rules, priority: -1 } }));
assert.throws(() => couponInput({ ...input, rules: { ...input.rules, bannerImage: "javascript:alert(1)" } }));
console.log("Offer card and admin validation checks passed (all five discount types).");
