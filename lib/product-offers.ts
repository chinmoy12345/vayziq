export type OfferItem = { id: number | string; price: number; quantity: number };
export type OfferRules = { mode?: "same_price" | "selected"; freeRule?: "cheapest" | "specific"; freeProductIds?: number[]; productIds: number[]; buyQuantity?: number; getQuantity?: number; tiers?: { quantity: number; price: number }[]; priceMode?: "unit" | "bundle" };
export type ProductOffer = { code: string; description?: string; type: string; value: number; minimum: number; maximum: number | null; startsAt?: string | null; expiresAt?: string | null; rules?: OfferRules | null };
const money = (amount: number) => "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
export function offerTitle(offer: ProductOffer) {
  if (offer.type === "buy_get") return `Buy ${offer.rules?.buyQuantity} get ${offer.rules?.getQuantity} free`;
  if (offer.type === "quantity_price") return "Buy more, save more";
  if (offer.type === "quantity_discount") return "Quantity savings";
  return offer.type === "fixed" ? `${money(offer.value)} off` : `${offer.value}% off`;
}
export function offerTerms(offer: ProductOffer) {
  const extra = `${offer.minimum ? " Minimum order " + money(offer.minimum) + "." : ""}${offer.maximum !== null ? " Maximum saving " + money(offer.maximum) + "." : ""}`;
  const scope = offer.rules?.productIds.length ? "selected products" : "all products";
  if (offer.type === "quantity_discount") return (offer.rules?.tiers ?? []).map(tier => `Buy ${tier.quantity}+ → ${money(tier.price)} off`).join(" · ") + `. Applies to ${scope}.${extra}`;
  if (offer.type === "buy_get") return `Add ${(offer.rules?.buyQuantity ?? 0) + (offer.rules?.getQuantity ?? 0)} eligible items to your bag. ${(offer.rules?.mode ?? (offer.rules?.productIds.length ? "selected" : "same_price")) === "same_price" ? "Each free set must contain items with the same current selling price." : offer.rules?.freeRule === "specific" ? "Only the designated gift products are free; add them along with the paid products." : "The lowest-priced selected products are free."} Repeats for each complete set. Applies to ${scope}.${extra}`;
  if (offer.type === "quantity_price") return (offer.rules?.tiers ?? []).map(tier => `${tier.quantity}+ items: ${money(tier.price)} ${offer.rules?.priceMode === "bundle" ? "per qualifying bundle" : "each"}`).join(" · ") + `. Applies to ${scope}.${extra}`;
  return `On orders from ${money(offer.minimum)}${offer.maximum !== null ? "; save up to " + money(offer.maximum) : ""}. Applies to ${scope}.`;
}
export function offerDiscount(code: string, subtotal: number, offers: readonly ProductOffer[], items: readonly OfferItem[] = [], now = new Date()) {
  const offer = offers.find(item => item.code === code.trim().toUpperCase());
  if (!offer || !Number.isFinite(subtotal) || subtotal < offer.minimum || subtotal <= 0 || (offer.startsAt && new Date(offer.startsAt) > now) || (offer.expiresAt && new Date(offer.expiresAt) <= now)) return 0;
  const ids = offer.rules?.productIds ?? [];
  const eligible = items.filter(item => (!ids.length || ids.includes(Number(item.id))) && Number.isSafeInteger(item.quantity) && item.quantity > 0 && Number.isFinite(item.price) && item.price >= 0).map(item => ({ ...item, cents: Math.round(item.price * 100) }));
  const count = eligible.reduce((sum, item) => sum + item.quantity, 0);
  const eligibleCents = eligible.reduce((sum, item) => sum + item.cents * item.quantity, 0);
  let discountCents = 0;
  if (offer.type === "buy_get") {
    const buy = offer.rules?.buyQuantity ?? 0, get = offer.rules?.getQuantity ?? 0;
    if (buy < 1 || get < 1) return 0;
    const mode = offer.rules?.mode ?? (ids.length ? "selected" : "same_price");
    if (mode === "same_price") {
      const groups = new Map<number, number>();
      for (const item of eligible) groups.set(item.cents, (groups.get(item.cents) ?? 0) + item.quantity);
      for (const [cents, quantity] of groups) discountCents += Math.floor(quantity / (buy + get)) * get * cents;
    } else {
      const specific = offer.rules?.freeRule === "specific";
      const gifts = offer.rules?.freeProductIds ?? [];
      const paidCount = specific ? eligible.filter(item => !gifts.includes(Number(item.id))).reduce((sum,item) => sum + item.quantity, 0) : count;
      let free = specific ? Math.floor(paidCount / buy) * get : Math.floor(count / (buy + get)) * get;
      for (const item of [...eligible].filter(item => !specific || gifts.includes(Number(item.id))).sort((a,b) => a.cents - b.cents)) { const units = Math.min(free,item.quantity); discountCents += units * item.cents; free -= units; if (!free) break; }
    }
  } else if (offer.type === "quantity_discount") {
    const tier = [...(offer.rules?.tiers ?? [])].filter(tier => tier.quantity <= count).sort((a,b) => b.quantity - a.quantity)[0];
    if (!tier) return 0;
    discountCents = Math.min(eligibleCents, Math.round(tier.price * 100));
  } else if (offer.type === "quantity_price") {
    const tier = [...(offer.rules?.tiers ?? [])].filter(tier => tier.quantity <= count).sort((a,b) => b.quantity - a.quantity)[0];
    if (!tier) return 0;
    if (offer.rules?.priceMode === "bundle") {
      // Complete bundles only; leftover units retain their regular price.
      let remaining = Math.floor(count / tier.quantity) * tier.quantity;
      const bundles = remaining / tier.quantity;
      let covered = 0;
      for (const item of [...eligible].sort((a,b) => b.cents - a.cents)) { const units = Math.min(remaining, item.quantity); covered += units * item.cents; remaining -= units; }
      discountCents = Math.max(0, covered - bundles * Math.round(tier.price * 100));
    } else {
      discountCents = eligible.reduce((sum, item) => sum + Math.max(0, item.cents - Math.round(tier.price * 100)) * item.quantity, 0);
    }
  } else {
    const base = ids.length ? eligibleCents : Math.round(subtotal * 100);
    if (!base) return 0;
    discountCents = offer.type === "fixed" ? Math.min(base, Math.round(offer.value * 100)) : Math.round(base * offer.value / 100);
  }
  const applied = Math.max(0, Math.min(offer.maximum === null ? Infinity : Math.round(offer.maximum * 100), discountCents));
  return applied >= Math.round(subtotal * 100) ? 0 : applied / 100;
}
export function offerRequirement(offer: ProductOffer, subtotal: number, items: readonly OfferItem[]) {
  if (subtotal < offer.minimum) return `Add ${money(offer.minimum - subtotal)} more to meet the minimum order.`;
  const count = items.filter(item => !offer.rules?.productIds.length || offer.rules.productIds.includes(Number(item.id))).reduce((sum,item) => sum + item.quantity, 0);
  const required = offer.type === "buy_get" ? (offer.rules?.buyQuantity ?? 0) + (offer.rules?.getQuantity ?? 0) : ["quantity_price", "quantity_discount"].includes(offer.type) ? Math.min(...(offer.rules?.tiers ?? []).map(tier => tier.quantity)) : 1;
  if (offer.type === "buy_get" && (offer.rules?.mode ?? (offer.rules?.productIds.length ? "selected" : "same_price")) === "same_price") return `Add a complete set of ${required} products at the same selling price.`;
  if (offer.type === "buy_get" && offer.rules?.freeRule === "specific") return "Add the designated free product(s) and the required paid products.";
  return count < required ? `Add ${required - count} more eligible item${required - count === 1 ? "" : "s"} to unlock.` : "This offer does not reduce the current eligible product prices.";
}
