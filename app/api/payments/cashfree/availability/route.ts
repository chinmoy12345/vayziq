import { NextResponse } from "next/server";
import { getCashfreeCredentials } from "@/lib/payment-messaging-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET() {
  const credentials = await getCashfreeCredentials();
  return NextResponse.json({ available: Boolean(credentials), mode: credentials?.mode ?? null }, { headers: { "Cache-Control": "no-store" } });
}
