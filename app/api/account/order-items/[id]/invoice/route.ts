import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { getStoreBranding } from "@/lib/store-branding";
import { allocatedAmount, createItemInvoice } from "@/lib/item-invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ message: "Please sign in." }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ message: "Invalid item." }, { status: 400 });
  const admin = await requireAdminPermission("orders", "view");
  const item = await prisma.orderItem.findFirst({ where: { id, ...(admin ? {} : { order: { userId: Number(session.sub), user: { status: "active" } } }) }, include: { shipment: true, order: { include: { address: true, user: { select: { name: true } }, items: { orderBy: { id: "asc" } } } } } });
  if (!item) return NextResponse.json({ message: "Item not found." }, { status: 404 });
  if (item.shipment?.status !== "delivered" || !item.shipment.deliveredAt || item.order.status === "cancelled") return NextResponse.json({ message: "Invoice is available after this item is delivered." }, { status: 403 });
  const order = item.order;
  const weights = order.items.map(line => Math.round(Number(line.price) * line.quantity * 100));
  const index = order.items.findIndex(line => line.id === item.id);
  const shipping = allocatedAmount(Number(order.shipping), weights, index);
  const discount = allocatedAmount(Number(order.discount), weights, index);
  const subtotal = weights[index] / 100;
  const address = order.address;
  const branding = await getStoreBranding();
  const number = "INV-" + order.id + "-" + item.id;
  const bytes = await createItemInvoice({ number, orderNumber: order.orderNumber, store: branding.name, customer: address?.fullName ?? order.user.name, address: address ? [address.line1, address.line2 ?? "", address.city + ", " + address.state + " " + address.postalCode] : [], orderedAt: order.createdAt, deliveredAt: item.shipment.deliveredAt, productName: item.productName, sku: item.sku, quantity: item.quantity, unitPrice: Number(item.price), subtotal, shipping, discount, total: Math.round((subtotal + shipping - discount) * 100) / 100, paymentStatus: order.paymentStatus, carrier: item.shipment.carrier, trackingNumber: item.shipment.trackingNumber });
  return new Response(new Uint8Array(bytes).buffer, { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="' + number + '.pdf"', "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
