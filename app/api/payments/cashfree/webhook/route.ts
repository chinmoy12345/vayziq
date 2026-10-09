import { NextRequest, NextResponse } from "next/server";
import { getCashfreeCredentials } from "@/lib/payment-messaging-settings";
import { verifyCashfreeWebhook } from "@/lib/cashfree";
import { reconcileCashfreeOrder } from "@/lib/cashfree-reconcile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const credentials = await getCashfreeCredentials(true);
  if (!credentials) return NextResponse.json({ message: "Cashfree not configured." }, { status: 503 });
  const raw = await request.text();
  if (!verifyCashfreeWebhook(raw, request.headers.get("x-webhook-timestamp"), request.headers.get("x-webhook-signature"), credentials.secretKey)) return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  let payload: { type?: string; data?: { order?: { order_id?: string } } };
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ message: "Invalid payload." }, { status: 400 }); }
  if (payload.type !== "PAYMENT_SUCCESS_WEBHOOK") return NextResponse.json({ received: true });
  const orderId = payload.data?.order?.order_id;
  if (!orderId) return NextResponse.json({ message: "Missing order ID." }, { status: 400 });
  try { await reconcileCashfreeOrder(orderId); }
  catch (error) { console.error("Cashfree webhook reconciliation failed", error); return NextResponse.json({ message: "Reconciliation pending." }, { status: 503 }); }
  return NextResponse.json({ received: true });
}
