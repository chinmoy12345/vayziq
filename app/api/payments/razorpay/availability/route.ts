import { NextResponse } from "next/server";
import { getRazorpayCredentials } from "@/lib/payment-messaging-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ available: Boolean(await getRazorpayCredentials()) }, { headers: { "Cache-Control": "no-store" } });
}
