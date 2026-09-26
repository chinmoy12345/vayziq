import { resolveCart, type CartInput } from "@/lib/cart-pricing";
import { reserveCoupon } from "@/lib/coupons";
import { policySnapshot } from "@/lib/fulfillment";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { isDeliveryZipAllowed } from "@/lib/delivery-zip-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";



export async function POST(request: NextRequest) {
  const session = await getCurrentUser();
  const userId = Number(session?.sub);
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ success: false, message: "Please sign in to make a payment." }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ success: false, message: "Online payments are not configured yet." }, { status: 503 });
  }

  const { addressId, items, couponCode } = (await request.json()) as { addressId?: unknown; items?: unknown; couponCode?: unknown };
  if (!Number.isInteger(Number(addressId)) || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ success: false, message: "Select an address and add products to your cart." }, { status: 400 });
  }

  const address = await prisma.address.findFirst({ where: { id: Number(addressId), userId } });
  if (!address) {
    return NextResponse.json({ success: false, message: "Select a valid delivery address." }, { status: 400 });
  }
  if (!(await isDeliveryZipAllowed(address.postalCode))) {
    return NextResponse.json({ success: false, message: "Delivery is not available to this PIN code. Please choose another address." }, { status: 422 });
  }

  let orderedItems;
  try { orderedItems = await resolveCart(items as CartInput[]); } catch(error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Invalid cart." }, { status: 400 }); }
  const subtotal = orderedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const code = typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";
  const orderNumber = `TNK${Date.now().toString().slice(-8)}${randomBytes(2).toString("hex").toUpperCase()}`;

  let order;
  try {
  order = await prisma.$transaction(async tx => {
    const discount = await reserveCoupon(tx, code, subtotal, orderedItems.map(item => ({ id: item.product!.id, price: item.price, quantity: item.quantity })));
    return tx.order.create({
    data: {
      orderNumber,
      userId,
      addressId: address.id,
      subtotal,
      shipping,
      discount,
      couponCode: code || null,
      total: subtotal + shipping - discount,
      paymentStatus: "pending",
      items: {
        create: orderedItems.map((item) => ({
          ...policySnapshot(item.product!), productId: item.product!.id,
          productName: item.product!.name,
          sku: item.sku, options: item.options,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
  });
  }, { isolationLevel: "Serializable" });
  } catch { return NextResponse.json({ message: "This offer is no longer available. Refresh and try again." }, { status: 409 }); }

  try {
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(Number(order.total) * 100),
        currency: "INR",
        receipt: orderNumber,
        notes: { orderNumber, internalOrderId: String(order.id) },
      }),
    });
    const razorpayOrder = (await razorpayResponse.json()) as { id?: string; amount?: number; currency?: string };
    if (!razorpayResponse.ok || !razorpayOrder.id || !razorpayOrder.amount || !razorpayOrder.currency) {
      throw new Error("Razorpay did not create an order.");
    }

    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: razorpayOrder.id } });
    const customer = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    return NextResponse.json({
      success: true,
      keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      internalOrderId: order.id,
      orderNumber: order.orderNumber,
      customer: { name: customer?.name ?? address.fullName, email: customer?.email ?? "", contact: address.mobile },
    });
  } catch (error) {
    console.error("Unable to create Razorpay order", error);
    await prisma.$transaction(async tx => {
      const failed = await tx.order.updateMany({ where: { id: order.id, paymentStatus: "pending" }, data: { status: "cancelled", paymentStatus: "failed" } });
      if (failed.count && order.couponCode) await tx.coupon.updateMany({ where: { code: order.couponCode, usageCount: { gt: 0 } }, data: { usageCount: { decrement: 1 } } });
    });
    return NextResponse.json({ success: false, message: "Unable to start online payment. Please try again." }, { status: 502 });
  }
}
