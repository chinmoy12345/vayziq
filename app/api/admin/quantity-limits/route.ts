import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { effectiveQuantityLimits, getGlobalQuantityLimits, QUANTITY_LIMITS_KEY, validQuantityLimits } from "@/lib/quantity-limits";

export async function GET() {
  if (!(await requireAdminPermission("settings", "view"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ data: await getGlobalQuantityLimits() });
}

export async function PUT(request: Request) {
  if (!(await requireAdminPermission("settings", "update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!validQuantityLimits(body?.min, body?.max)) return NextResponse.json({ message: "Enter whole-number limits between 1 and 1000; minimum cannot exceed maximum." }, { status: 400 });
  const data = { min: body.min as number, max: body.max as number };
  const overrides = await prisma.product.findMany({ where: { OR: [{ minOrderQuantity: { not: null } }, { maxOrderQuantity: { not: null } }] }, select: { name: true, minOrderQuantity: true, maxOrderQuantity: true } });
  const conflict = overrides.find(product => { const limits = effectiveQuantityLimits(product, data); return !validQuantityLimits(limits.min, limits.max); });
  if (conflict) return NextResponse.json({ message: `These defaults conflict with the quantity override for ${conflict.name}. Update that product first.` }, { status: 409 });
  await prisma.storeSetting.upsert({ where: { key: QUANTITY_LIMITS_KEY }, create: { key: QUANTITY_LIMITS_KEY, value: data }, update: { value: data } });
  return NextResponse.json({ data });
}
