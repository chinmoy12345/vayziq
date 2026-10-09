import prisma from "@/lib/db";
import { cashfreeRequest, type CashfreeOrder, type CashfreePayment } from "@/lib/cashfree";
import { getCashfreeCredentials } from "@/lib/payment-messaging-settings";
import { finalizePaidOrder } from "@/lib/payment-finalization";

export async function reconcileCashfreeOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { cashfreeOrderId: orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.paymentStatus === "paid") return { status: "paid" as const, orderNumber: order.orderNumber };
  const credentials = await getCashfreeCredentials(true);
  if (!credentials) throw new Error("CASHFREE_UNAVAILABLE");
  const [remoteOrder, payments] = await Promise.all([
    cashfreeRequest<CashfreeOrder>(credentials, `/orders/${encodeURIComponent(orderId)}`),
    cashfreeRequest<CashfreePayment[]>(credentials, `/orders/${encodeURIComponent(orderId)}/payments`),
  ]);
  const amount = Math.round(Number(order.total) * 100);
  if (remoteOrder.order_id !== orderId || remoteOrder.order_currency !== "INR" || Math.round(remoteOrder.order_amount * 100) !== amount) throw new Error("ORDER_AMOUNT_MISMATCH");
  const successful = payments.find(payment => payment.payment_status === "SUCCESS" && payment.payment_currency === "INR" && Math.round(payment.payment_amount * 100) === amount);
  if (remoteOrder.order_status !== "PAID" || !successful) return { status: "pending" as const, orderNumber: order.orderNumber };
  try {
    await finalizePaidOrder(order.id, "cashfree", String(successful.cf_payment_id));
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_ALREADY_PROCESSED") {
      const current = await prisma.order.findUnique({ where: { id: order.id }, select: { paymentStatus: true } });
      if (current?.paymentStatus === "paid") return { status: "paid" as const, orderNumber: order.orderNumber };
    }
    throw error;
  }
  return { status: "paid" as const, orderNumber: order.orderNumber };
}
