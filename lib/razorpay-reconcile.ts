import { createHmac, timingSafeEqual } from "crypto";
import prisma from "@/lib/db";
import { getRazorpayCredentials } from "@/lib/payment-messaging-settings";
import { finalizePaidOrder } from "@/lib/payment-finalization";

export function verifyRazorpayWebhook(rawBody: string, signature: string | null, secret: string) {
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
}

type RazorpayPayment = { id: string; order_id: string; amount: number; currency: string; status: string; captured: boolean };
export async function reconcileRazorpayPayment(orderId: string, paymentId: string) {
  const order = await prisma.order.findUnique({ where: { razorpayOrderId: orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.paymentStatus === "paid") return order.orderNumber;
  const credentials = await getRazorpayCredentials(true);
  if (!credentials) throw new Error("RAZORPAY_UNAVAILABLE");
  const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString("base64")}` },
    cache: "no-store", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Razorpay payment fetch failed: ${response.status}`);
  const payment = await response.json() as RazorpayPayment;
  if (payment.id !== paymentId || payment.order_id !== orderId || payment.currency !== "INR" || payment.amount !== Math.round(Number(order.total) * 100) || payment.status !== "captured" || payment.captured !== true) throw new Error("PAYMENT_NOT_CAPTURED_OR_MISMATCHED");
  try { return await finalizePaidOrder(order.id, "razorpay", paymentId); }
  catch (error) {
    if (error instanceof Error && error.message === "ORDER_ALREADY_PROCESSED") {
      const current = await prisma.order.findUnique({ where: { id: order.id }, select: { paymentStatus: true } });
      if (current?.paymentStatus === "paid") return order.orderNumber;
    }
    throw error;
  }
}
