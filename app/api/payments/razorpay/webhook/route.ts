import { NextRequest, NextResponse } from "next/server";
import { getRazorpayCredentials } from "@/lib/payment-messaging-settings";
import { reconcileRazorpayPayment, verifyRazorpayWebhook } from "@/lib/razorpay-reconcile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const credentials = await getRazorpayCredentials(true);
  if (!credentials?.webhookSecret) return NextResponse.json({ message: "Webhook not configured." }, { status: 503 });
  const rawBody = await request.text();
  if (!verifyRazorpayWebhook(rawBody, request.headers.get("x-razorpay-signature"), credentials.webhookSecret)) return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
  try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ message: "Invalid payload." }, { status: 400 }); }
  if (event.event !== "payment.captured") return NextResponse.json({ received: true });
  const paymentId = event.payload?.payment?.entity?.id;
  const orderId = event.payload?.payment?.entity?.order_id;
  if (!paymentId || !orderId) return NextResponse.json({ message: "Missing payment references." }, { status: 400 });
  try { await reconcileRazorpayPayment(orderId, paymentId); }
  catch (error) { console.error("Razorpay webhook reconciliation failed", error); return NextResponse.json({ message: "Reconciliation pending." }, { status: 503 }); }
  return NextResponse.json({ received: true });
}
