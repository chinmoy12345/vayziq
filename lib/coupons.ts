import type { Coupon, Prisma } from "@/lib/generated/prisma-suppliers";
import { offerDiscount, type ProductOffer, type OfferRules, type OfferItem } from "@/lib/product-offers";

export function publicOffer(coupon: Coupon): ProductOffer {
  return { rules: coupon.rules as OfferRules | null, code: coupon.code, description: coupon.description ?? "", type: coupon.type, value: Number(coupon.value), minimum: Number(coupon.minimumOrder ?? 0), maximum: coupon.maximumDiscount === null ? null : Number(coupon.maximumDiscount), startsAt: coupon.startsAt?.toISOString(), expiresAt: coupon.expiresAt?.toISOString() };
}
export function couponAvailable(coupon: Coupon, now = new Date()) {
  return coupon.active && (!coupon.startsAt || coupon.startsAt <= now) && (!coupon.expiresAt || coupon.expiresAt > now) && (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit);
}
// Reserve usage in the same transaction as order creation. Concurrent checkouts
// cannot both consume the last available use or accept a stale admin edit.
export async function reserveCoupon(tx: Prisma.TransactionClient, code: string, subtotal: number, items: OfferItem[]) {
  if (!code) return 0;
  const coupon = await tx.coupon.findUnique({ where: { code } });
  if (!coupon || !couponAvailable(coupon)) throw new Error("COUPON_UNAVAILABLE");
  const discount = offerDiscount(code, subtotal, [publicOffer(coupon)], items);
  if (!discount) throw new Error("COUPON_UNAVAILABLE");
  const claimed = await tx.coupon.updateMany({ where: { id: coupon.id, usageCount: coupon.usageCount, updatedAt: coupon.updatedAt, active: true }, data: { usageCount: { increment: 1 } } });
  if (claimed.count !== 1) throw new Error("COUPON_UNAVAILABLE");
  return discount;
}
