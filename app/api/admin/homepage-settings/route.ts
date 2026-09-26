import { NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { getHomepageVisibility, HOMEPAGE_VISIBILITY_DEFAULTS, type HomepageVisibility } from "@/lib/homepage-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminPermission("storefront","view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ success: true, data: await getHomepageVisibility() });
}

export async function PUT(request: Request) {
  if (!(await requireAdminPermission("storefront","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as { data?: unknown } | null;
  if (!body?.data || typeof body.data !== "object" || Array.isArray(body.data)) return NextResponse.json({ success: false, message: "Invalid homepage settings." }, { status: 400 });
  const data = body.data as Record<string, unknown>;
  const keys = Object.keys(HOMEPAGE_VISIBILITY_DEFAULTS);
  if (keys.some(key => typeof data[key] !== "boolean")) return NextResponse.json({ success: false, message: "Choose show or hide for every homepage setting." }, { status: 400 });
  const settings = Object.fromEntries(keys.map(key => [key, data[key]])) as HomepageVisibility;
  await prisma.storeSetting.upsert({ where: { key: "homepage_visibility" }, update: { value: settings as Prisma.InputJsonValue }, create: { key: "homepage_visibility", value: settings as Prisma.InputJsonValue } });
  return NextResponse.json({ success: true, data: settings });
}
