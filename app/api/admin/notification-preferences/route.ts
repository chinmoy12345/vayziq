import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { ADMIN_NOTIFICATION_PREFERENCES_KEY, getAdminNotificationPreferences, parseAdminNotificationPreferences } from "@/lib/admin-notification-preferences";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdminPermission("settings", "view"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ data: await getAdminNotificationPreferences() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await requireAdminPermission("settings", "update"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  try {
    const data = parseAdminNotificationPreferences(await request.json());
    await prisma.storeSetting.upsert({ where: { key: ADMIN_NOTIFICATION_PREFERENCES_KEY }, create: { key: ADMIN_NOTIFICATION_PREFERENCES_KEY, value: data }, update: { value: data } });
    return NextResponse.json({ data });
  } catch (reason) { return NextResponse.json({ message: reason instanceof Error ? reason.message : "Unable to save notification preferences." }, { status: 400 }); }
}
