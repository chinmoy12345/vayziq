import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { resolveCart, type CartInput } from "@/lib/cart-pricing";
import { reserveCoupon } from "@/lib/coupons";
import { policySnapshot } from "@/lib/fulfillment";
import { isDeliveryZipAllowed } from "@/lib/delivery-zip-settings";
import { getCashfreeCredentials } from "@/lib/payment-messaging-settings";
import { cashfreeRequest, type CashfreeOrder } from "@/lib/cashfree";
import { CHANNEL_COOKIE, readAttribution } from "@/lib/channel-attribution";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const userId = Number((await getCurrentUser())?.sub);
  if (!Number.isInteger(userId)) return NextResponse.json({ message: "Please sign in to pay." }, { status: 401 });
  const credentials = await getCashfreeCredentials();
  if (!credentials) return NextResponse.json({ message: "Cashfree is not available yet." }, { status: 503 });
  const body = await request.json().catch(() => null) as { addressId?: unknown; items?: unknown; couponCode?: unknown } | null;
  if (!body || !Number.isInteger(Number(body.addressId)) || !Array.isArray(body.items) || !body.items.length) return NextResponse.json({ message: "Select an address and products." }, { status: 400 });
  const address = await prisma.address.findFirst({ where: { id: Number(body.addressId), userId } });
  if (!address || !(await isDeliveryZipAllowed(address.postalCode))) return NextResponse.json({ message: "Choose a serviceable delivery address." }, { status: 422 });
  const phone = address.mobile.replace(/\D/g, "").slice(-10);
  if (!/^\d{10}$/.test(phone)) return NextResponse.json({ message: "Enter a valid 10-digit mobile number in your address." }, { status: 422 });
  let items;
  try { items = await resolveCart(body.items as CartInput[]); } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Invalid cart." }, { status: 400 }); }
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const code = typeof body.couponCode === "string" ? body.couponCode.trim().toUpperCase() : "";
  const orderNumber = `TNK${Date.now().toString().slice(-8)}${randomBytes(3).toString("hex").toUpperCase()}`;
  const attribution = readAttribution(request.cookies.get(CHANNEL_COOKIE)?.value);
  let order;
  try {
    order = await prisma.$transaction(async tx => {
      const discount = await reserveCoupon(tx, code, subtotal, items.map(item => ({ id: item.product!.id, price: item.price, quantity: item.quantity })));
      return tx.order.create({ data: {
        orderNumber, cashfreeOrderId: orderNumber, userId, addressId: address.id, subtotal, shipping, discount, total: subtotal + shipping - discount,
        couponCode: code || null, acquisitionChannel: attribution.channel, acquisitionCampaign: attribution.campaign, paymentStatus: "pending",
        items: { create: items.map(item => ({ ...policySnapshot(item.product!), productId: item.product!.id, productName: item.product!.name, sku: item.sku, options: item.options, price: item.price, quantity: item.quantity })) },
      } });
    }, { isolationLevel: "Serializable" });
  } catch { return NextResponse.json({ message: "This offer is no longer available. Refresh and try again." }, { status: 409 }); }
  try {
    const requested = new URL(request.url);
    const origin = requested.hostname === "localhost" || requested.hostname === "127.0.0.1" ? requested.origin : SITE_URL;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    const payment = await cashfreeRequest<CashfreeOrder>(credentials, "/orders", { method: "POST", headers: { "x-idempotency-key": orderNumber }, body: JSON.stringify({
      order_id: orderNumber, order_amount: Number(order.total), order_currency: "INR",
      customer_details: { customer_id: String(userId), customer_name: address.fullName, customer_phone: phone, ...(user?.email ? { customer_email: user.email } : {}) },
      order_meta: { return_url: `${origin}/api/payments/cashfree/return?order_id={order_id}`, notify_url: `${origin}/api/payments/cashfree/webhook` },
      order_note: `Vayziq order ${orderNumber}`,
    }) });
    if (payment.order_id !== orderNumber || !payment.payment_session_id || payment.order_currency !== "INR" || Math.round(payment.order_amount * 100) !== Math.round(Number(order.total) * 100)) throw new Error("Cashfree order mismatch.");
    return NextResponse.json({ paymentSessionId: payment.payment_session_id, mode: credentials.mode });
  } catch (error) {
    console.error("Unable to create Cashfree order", error);
    // A timeout may mean Cashfree created the order: keep it pending for reconciliation.
    return NextResponse.json({ message: "Unable to start Cashfree checkout. Please try again or contact support if you were charged." }, { status: 502 });
  }
}
