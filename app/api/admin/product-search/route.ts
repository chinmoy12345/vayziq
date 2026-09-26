import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";
export async function GET(request: NextRequest) {
  if (!(await requireAdminPermission("products","view"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0,100) || "";
  const products = await prisma.product.findMany({ where: { status: "active", category: { status: "active" }, ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}) }, select: { id: true, name: true, slug: true, sku: true }, take: 20, orderBy: { name: "asc" } });
  return NextResponse.json({ products });
}
