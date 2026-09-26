import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { DELIVERY_ZIP_SETTING_KEY, getDeliveryZipSettings } from "@/lib/delivery-zip-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminPermission("delivery-zips","view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ success: true, settings: await getDeliveryZipSettings() });
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdminPermission("delivery-zips","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as { enabled?: unknown; zipCodes?: unknown } | null;
  if (typeof body?.enabled !== "boolean" || !Array.isArray(body.zipCodes) || body.zipCodes.some(zip => typeof zip !== "string" || !/^[1-9]\d{5}$/.test(zip))) {
    return NextResponse.json({ success: false, message: "Enter valid 6-digit Indian PIN codes." }, { status: 400 });
  }
  const zipCodes = [...new Set(body.zipCodes as string[])].sort();
  if (body.enabled && zipCodes.length === 0) return NextResponse.json({ success: false, message: "Add at least one PIN code before restricting delivery." }, { status: 400 });
  if (zipCodes.length > 5000) return NextResponse.json({ success: false, message: "You can manage up to 5,000 PIN codes." }, { status: 400 });
  const settings = { enabled: body.enabled, zipCodes };
  await prisma.storeSetting.upsert({ where: { key: DELIVERY_ZIP_SETTING_KEY }, update: { value: settings as Prisma.InputJsonValue }, create: { key: DELIVERY_ZIP_SETTING_KEY, value: settings as Prisma.InputJsonValue } });
  return NextResponse.json({ success: true, settings });
}
