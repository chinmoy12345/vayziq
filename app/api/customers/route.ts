import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminPermission("customers","view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });

  const customers = await prisma.user.findMany({ where: { roles: { none: {} } }, include: { orders: { orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: customers });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdminPermission("customers","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });

  const { id, status } = await request.json();
  const customer = await prisma.user.update({ where: { id: Number(id) }, data: { status: status === "Inactive" ? "inactive" : "active" } });
  return NextResponse.json({ success: true, data: customer });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminPermission("customers","create"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });

  const { name, email, mobile, password, status } = await request.json();
  const cleanName = String(name ?? "").trim();
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const cleanMobile = String(mobile ?? "").replace(/\D/g, "");
  if (!cleanName || !cleanEmail) return NextResponse.json({ success: false, message: "Name and email are required." }, { status: 400 });
  try {
    const customer = await prisma.user.create({ data: { name: cleanName, email: cleanEmail, mobile: cleanMobile || null, passwordHash: await bcrypt.hash(String(password || "Customer@123"), 12), status: status === "Inactive" ? "inactive" : "active" } });
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    return NextResponse.json({ success: false, message: code === "P2002" ? "A customer with these details already exists." : "Unable to add customer." }, { status: code === "P2002" ? 409 : 500 });
  }
}
