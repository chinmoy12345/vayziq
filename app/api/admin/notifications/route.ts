import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/db";
import { getAdminNotifications, type NotificationSource } from "@/lib/admin-notifications";
import { getAdminNotificationPreferences } from "@/lib/admin-notification-preferences";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function context() {
  const actor = await requireAdmin();
  const userId = Number(actor?.sub);
  if (!actor || !Number.isSafeInteger(userId) || userId < 1) return null;
  const roles = await prisma.userRole.findMany({ where: { userId }, select: { role: { select: { slug: true, permissions: { select: { permission: { select: { module: true, action: true } } } } } } } });
  const superAdmin = roles.some(row => row.role.slug === "super-admin");
  const grants = new Set(roles.flatMap(row => row.role.permissions.map(entry => `${entry.permission.module}.${entry.permission.action}`)));
  const preferences = await getAdminNotificationPreferences();
  const can = (source: NotificationSource) => superAdmin || grants.has(`${source}.view`);
  return { userId, grants: { orders: can("orders") && preferences.orders, reviews: can("reviews") && preferences.reviews, returns: can("returns"), inventory: can("inventory") } };
}

export async function GET() {
  const admin = await context();
  if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json(await getAdminNotifications(admin.userId, admin.grants), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Notifications are temporarily unavailable." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await context();
  if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as { key?: unknown; all?: unknown } | null;
  if (!body || (body.all !== true && typeof body.key !== "string")) return NextResponse.json({ message: "Choose a notification to mark as read." }, { status: 400 });
  try {
    const feed = await getAdminNotifications(admin.userId, admin.grants);
    const keys = body.all === true ? feed.notifications.map(item => item.key) : feed.notifications.filter(item => item.key === body.key).map(item => item.key);
    if (!keys.length && body.all !== true) return NextResponse.json({ message: "Notification not found." }, { status: 404 });
    if (keys.length) await prisma.adminNotificationRead.createMany({ data: keys.map(key => ({ userId: admin.userId, key })), skipDuplicates: true });
    return NextResponse.json(await getAdminNotifications(admin.userId, admin.grants));
  } catch {
    return NextResponse.json({ message: "Could not update notifications." }, { status: 500 });
  }
}
