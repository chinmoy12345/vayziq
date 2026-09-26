import type { OrderStatus } from "@/lib/generated/prisma-suppliers";

const labels: Record<OrderStatus, string> = {
  pending: "Pending", confirmed: "Confirmed", processing: "Processing",
  shipped: "Shipped", partially_delivered: "Partially Delivered",
  delivered: "Delivered", cancelled: "Cancelled",
};
export function orderStatusLabel(status: string) {
  return labels[status as OrderStatus] ?? status.replaceAll("_", " ");
}
export default function OrderStatusBadge({ status }: { status: string }) {
  const color = status === "delivered" ? "bg-green-50 text-green-700 border-green-200" : status === "partially_delivered" ? "bg-teal-50 text-teal-700 border-teal-200" : status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-800 border-amber-200";
  return <span className={"inline-flex rounded-full border px-2.5 py-1 text-center text-[11px] font-semibold leading-4 " + color}>{orderStatusLabel(status)}</span>;
}
