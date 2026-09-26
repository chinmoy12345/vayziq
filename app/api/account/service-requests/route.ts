import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { canRequestService } from "@/lib/fulfillment";

export async function POST(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ message: "Please sign in." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  if (!Number.isInteger(body?.orderItemId) || !["return", "replacement"].includes(body?.kind) || reason.length < 10 || reason.length > 1000) return NextResponse.json({ message: "Choose return or replacement and enter a reason (10–1,000 characters)." }, { status: 400 });
  try {
    await prisma.$transaction(async tx => {
      const item = await tx.orderItem.findFirst({ where: { id: body.orderItemId, order: { userId: Number(session.sub), user: { status: "active" }, status: { not: "cancelled" }, paymentStatus: { notIn: ["failed", "refunded"] } } }, include: { shipment: true, serviceRequest: true } });
      if (!item || item.serviceRequest || !canRequestService(item, body.kind)) throw new Error("Unavailable");
      await tx.serviceRequest.create({ data: { orderItemId: item.id, kind: body.kind, reason } });
    }, { isolationLevel: "Serializable" });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ message: "This request is unavailable, already submitted, or its delivery-based window has expired." }, { status: 409 }); }
}
