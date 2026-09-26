import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminPermission("orders","update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const orderId = Number((await params).id);
  const body = await request.json().catch(() => null);
  if (!Number.isInteger(body?.requestId) || !["approved", "rejected", "completed"].includes(body?.status) || (body.adminNote && (typeof body.adminNote !== "string" || body.adminNote.length > 1000))) return NextResponse.json({ message: "Invalid request update." }, { status: 400 });
  const from = body.status === "completed" ? "approved" : "requested";
  const result = await prisma.serviceRequest.updateMany({ where: { id: body.requestId, item: { orderId }, status: from }, data: { status: body.status, adminNote: body.adminNote || null } });
  return result.count ? NextResponse.json({ success: true }) : NextResponse.json({ message: "Request already handled or not found." }, { status: 409 });
}
