import prisma from "@/lib/db";

export function canReviewOrder(order: { status: string; paymentStatus: string }, shipment?: { status: string; deliveredAt: Date | null } | null) {
  return order.status !== "cancelled" && shipment?.status === "delivered" && Boolean(shipment.deliveredAt)
    && order.paymentStatus !== "failed" && order.paymentStatus !== "refunded";
}

export async function hasPurchasedProduct(userId: number, productId: number) {
  const item = await prisma.orderItem.findFirst({
    where: {
      productId,
      shipment: { status: "delivered", deliveredAt: { not: null } },
      order: { userId, status: { not: "cancelled" }, paymentStatus: { notIn: ["failed", "refunded"] } },
    },
    select: { id: true },
  });
  return Boolean(item);
}
