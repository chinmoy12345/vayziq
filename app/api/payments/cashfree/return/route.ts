import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { reconcileCashfreeOrder } from "@/lib/cashfree-reconcile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id") ?? "";
  const userId = Number((await getCurrentUser())?.sub);
  if (!Number.isInteger(userId)) return NextResponse.redirect(new URL("/login?redirect=/account/orders", request.url));
  const order = orderId ? await prisma.order.findFirst({ where: { cashfreeOrderId: orderId, userId }, select: { orderNumber: true } }) : null;
  if (!order) return NextResponse.redirect(new URL("/account/orders", request.url));
  try {
    const result = await reconcileCashfreeOrder(orderId);
    if (result.status === "paid") return NextResponse.redirect(new URL(`/order-success/${encodeURIComponent(order.orderNumber)}?cashfree=1`, request.url));
  } catch (error) { console.error("Cashfree return reconciliation failed", error); }
  return NextResponse.redirect(new URL(`/account/orders?payment=pending&order=${encodeURIComponent(order.orderNumber)}`, request.url));
}
