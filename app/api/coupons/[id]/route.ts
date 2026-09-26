import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";
import { couponInput } from "@/lib/coupon-input";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: NextRequest, { params }: Context) {
  if (!(await requireAdminPermission("coupons","view"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ message: "Invalid coupon." }, { status: 400 });
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return NextResponse.json({ message: "Coupon not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: coupon });
}
export async function PATCH(request: NextRequest, { params }: Context) {
  if (!(await requireAdminPermission("coupons","update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ message: "Invalid coupon." }, { status: 400 });
  try {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ message: "Coupon not found." }, { status: 404 });
    const data = couponInput(await request.json());
    if (data.rules.productIds.length && await prisma.product.count({ where: { id: { in: data.rules.productIds } } }) !== data.rules.productIds.length) return NextResponse.json({ message: "Some selected products no longer exist. Refresh and select products again." }, { status: 400 });
    if (existing.usageCount && data.code !== existing.code) return NextResponse.json({ message: "A used coupon cannot be renamed. Create a new code instead." }, { status: 400 });
    const coupon = await prisma.coupon.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    const duplicate = error && typeof error === "object" && "code" in error && error.code === "P2002";
    return NextResponse.json({ message: duplicate ? "This coupon code already exists." : error instanceof Error && !("code" in error) ? error.message : "Unable to save coupon." }, { status: 400 });
  }
}
export async function DELETE(_: NextRequest, { params }: Context) {
  if (!(await requireAdminPermission("coupons","delete"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ message: "Invalid coupon." }, { status: 400 });
  await prisma.coupon.deleteMany({ where: { id } });
  return NextResponse.json({ success: true });
}
