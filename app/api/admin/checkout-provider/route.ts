import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import { getCheckoutProviderSettings, updateCheckoutProviderSettings } from "@/lib/checkout-provider-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminPermission("settings", "view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ success: true, data: await getCheckoutProviderSettings() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await requireAdminPermission("settings", "update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as { provider?: unknown } | null;
  try {
    return NextResponse.json({ success: true, data: await updateCheckoutProviderSettings(body?.provider) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to save checkout provider." }, { status: 400 });
  }
}
