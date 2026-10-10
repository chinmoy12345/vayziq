import prisma from "@/lib/db";
import { notifyOrder } from "@/lib/customer-notifications";

/** Claim a paid order and move stock exactly once, in the same transaction. */
export async function finalizePaidOrder(orderId: number, provider: "razorpay" | "cashfree", paymentId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.paymentStatus === "paid") return order.orderNumber;
  await prisma.$transaction(async tx => {
    const claimed = await tx.order.updateMany({
      where: { id: orderId, paymentStatus: "pending", status: "pending" },
      data: { status: "confirmed", paymentStatus: "paid", ...(provider === "cashfree" ? { cashfreePaymentId: paymentId } : { razorpayPaymentId: paymentId }) },
    });
    if (claimed.count !== 1) throw new Error("ORDER_ALREADY_PROCESSED");
    for (const item of order.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId }, select: { id: true, sku: true, stock: true } });
      if (!product) throw new Error("PRODUCT_UNAVAILABLE");
      const options = item.options as { variantId?: number } | null;
      const variant = options?.variantId ? await tx.productVariant.findFirst({ where: { id: options.variantId, productId: item.productId }, select: { id: true, sku: true, stock: true, variantValues: { select: { optionValue: { select: { value: true, option: { select: { name: true } } } } } } } }) : null;
      if (options?.variantId && !variant) throw new Error("VARIANT_UNAVAILABLE");
      const previousStock = variant?.stock ?? product.stock;
      const productClaim = await tx.product.updateMany({ where: { id: product.id, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
      if (productClaim.count !== 1) throw new Error("PRODUCT_OUT_OF_STOCK");
      if (variant) {
        const variantClaim = await tx.productVariant.updateMany({ where: { id: variant.id, productId: product.id, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (variantClaim.count !== 1) throw new Error("VARIANT_OUT_OF_STOCK");
      }
      await tx.inventoryMovement.create({ data: { productId: product.id, variantId: variant?.id ?? null, orderId, productName: item.productName, sku: variant?.sku ?? product.sku, variantLabel: variant?.variantValues.map(({ optionValue }) => `${optionValue.option.name}: ${optionValue.value}`).join(" · ") ?? null, delta: -item.quantity, previousStock, newStock: previousStock - item.quantity, reason: "sale" } });
    }
  }, { isolationLevel: "Serializable" });
  await notifyOrder(orderId, "orderPlaced").catch(error => console.error("ORDER NOTIFICATION ERROR", error));
  return order.orderNumber;
}
