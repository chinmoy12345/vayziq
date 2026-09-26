import ItemTracking from "./ItemTracking";
import Link from "next/link";
import { Package, RotateCcw, RefreshCw } from "lucide-react";
import { canRequestService, serviceDeadline, type ItemPolicy } from "@/lib/fulfillment";
import { canReviewOrder } from "@/lib/review-eligibility";
import RequestService from "./RequestService";

type Item = ItemPolicy & { id: number; shipment: { status: string; shippedAt: Date; carrier: string; trackingNumber: string; deliveredAt: Date | null } | null; serviceRequest: { kind: string; status: string; adminNote: string | null } | null; product: { slug: string; status: string; category: { status: string } } };
export default function OrderItemService({ item, order }: { item: Item; order: { status: string; paymentStatus: string; createdAt: Date } }) {
  const delivery = item.shipment?.deliveredAt;
  const available = order.status !== "cancelled" && !["failed", "refunded"].includes(order.paymentStatus);
  const now = new Date();
  const statusClass = order.status === "cancelled" ? "bg-red-50 text-red-700" : delivery ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800";
  return <div className="mt-4 w-full min-w-0 space-y-4 text-xs text-gray-500">
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
      <span className={"inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold " + statusClass}><Package className="h-4 w-4" />{order.status === "cancelled" ? "Cancelled" : delivery ? "Delivered" : item.shipment ? "On the way" : order.status === "delivered" ? "Delivery details pending" : order.status === "pending" ? "Awaiting confirmation" : "Preparing for dispatch"}</span>
      <ItemTracking orderStatus={order.status} placedAt={order.createdAt} shipment={item.shipment} />
      {item.shipment ? <dl className="mt-3 grid gap-3 sm:grid-cols-2"><div><dt>Courier</dt><dd className="mt-1 break-words font-medium text-gray-800">{item.shipment.carrier}</dd></div><div><dt>Tracking number</dt><dd className="mt-1 break-all font-medium text-gray-800">{item.shipment.trackingNumber}</dd></div></dl> : <p className="mt-3 leading-5">{order.status === "cancelled" ? "This order has been cancelled." : "Tracking details will appear once this item is dispatched."}</p>}
      {delivery && <p className="mt-3">Delivered on {delivery.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</p>}
    </div>
    <div className="grid gap-3 sm:grid-cols-2">{(["return", "replacement"] as const).map(kind => {
      const enabled = kind === "return" ? item.returnEnabled : item.replacementEnabled;
      const days = kind === "return" ? item.returnDays : item.replacementDays;
      const deadline = delivery ? serviceDeadline(delivery, days) : null;
      const Icon = kind === "return" ? RotateCcw : RefreshCw;
      return <div key={kind} className="flex items-start gap-3 rounded-xl border border-[#E8DADA] bg-[#FFFDFC] p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F8EFEC] text-[#9b5c5c]"><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="text-sm font-semibold capitalize text-gray-800">{kind}</p><p className="mt-1 leading-5">{!enabled ? "Not available for this product" : !available ? "Unavailable for this order" : deadline ? now > deadline ? "Request window closed" : "Available until " + deadline.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) + " IST" : "Within " + days + " days after delivery"}</p>{enabled && !delivery && available && <p className="mt-1 text-[11px] leading-4 text-gray-400">The window starts when this item is delivered.</p>}</div></div>;
    })}</div>
    {item.shipment?.status === "delivered" && delivery && order.status !== "cancelled" && <a href={"/api/account/order-items/" + item.id + "/invoice"} download className="inline-flex min-h-11 items-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">Download invoice</a>}
    {canReviewOrder(order, item.shipment) && item.product.status === "active" && item.product.category.status === "active" && <Link href={"/product/" + item.product.slug + "#write-review"} className="inline-flex min-h-11 items-center rounded-xl border border-[#E8DADA] bg-[#F8EFEC] px-4 text-sm font-semibold text-[#9b5c5c]">Write a review</Link>}
    {item.serviceRequest ? <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><p className="text-sm font-medium capitalize text-gray-800">{item.serviceRequest.kind}: {item.serviceRequest.status}</p>{item.serviceRequest.adminNote && <p className="mt-2 whitespace-pre-line leading-5">{item.serviceRequest.adminNote}</p>}</div> : available && <RequestService itemId={item.id} returns={canRequestService(item, "return", now)} replacements={canRequestService(item, "replacement", now)} />}
  </div>;
}
