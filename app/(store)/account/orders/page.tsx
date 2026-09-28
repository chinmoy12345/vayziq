import Link from "next/link";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";


const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function OrdersPage() {
  const session = await getCurrentUser();
  const userId = Number(session?.sub);
  const orders = Number.isInteger(userId) ? await prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { items: { select: { quantity: true } } } }) : [];
  return <main><div className="mb-6"><p className="text-sm text-gray-500">My Account</p><h1 className="mt-1 text-2xl font-semibold text-gray-900">My Orders</h1><p className="mt-1 text-sm text-gray-500">Track and manage your purchases.</p></div>
    {orders.length ? <div className="space-y-4">{orders.map((order) => { const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0); return <div key={order.id} className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_6px_22px_rgba(0,0,0,.03)]"><div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff1c8]"><Package className="h-5 w-5 text-[#b77e00]" /></div><div><p className="text-sm font-semibold text-gray-900">Order #{order.orderNumber}</p><p className="mt-1 text-xs text-gray-500">Placed on {date.format(order.createdAt)}</p></div></div><span className="w-fit rounded-full bg-[#fff1c8] px-3 py-1 text-xs font-medium capitalize text-[#8a5b00]">{order.status.replaceAll("_", " ")}</span></div><div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-gray-600">{itemCount} {itemCount === 1 ? "item" : "items"} · <strong className="text-gray-900">{money.format(Number(order.total))}</strong></p><Link className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#fbb606] hover:text-[#111]" href={`/account/orders/${order.orderNumber}`}>View Details <ChevronRight className="h-4 w-4" /></Link></div></div>; })}</div> : <EmptyOrders />}
  </main>;
}

function EmptyOrders() { return <div className="rounded-2xl border border-[#e8e8e8] bg-white px-6 py-16 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff1c8]"><ShoppingBag className="h-6 w-6 text-[#b77e00]" /></div><h2 className="mt-4 text-lg font-semibold text-gray-900">No orders yet</h2><p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">Your placed orders will appear here.</p><Link href="/shop" className="mt-6 inline-flex rounded-xl bg-[#fbb606] px-5 py-2.5 text-sm font-bold text-[#111] hover:bg-[#e8a900]">Start Shopping</Link></div>; }
