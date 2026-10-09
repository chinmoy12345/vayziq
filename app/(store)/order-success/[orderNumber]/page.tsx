import Link from "next/link";
import { Check, PackageCheck, Truck } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import Breadcrumbs from "@/components/store/Breadcrumbs";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import CashfreeCartCleanup from "@/components/store/CashfreeCartCleanup";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default async function OrderSuccessPage({ params, searchParams }: { params: Promise<{ orderNumber: string }>; searchParams: Promise<{ cashfree?: string }> }) {
  const { orderNumber } = await params;
  const { cashfree } = await searchParams;
  const user = await getCurrentUser();
  const userId = Number(user?.sub);
  if (!Number.isInteger(userId) || userId < 1) redirect("/login");

  const order = await prisma.order.findFirst({
    where: { userId, orderNumber },
    select: { orderNumber: true, razorpayOrderId: true, cashfreeOrderId: true, paymentStatus: true, total: true, _count: { select: { inventoryMovements: true } }, items: { select: { id: true, productName: true, quantity: true } } },
  });
  if (!order) notFound();
  // COD has inventory movements on creation; online gateways receive them only after verification.
  // An abandoned online order must never appear as a confirmed purchase.
  if (order.paymentStatus !== "paid" && (order.razorpayOrderId || order.cashfreeOrderId || order._count.inventoryMovements === 0)) redirect(`/account/orders/${encodeURIComponent(orderNumber)}`);

  return (
    <main className="min-h-screen bg-white text-[#111]">
      {cashfree === "1" && order.cashfreeOrderId && order.paymentStatus === "paid" && <CashfreeCartCleanup />}
      <Breadcrumbs title="Order confirmed" isShop={false} parent={{ label: "Checkout", href: "/checkout" }} />
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
        <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_12px_40px_rgba(0,0,0,.06)]">
          <div className="border-b border-[#e8e8e8] bg-[#fffaf0] px-6 py-10 text-center sm:px-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbb606] text-[#111]"><Check className="h-8 w-8" strokeWidth={3} /></span>
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[.18em] text-[#8a5b00]">Thank you for shopping with Vayziq</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Order confirmed</h1>
            <p className="mt-3 text-sm text-[#666]">We have received your order. You can follow its progress in your account.</p>
          </div>
          <div className="space-y-6 px-6 py-7 sm:px-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-[#666]">Order number</p><p className="mt-1 break-all font-bold">{order.orderNumber}</p></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-[#666]">Order total</p><p className="mt-1 font-bold">{money.format(Number(order.total))}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#e8e8e8] bg-[#f7f7f7] p-4 text-sm"><Truck className="h-5 w-5 shrink-0" /><span>{order.paymentStatus === "paid" ? "Payment received. We are getting your order ready." : "Cash on Delivery selected. Pay when your order arrives."}</span></div>
            <div><h2 className="font-bold">Your items</h2><ul className="mt-3 divide-y divide-[#e8e8e8] border-y border-[#e8e8e8]">{order.items.map((item) => <li className="flex justify-between gap-4 py-3 text-sm" key={item.id}><span>{item.productName}</span><span className="shrink-0 text-[#666]">Qty {item.quantity}</span></li>)}</ul></div>
            <div className="flex flex-col gap-3 sm:flex-row"><Link href={`/account/orders/${encodeURIComponent(order.orderNumber)}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#111] px-5 text-sm font-bold text-white"><PackageCheck className="h-4 w-4" />View order</Link><Link href="/shop" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-[#d6d6d6] px-5 text-sm font-bold text-[#111]">Continue shopping</Link></div>
          </div>
        </div>
      </div>
    </main>
  );
}
