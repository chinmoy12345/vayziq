import { offerDiscount, offerTitle, type ProductOffer } from "./product-offers";

export function offerCardPreview(offer: ProductOffer, id: number, price: number, now = new Date()) {
  if (!(price > 0) || (offer.startsAt && new Date(offer.startsAt) > now) || (offer.expiresAt && new Date(offer.expiresAt) <= now)) return null;
  if (offer.rules?.productIds.length && !offer.rules.productIds.includes(id)) return null;
  // A designated gift cannot be represented as a discounted copy of the paid item.
  if (offer.type === "buy_get" && offer.rules?.freeRule === "specific") return { label: offerTitle(offer), unit: null, quantity: null };
  const minimumQuantity = Math.max(1, Math.ceil(offer.minimum / price));
  const quantities = new Set([minimumQuantity]);
  for (const tier of offer.rules?.tiers ?? []) quantities.add(Math.max(minimumQuantity, tier.quantity));
  if (offer.type === "buy_get") {
    const size = (offer.rules?.buyQuantity ?? 1) + (offer.rules?.getQuantity ?? 1);
    quantities.add(Math.ceil(minimumQuantity / size) * size);
  }
  let best: { label: string; unit: number | null; quantity: number | null } | null = null;
  for (const quantity of quantities) {
    const subtotal = Math.round(price * quantity * 100) / 100;
    const discount = offerDiscount(offer.code, subtotal, [offer], [{ id, price, quantity }], now);
    if (discount <= 0) continue;
    const total = Math.round((subtotal - discount) * 100) / 100;
    const unit = Math.ceil(total / quantity * 100) / 100;
    const money = (value: number) => "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
    const label = offer.type === "buy_get" ? offerTitle(offer) : quantity > 1 ? `Buy ${quantity} for ${money(total)}` : `${offerTitle(offer)} with ${offer.code}`;
    if (!best || best.unit === null || unit < best.unit) best = { label, unit, quantity };
  }
  return best;
}
