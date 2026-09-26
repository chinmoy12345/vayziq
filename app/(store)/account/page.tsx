import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import Link from "next/link";
import { ChevronRight, Heart, MapPin, Package, ShoppingBag, User } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function AccountPage() {
  const session = await getCurrentUser();
  const userId = Number(session?.sub);
  const [user, orders] = await Promise.all([
    Number.isInteger(userId) ? prisma.user.findUnique({ where: { id: userId }, select: { name: true } }) : null,
    Number.isInteger(userId)
      ? prisma.order.findMany({
          where: { userId }, orderBy: { createdAt: "desc" }, take: 5,
          include: { items: { select: { quantity: true } } },
        })
      : [],
  ]);
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  return <main>
    <div className="mb-8">
      <p className="text-sm text-gray-500">My Account</p>
      <h1 className="mt-1 text-2xl font-semibold text-gray-900">Welcome back, {firstName}</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your orders, profile and preferences.</p>
    </div>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <AccountCard href="/account/orders" icon={<ShoppingBag className="h-5 w-5" />} title="My Orders" description="View your orders" />
      <AccountCard href="/account/wishlist" icon={<Heart className="h-5 w-5" />} title="Wishlist" description="Saved products" />
      <AccountCard href="/account/profile" icon={<User className="h-5 w-5" />} title="My Profile" description="Personal information" />
      <AccountCard href="/account/addresses" icon={<MapPin className="h-5 w-5" />} title="Addresses" description="Manage addresses" />
    </div>

    <section className="mt-10 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div><h2 className="font-semibold text-gray-900">Recent Orders</h2><p className="mt-1 text-xs text-gray-500">Your latest purchases</p></div>
        {orders.length > 0 && <Link href="/account/orders" className="flex items-center gap-1 text-sm font-medium text-[#9b5c5c] hover:underline">View all <ChevronRight className="h-4 w-4" /></Link>}
      </div>
      {orders.length ? <div className="divide-y divide-gray-100">{orders.map((order) => <OrderRow key={order.id} orderNumber={order.orderNumber} date={dateFormat.format(order.createdAt)} amount={currency.format(Number(order.total))} itemCount={order.items.reduce((count, item) => count + item.quantity, 0)} status={order.status} />)}</div> : <div className="px-6 py-12 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#b56f6f]/10"><Package className="h-5 w-5 text-[#9b5c5c]" /></div><h3 className="mt-4 font-semibold text-gray-900">No orders yet</h3><p className="mt-1 text-sm text-gray-500">Your purchases will appear here after checkout.</p><Link className="mt-5 inline-flex rounded-xl bg-[#9b5c5c] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#874e4e]" href="/shop">Start Shopping</Link></div>}
    </section>
  </main>;
}

function AccountCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return <Link href={href} className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#c98a8a] hover:shadow-sm"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#b56f6f]/10 text-[#9b5c5c]">{icon}</div><h2 className="mt-4 text-sm font-semibold text-gray-900">{title}</h2><p className="mt-1 text-xs text-gray-500">{description}</p><span className="mt-3 flex items-center text-xs font-medium text-[#9b5c5c]">Open <ChevronRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span></Link>;
}

function OrderRow({ orderNumber, date, amount, itemCount, status }: { orderNumber: string; date: string; amount: string; itemCount: number; status: string }) {

  return <Link href={`/account/orders/${orderNumber}`} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-gray-50"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100"><Package className="h-5 w-5 text-gray-500" /></div><div><p className="break-all text-sm font-medium text-gray-900">#{orderNumber}</p><p className="mt-1 text-xs text-gray-500">{date} · {itemCount} {itemCount === 1 ? "item" : "items"}</p></div></div><div className="text-right"><p className="text-sm font-semibold text-gray-900">{amount}</p><div className="mt-2"><OrderStatusBadge status={status} /></div></div></Link>;
}
