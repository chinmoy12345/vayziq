import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";
import { couponInput } from "@/lib/coupon-input";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET() {
  if (!(await requireAdminPermission("coupons","view"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ success: true, data: await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }) });
}
export async function POST(request: NextRequest) {
  if (!(await requireAdminPermission("coupons","create"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const data = couponInput(await request.json());
    if (data.rules.productIds.length && await prisma.product.count({ where: { id: { in: data.rules.productIds } } }) !== data.rules.productIds.length) return NextResponse.json({ message: "Some selected products no longer exist. Refresh and select products again." }, { status: 400 });
    const coupon = await prisma.coupon.create({ data });
    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error) {
    const duplicate = error && typeof error === "object" && "code" in error && error.code === "P2002";
    return NextResponse.json({ message: duplicate ? "This coupon code already exists." : error instanceof Error && !("code" in error) ? error.message : "Unable to create coupon." }, { status: 400 });
  }
}
export async function PATCH(request: NextRequest) {
  if (!(await requireAdminPermission("coupons","update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!Number.isInteger(body?.id) || typeof body?.active !== "boolean") return NextResponse.json({ message: "Invalid coupon." }, { status: 400 });
  const result = await prisma.coupon.updateMany({ where: { id: body.id }, data: { active: body.active } });
  return NextResponse.json({ success: result.count === 1 }, { status: result.count ? 200 : 404 });
}
export async function DELETE(request: NextRequest) {
  if (!(await requireAdminPermission("coupons","delete"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!Number.isInteger(body?.id)) return NextResponse.json({ message: "Invalid coupon." }, { status: 400 });
  await prisma.coupon.deleteMany({ where: { id: body.id } });
  return NextResponse.json({ success: true });
}
