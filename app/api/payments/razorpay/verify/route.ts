import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getCurrentUser();
  const userId = Number(session?.sub);
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ success: false, message: "Please sign in to verify your payment." }, { status: 401 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ success: false, message: "Online payments are not configured yet." }, { status: 503 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const internalOrderId = Number(body.internalOrderId);
  const razorpayOrderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : "";
  const razorpayPaymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
  const razorpaySignature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : "";
  if (!Number.isInteger(internalOrderId) || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ success: false, message: "The payment response was incomplete." }, { status: 400 });
  }

  const expectedSignature = createHmac("sha256", keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
  const signatureIsValid = razorpaySignature.length === expectedSignature.length && timingSafeEqual(Buffer.from(razorpaySignature), Buffer.from(expectedSignature));
  if (!signatureIsValid) {
    return NextResponse.json({ success: false, message: "We could not verify this payment." }, { status: 400 });
  }

  const order = await prisma.order.findFirst({ where: { id: internalOrderId, userId }, include: { items: true } });
  if (!order || order.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json({ success: false, message: "The payment does not match this order." }, { status: 400 });
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const claimedOrder = await tx.order.updateMany({
        where: { id: order.id, paymentStatus: "pending" },
        data: { status: "confirmed", paymentStatus: "paid", razorpayPaymentId },
      });
      if (claimedOrder.count !== 1) throw new Error("ORDER_ALREADY_PROCESSED");

      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId }, select: { id: true, name: true, sku: true, stock: true } });
        if (!product) throw new Error("A product is no longer in stock.");
        let previousStock = product.stock;
        let movementSku = product.sku;
        let movementVariantId: number | null = null;
        let variantLabel: string | null = null;
        const options = item.options as { variantId?: number } | null;
        if (options?.variantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: options.variantId }, select: { id: true, sku: true, stock: true, variantValues: { select: { optionValue: { select: { value: true, option: { select: { name: true } } } } } } } });
          if (!variant) throw new Error("A variant is no longer in stock.");
          previousStock = variant.stock;
          movementSku = variant.sku;
          movementVariantId = variant.id;
          variantLabel = variant.variantValues.map(({ optionValue }) => `${optionValue.option.name}: ${optionValue.value}`).join(" · ");
        }
        const updated = await tx.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (options?.variantId) { const variantStock = await tx.productVariant.updateMany({ where: { id: options.variantId, productId: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } }); if (variantStock.count !== 1) throw new Error("A variant is no longer in stock."); }
        if (updated.count !== 1) throw new Error("A product is no longer in stock.");
        await tx.inventoryMovement.create({ data: { productId: product.id, variantId: movementVariantId, orderId: order.id, productName: item.productName, sku: movementSku, variantLabel, delta: -item.quantity, previousStock, newStock: previousStock - item.quantity, reason: "sale" } });
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_ALREADY_PROCESSED") {
      const processedOrder = await prisma.order.findUnique({ where: { id: order.id } });
      if (processedOrder?.paymentStatus === "paid") {
        return NextResponse.json({ success: true, orderNumber: processedOrder.orderNumber });
      }
    }
    console.error("Unable to finalize Razorpay order", error);
    return NextResponse.json({ success: false, message: "Payment received, but we could not confirm the order. Please contact support." }, { status: 409 });
  }

  return NextResponse.json({ success: true, orderNumber: order.orderNumber });
}
