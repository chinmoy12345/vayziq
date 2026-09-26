export type ItemPolicy = { returnEnabled: boolean; replacementEnabled: boolean; returnDays: number; replacementDays: number };

export function policySnapshot(product: ItemPolicy): ItemPolicy {
  return { returnEnabled: product.returnEnabled, replacementEnabled: product.replacementEnabled, returnDays: product.returnDays, replacementDays: product.replacementDays };
}

export function serviceDeadline(deliveredAt: Date, days: number) {
  return new Date(deliveredAt.getTime() + days * 24 * 60 * 60 * 1000);
}

export function canRequestService(item: ItemPolicy & { shipment: { deliveredAt: Date | null; status: string } | null }, kind: "return" | "replacement", now = new Date()) {
  const delivery = item.shipment;
  return Boolean(delivery?.status === "delivered" && delivery.deliveredAt && delivery.deliveredAt <= now
    && (kind === "return" ? item.returnEnabled : item.replacementEnabled)
    && now <= serviceDeadline(delivery.deliveredAt, kind === "return" ? item.returnDays : item.replacementDays));
}

export function fulfillmentStatus(items: { shipment: { status: string } | null }[]) {
  const delivered = items.filter(item => item.shipment?.status === "delivered").length;
  if (items.length && delivered === items.length) return "delivered" as const;
  if (delivered) return "partially_delivered" as const;
  if (items.length && items.every(item => item.shipment)) return "shipped" as const;
  return "processing" as const;
}
