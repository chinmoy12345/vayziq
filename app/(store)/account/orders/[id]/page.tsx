import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import OrderItemService from "@/components/account/OrderItemService";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCurrentUser();
  const userId = Number(session?.sub);
  const order = Number.isInteger(userId) ? await prisma.order.findFirst({ where: { userId, orderNumber: id }, include: { items: { include: { shipment: true, serviceRequest: true, product: { select: { slug: true, status: true, category: { select: { status: true } } } } } }, address: true } }) : null;
  if (!order) notFound();
  return <main><Link href="/account/orders" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#9b5c5c]"><ArrowLeft className="h-4 w-4" />Back to Orders</Link><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-gray-500">Order Details</p><h1 className="mt-1 break-all text-xl font-semibold text-gray-900 sm:text-2xl">Order #{order.orderNumber}</h1></div><OrderStatusBadge status={order.status} /></div><div className="grid gap-6 lg:grid-cols-[1fr_320px]"><section className="min-w-0"><h2 className="mb-4 font-semibold text-gray-900">Items in this order</h2><div className="space-y-5">{order.items.map((item) => <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"><div className="min-w-0 w-full"><h3 className="text-sm font-medium text-gray-900">{item.productName}</h3><p className="mt-1 text-xs text-gray-500">SKU: {item.sku} · Quantity: {item.quantity}</p><OrderItemService item={item} order={order} /></div><p className="text-sm font-semibold text-gray-900">{money.format(Number(item.price) * item.quantity)}</p></div>)}</div></section><div className="space-y-6"><section className="rounded-2xl border border-gray-200 bg-white p-5"><h2 className="font-semibold text-gray-900">Order Summary</h2><div className="mt-4 space-y-3 text-sm text-gray-600"><p className="flex justify-between"><span>Subtotal</span><strong className="text-gray-900">{money.format(Number(order.subtotal))}</strong></p><p className="flex justify-between"><span>Shipping</span><strong className="text-gray-900">{Number(order.shipping) ? money.format(Number(order.shipping)) : "FREE"}</strong></p><p className="flex justify-between"><span>Discount</span><strong className="text-gray-900">{money.format(Number(order.discount))}</strong></p><p className="flex justify-between border-t pt-3 text-base"><strong className="text-gray-900">Total</strong><strong className="text-gray-900">{money.format(Number(order.total))}</strong></p></div></section>{order.address && <section className="rounded-2xl border border-gray-200 bg-white p-5"><div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-[#9b5c5c]" /><h2 className="font-semibold text-gray-900">Delivery Address</h2></div><p className="mt-4 text-sm leading-6 text-gray-600"><strong className="text-gray-900">{order.address.fullName}</strong><br />{order.address.line1}<br />{order.address.city}, {order.address.state} — {order.address.postalCode}<br />+91 {order.address.mobile}</p></section>}</div></div></main>;
}
