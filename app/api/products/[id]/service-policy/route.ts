import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { policySnapshot } from "@/lib/fulfillment";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminPermission("products","view"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const product = await prisma.product.findUnique({ where: { id: Number((await params).id) } });
  return product ? NextResponse.json(policySnapshot(product)) : NextResponse.json({ message: "Product not found" }, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminPermission("products","update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.returnEnabled !== "boolean" || typeof body.replacementEnabled !== "boolean" || ![body.returnDays, body.replacementDays].every(days => Number.isInteger(days) && days >= 1 && days <= 365)) return NextResponse.json({ message: "Enter a window between 1 and 365 days." }, { status: 400 });
  await prisma.product.update({ where: { id: Number((await params).id) }, data: policySnapshot(body) });
  return NextResponse.json({ success: true });
}
