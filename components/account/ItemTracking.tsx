import { Check, Package, Truck, CircleCheck } from "lucide-react";

type Shipment = { status: string; shippedAt: Date; deliveredAt: Date | null } | null;
export function itemTrackingStep(orderStatus: string, shipment: Shipment) {
  if (orderStatus === "cancelled") return -1;
  if (shipment?.status === "delivered" && shipment.deliveredAt) return 3;
  if (shipment) return 2;
  return orderStatus === "pending" ? 0 : 1;
}
const formatDate = (date: Date) => date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default function ItemTracking({ orderStatus, placedAt, shipment }: { orderStatus: string; placedAt: Date; shipment: Shipment }) {
  const active = itemTrackingStep(orderStatus, shipment);
  const steps = [
    { title: "Order placed", date: placedAt, icon: Package },
    { title: "Confirmed", date: null, icon: Check },
    { title: "Shipped", date: shipment?.shippedAt, icon: Truck },
    { title: "Delivered", date: shipment?.deliveredAt, icon: CircleCheck },
  ];
  if (active < 0) return <p className="mt-4 text-xs text-red-700">Delivery tracking stopped because this order was cancelled.</p>;
  return <div className="mt-5 border-t border-gray-200 pt-4"><h4 className="mb-4 text-xs font-semibold text-gray-700">Track this item</h4>
    <ol aria-label="Item delivery progress" className="grid gap-0 sm:grid-cols-4">
      {steps.map((step, index) => {
        const done = index <= active;
        const Icon = step.icon;
        return <li key={step.title} aria-current={index === active ? "step" : undefined} className="relative flex min-h-16 gap-3 last:min-h-0 sm:block sm:min-h-0 sm:text-center">
          {index < steps.length - 1 && <span aria-hidden="true" className={"absolute left-[15px] top-8 h-[calc(100%-32px)] w-0.5 sm:left-[calc(50%+16px)] sm:top-[15px] sm:h-0.5 sm:w-[calc(100%-32px)] " + (index < active ? "bg-green-600" : "bg-gray-200")} />}
          <span className={"relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full sm:mx-auto " + (done ? "bg-green-600 text-white" : "bg-gray-200 text-gray-400")}><Icon aria-hidden="true" className="h-4 w-4" /></span>
          <div className="pb-4 sm:mt-2 sm:px-1 sm:pb-0"><p className={"text-xs leading-5 " + (done ? "font-semibold text-gray-800" : "text-gray-400")}>{step.title}<span className="sr-only">{index === active ? ", current step" : done ? ", completed" : ", pending"}</span></p>{step.date && done && <time dateTime={step.date.toISOString()} className="mt-0.5 block text-[10px] leading-4 text-gray-500">{formatDate(step.date)}</time>}</div>
        </li>;
      })}
    </ol>
  </div>;
}
