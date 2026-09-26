import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { serviceDeadline } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await requireAdminPermission("returns","view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  if (request.nextUrl.searchParams.get("summary") === "count") {
    const count = await prisma.serviceRequest.count({ where: { status: "requested" } });
    return NextResponse.json({ success: true, count });
  }

  const requests = await prisma.serviceRequest.findMany({
    include: {
      item: {
        include: {
          shipment: true,
          order: { include: { user: { select: { name: true, email: true, mobile: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = requests.map((request) => {
    const item = request.item;
    const deliveredAt = item.shipment?.deliveredAt ?? null;
    const days = request.kind === "return" ? item.returnDays : item.replacementDays;
    return {
      id: request.id,
      kind: request.kind,
      status: request.status,
      reason: request.reason,
      adminNote: request.adminNote,
      createdAt: request.createdAt,
      deadline: deliveredAt ? serviceDeadline(deliveredAt, days) : null,
      item: {
        id: item.id,
        name: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        price: Number(item.price),
        deliveredAt,
        returnEnabled: item.returnEnabled,
        replacementEnabled: item.replacementEnabled,
        returnDays: item.returnDays,
        replacementDays: item.replacementDays,
        order: {
          id: item.order.id,
          number: item.order.orderNumber,
          createdAt: item.order.createdAt,
          customer: item.order.user,
        },
      },
    };
  });

  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdminPermission("returns","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  const status = body?.status;
  const adminNote = body?.adminNote;
  if (!Number.isInteger(id) || id < 1 || !["approved", "rejected", "completed"].includes(status)
    || (adminNote !== undefined && (typeof adminNote !== "string" || adminNote.trim().length > 1000))) {
    return NextResponse.json({ success: false, message: "Invalid service request update." }, { status: 400 });
  }

  const from = status === "completed" ? "approved" : "requested";
  const result = await prisma.serviceRequest.updateMany({
    where: { id, status: from },
    data: {
      status,
      ...(adminNote !== undefined ? { adminNote: adminNote.trim() || null } : {}),
    },
  });
  if (!result.count) return NextResponse.json({ success: false, message: "This request was already handled or could not be found." }, { status: 409 });
  return NextResponse.json({ success: true });
}
