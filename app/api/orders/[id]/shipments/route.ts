import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { fulfillmentStatus } from "@/lib/fulfillment";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminPermission("orders","update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const orderId = Number((await params).id);
  const body = await request.json().catch(() => null);
  const itemIds = Array.isArray(body?.itemIds) ? [...new Set<number>(body.itemIds)] : [];
  const carrier = typeof body?.carrier === "string" ? body.carrier.trim() : "";
  const trackingNumber = typeof body?.trackingNumber === "string" ? body.trackingNumber.trim() : "";
  if (!Number.isInteger(orderId) || !itemIds.length || itemIds.some(id => !Number.isInteger(id)) || !carrier || carrier.length > 100 || !trackingNumber || trackingNumber.length > 150) return NextResponse.json({ message: "Select items and enter a carrier and tracking number." }, { status: 400 });
  try {
    await prisma.$transaction(async tx => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order || !["confirmed", "processing", "shipped", "partially_delivered", "delivered"].includes(order.status) || ["failed", "refunded"].includes(order.paymentStatus)) throw new Error("Confirm the order before creating a shipment.");
      if (itemIds.some(id => !order.items.some(item => item.id === id && item.shipmentId === null))) throw new Error("Some items have already been assigned to a shipment.");
      const shipment = await tx.shipment.create({ data: { orderId, carrier, trackingNumber } });
      const assigned = await tx.orderItem.updateMany({ where: { orderId, id: { in: itemIds }, shipmentId: null }, data: { shipmentId: shipment.id } });
      if (assigned.count !== itemIds.length) throw new Error("Shipment conflict. Refresh and try again.");
      const items = await tx.orderItem.findMany({ where: { orderId }, include: { shipment: true } });
      await tx.order.update({ where: { id: orderId }, data: { status: fulfillmentStatus(items) } });
    }, { isolationLevel: "Serializable" });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ message: "Cannot create shipment. Check order status and unassigned items, then retry." }, { status: 409 }); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminPermission("orders","update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const orderId = Number((await params).id);
  const body = await request.json().catch(() => null);
  const deliveredAt = body?.deliveredAt ? new Date(body.deliveredAt) : new Date();
  if (!Number.isInteger(orderId) || !Number.isInteger(body?.shipmentId) || !Number.isFinite(deliveredAt.getTime()) || deliveredAt > new Date()) return NextResponse.json({ message: "Invalid shipment or delivery date." }, { status: 400 });
  try {
    await prisma.$transaction(async tx => {
      const shipment = await tx.shipment.findFirst({ where: { id: body.shipmentId, orderId }, include: { order: true } });
      if (!shipment || shipment.order.status === "cancelled" || ["failed", "refunded"].includes(shipment.order.paymentStatus)) throw new Error("Unavailable shipment");
      if (shipment.deliveredAt) return; // Never restart the return window on a repeated click.
      if (deliveredAt < shipment.order.createdAt) throw new Error("Delivery predates order");
      await tx.shipment.update({ where: { id: shipment.id }, data: { status: "delivered", deliveredAt } });
      const items = await tx.orderItem.findMany({ where: { orderId }, include: { shipment: true } });
      await tx.order.update({ where: { id: orderId }, data: { status: fulfillmentStatus(items) } });
    }, { isolationLevel: "Serializable" });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ message: "Cannot mark this shipment delivered. Refresh and check the delivery date." }, { status: 409 }); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminPermission("orders","update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const orderId = Number((await params).id);
  const body = await request.json().catch(() => null);
  const carrier = typeof body?.carrier === "string" ? body.carrier.trim() : "";
  const trackingNumber = typeof body?.trackingNumber === "string" ? body.trackingNumber.trim() : "";
  if (!Number.isInteger(orderId) || !Number.isInteger(body?.shipmentId) || !carrier || carrier.length > 100 || !trackingNumber || trackingNumber.length > 150) return NextResponse.json({ message: "Enter a valid courier and tracking number." }, { status: 400 });
  const updated = await prisma.shipment.updateMany({ where: { id: body.shipmentId, orderId, order: { status: { not: "cancelled" } } }, data: { carrier, trackingNumber } });
  if (!updated.count) return NextResponse.json({ message: "Shipment not found or order cancelled." }, { status: 404 });
  return NextResponse.json({ success: true });
}
