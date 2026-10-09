import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { getRazorpayCredentials } from "@/lib/payment-messaging-settings";
import { reconcileRazorpayPayment } from "@/lib/razorpay-reconcile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const userId = Number((await getCurrentUser())?.sub);
  if (!Number.isInteger(userId)) return NextResponse.json({ message: "Please sign in to verify your payment." }, { status: 401 });
  const credentials = await getRazorpayCredentials(true);
  if (!credentials) return NextResponse.json({ message: "Razorpay is not configured." }, { status: 503 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const internalOrderId = Number(body?.internalOrderId);
  const orderId = typeof body?.razorpay_order_id === "string" ? body.razorpay_order_id : "";
  const paymentId = typeof body?.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
  const signature = typeof body?.razorpay_signature === "string" ? body.razorpay_signature : "";
  if (!Number.isInteger(internalOrderId) || !orderId || !paymentId || !/^[a-f0-9]{64}$/i.test(signature)) return NextResponse.json({ message: "The payment response was incomplete." }, { status: 400 });
  const order = await prisma.order.findFirst({ where: { id: internalOrderId, userId, razorpayOrderId: orderId }, select: { orderNumber: true } });
  if (!order) return NextResponse.json({ message: "The payment does not match this order." }, { status: 400 });
  const expected = createHmac("sha256", credentials.keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  if (!timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))) return NextResponse.json({ message: "We could not verify this payment." }, { status: 400 });
  try {
    const orderNumber = await reconcileRazorpayPayment(orderId, paymentId);
    return NextResponse.json({ success: true, orderNumber });
  } catch (error) {
    console.error("Razorpay payment reconciliation failed", error);
    return NextResponse.json({ message: "Payment is being verified. Please check your orders shortly; contact support if money was deducted." }, { status: 409 });
  }
}
