import { NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { getMenuSelectableCategories, getStoreMenuSettings, STORE_MENU_KEY } from "@/lib/store-menu-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminPermission("storefront","view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const [categories, settings] = await Promise.all([getMenuSelectableCategories(), getStoreMenuSettings()]);
  return NextResponse.json({ success: true, categories, settings });
}

export async function PUT(request: Request) {
  if (!(await requireAdminPermission("storefront","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as { enabled?: unknown; home?: unknown; watchBuy?: unknown; shop?: unknown; categoryIds?: unknown } | null;
  if (typeof body?.enabled !== "boolean" || typeof body.home !== "boolean" || typeof body.watchBuy !== "boolean" || typeof body.shop !== "boolean" || !Array.isArray(body.categoryIds) || body.categoryIds.some(id => typeof id !== "number" || !Number.isInteger(id) || id < 1)) {
    return NextResponse.json({ success: false, message: "Choose visibility for each menu link and select valid categories." }, { status: 400 });
  }
  const categories = await getMenuSelectableCategories();
  const validIds = new Set(categories.map(category => category.id));
  const categoryIds = [...new Set(body.categoryIds as number[])];
  if (categoryIds.some(id => !validIds.has(id))) return NextResponse.json({ success: false, message: "Only active parent categories can be added to the header menu." }, { status: 400 });
  const settings = { enabled: body.enabled, home: body.home, watchBuy: body.watchBuy, shop: body.shop, categoryIds };
  await prisma.storeSetting.upsert({ where: { key: STORE_MENU_KEY }, update: { value: settings as Prisma.InputJsonValue }, create: { key: STORE_MENU_KEY, value: settings as Prisma.InputJsonValue } });
  return NextResponse.json({ success: true, settings });
}
