import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import { getIntegrationStatus, updateIntegrationCredentials } from "@/lib/payment-messaging-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminPermission("settings", "view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ success: true, data: await getIntegrationStatus() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await requireAdminPermission("settings", "update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, data: await updateIntegrationCredentials(body) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to save integration settings." }, { status: 400 });
  }
}
