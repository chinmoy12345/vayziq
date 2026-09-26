import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";
import { PATCH as updateOrder } from "./[id]/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await requireAdminPermission("orders","view"))) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  if (request.nextUrl.searchParams.get("summary") === "count") {
    const pendingCount = await prisma.order.count({ where: { status: "pending" } });
    return NextResponse.json({ success: true, count: pendingCount });
  }
  const orders = await prisma.order.findMany({ include: { user: true, items: true, address: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: orders });
}

export async function PATCH(request: NextRequest) {
  const { id } = await request.clone().json();
  if (!Number.isInteger(Number(id))) return NextResponse.json({ success: false, message: "A valid order is required." }, { status: 400 });
  return updateOrder(request, { params: Promise.resolve({ id: String(id) }) });
}
