import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma-suppliers";
import type { OrderStatus, PaymentStatus } from "@/lib/generated/prisma-suppliers";
import { requireAdminPermission } from "@/lib/auth";
import { notifyOrder } from "@/lib/customer-notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminPermission("orders","view"))) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id: Number(id) }, include: { user: { select: { name: true, email: true, mobile: true } }, address: true, shipments: true, items: { include: { shipment: true, serviceRequest: true } } } });
  if (!order) return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: order });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  const body = await request.json().catch(() => null) as { status?: unknown; paymentStatus?: unknown } | null;
  const status = typeof body?.status === "string" ? body.status as OrderStatus : undefined;
  const paymentStatus = typeof body?.paymentStatus === "string" ? body.paymentStatus as PaymentStatus : undefined;
  const requiredAction = status === "cancelled" ? "cancel" : "update";
  if (!(await requireAdminPermission("orders", requiredAction))) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  if (!Number.isInteger(orderId) || (status && !["pending", "confirmed", "processing", "cancelled"].includes(status)) || (paymentStatus && !["pending", "paid", "failed", "refunded"].includes(paymentStatus))) {
    return NextResponse.json({ success: false, message: "Choose a valid order status." }, { status: 400 });
  }
  if (status !== "cancelled") {
    const result = await prisma.order.updateMany({ where: { id: orderId }, data: { ...(status ? { status } : {}), ...(paymentStatus ? { paymentStatus } : {}) } });
    if (!result.count) return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    const updated = await prisma.order.findUnique({ where: { id: orderId } });
    if (status) await notifyOrder(orderId, "orderStatus").catch(error => console.error("ORDER STATUS NOTIFICATION ERROR", error));
    return NextResponse.json({ success: true, data: updated });
  }

  try {
    const order = await prisma.$transaction(async tx => {
      const existing = await tx.order.findUnique({ where: { id: orderId }, include: { items: true, shipments: { select: { id: true } } } });
      if (!existing) throw new Error("ORDER_NOT_FOUND");
      if (existing.shipments.length) throw new Error("ORDER_ALREADY_SHIPPED");
      if (existing.status === "cancelled") return existing;

      const recordedSales = await tx.inventoryMovement.findMany({ where: { orderId, reason: "sale" }, orderBy: { id: "asc" } });
      const legacyStockWasDeducted = recordedSales.length === 0 && (existing.razorpayOrderId === null
        ? existing.paymentStatus !== "failed" && existing.paymentStatus !== "refunded"
        : existing.paymentStatus === "paid");
      const sales = recordedSales.length > 0 ? recordedSales : legacyStockWasDeducted ? existing.items.map(item => {
        const options = item.options as { variantId?: number; variantLabel?: string } | null;
        return {
          productId: item.productId, productName: item.productName, sku: item.sku,
          variantId: options?.variantId ?? null, variantLabel: options?.variantLabel ?? null,
          delta: -item.quantity,
        };
      }) : [];
      for (const sale of sales) {
        const product = await tx.product.findUnique({ where: { id: sale.productId }, select: { id: true, name: true, sku: true, stock: true, hasVariations: true } });
        if (!product) throw new Error("PRODUCT_NOT_FOUND");
        let previousStock = product.stock;
        let variantId: number | null = null;
        let variantLabel = sale.variantLabel;
        let sku = product.sku;
        if (sale.variantId !== null || product.hasVariations) {
          const variant = await tx.productVariant.findFirst({
            where: { productId: product.id, ...(sale.variantId !== null ? { id: sale.variantId } : { sku: sale.sku }) },
            select: { id: true, sku: true, stock: true, variantValues: { select: { optionValue: { select: { value: true, option: { select: { name: true } } } } } } },
          });
          if (!variant) throw new Error("VARIANT_NOT_FOUND");
          previousStock = variant.stock;
          variantId = variant.id;
          sku = variant.sku;
          variantLabel = variant.variantValues.map(({ optionValue }) => `${optionValue.option.name}: ${optionValue.value}`).join(" · ") || sale.variantLabel;
          await tx.productVariant.update({ where: { id: variant.id }, data: { stock: { increment: -sale.delta } } });
          await tx.product.update({ where: { id: product.id }, data: { stock: { increment: -sale.delta } } });
        } else {
          await tx.product.update({ where: { id: product.id }, data: { stock: { increment: -sale.delta } } });
        }
        await tx.inventoryMovement.create({ data: {
          productId: product.id, variantId, orderId, productName: sale.productName, sku,
          variantLabel, delta: -sale.delta, previousStock, newStock: previousStock - sale.delta,
          reason: "cancellation", note: `${recordedSales.length ? "Restocked" : "Legacy order stock restored"} from cancelled order ${existing.orderNumber}`,
        } });
      }
      return tx.order.update({ where: { id: orderId }, data: { status: "cancelled", ...(paymentStatus ? { paymentStatus } : {}) }, include: { items: true } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await notifyOrder(orderId, "orderStatus").catch(error => console.error("ORDER STATUS NOTIFICATION ERROR", error));
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ORDER_NOT_FOUND") return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    if (message === "ORDER_ALREADY_SHIPPED") return NextResponse.json({ success: false, message: "This order has shipments. Manage delivery per shipment." }, { status: 409 });
    if (message === "VARIANT_NOT_FOUND") return NextResponse.json({ success: false, message: "An ordered variant no longer exists. Restore its stock manually in Inventory Management before cancelling." }, { status: 409 });
    if (message === "PRODUCT_NOT_FOUND" || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")) return NextResponse.json({ success: false, message: "Inventory changed at the same time. Refresh and try again." }, { status: 409 });
    console.error("ORDER CANCELLATION ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to cancel this order." }, { status: 500 });
  }
}
