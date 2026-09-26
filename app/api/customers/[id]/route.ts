import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: NextRequest, {
 params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminPermission("customers","view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });

  const { id } = await params;
  const customer = await prisma.user.findUnique({ where: { id: Number(id) }, include: { orders: { include: { items: true }, orderBy: { createdAt: "desc" } }, addresses: { orderBy: { isDefault: "desc" } } } });
  if (!customer) return NextResponse.json({ success: false, message: "Customer not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: customer });
}

export async function PATCH(request: NextRequest, {
 params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminPermission("customers","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });

  const { id } = await params;
  const { name, email, mobile, status } = await request.json();
  const customer = await prisma.user.update({ where: { id: Number(id) }, data: { ...(typeof name === "string" ? { name: name.trim() } : {}), ...(typeof email === "string" ? { email: email.trim().toLowerCase() } : {}), ...(typeof mobile === "string" ? { mobile: mobile.replace(/\D/g, "") || null } : {}), ...(status ? { status: status === "Inactive" ? "inactive" : "active" } : {}) } });
  return NextResponse.json({ success: true, data: customer });
}
