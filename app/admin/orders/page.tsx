"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Partially delivered"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

interface Order {
  id: number;
  orderNo: string;
  customer: string;
  email: string;
  mobile: string;
  date: string;
  items: number;
  total: number;
  payment: PaymentStatus;
  status: OrderStatus;
}

const initialOrders: Order[] = [
  {
    id: 257,
    orderNo: "#ORD-00257",
    customer: "Susmita Ghosh",
    email: "susmita@example.com",
    mobile: "9876543210",
    date: "11 Sep 2026, 10:42 AM",
    items: 2,
    total: 2498,
    payment: "Paid",
    status: "Processing",
  },
  {
    id: 256,
    orderNo: "#ORD-00256",
    customer: "Ananya Das",
    email: "ananya@example.com",
    mobile: "9830012345",
    date: "11 Sep 2026, 09:18 AM",
    items: 1,
    total: 1499,
    payment: "Paid",
    status: "Pending",
  },
  {
    id: 255,
    orderNo: "#ORD-00255",
    customer: "Riya Sen",
    email: "riya@example.com",
    mobile: "9007123456",
    date: "10 Sep 2026, 06:34 PM",
    items: 3,
    total: 3297,
    payment: "Paid",
    status: "Shipped",
  },
  {
    id: 254,
    orderNo: "#ORD-00254",
    customer: "Moumita Roy",
    email: "moumita@example.com",
    mobile: "8910123456",
    date: "10 Sep 2026, 02:21 PM",
    items: 1,
    total: 899,
    payment: "Pending",
    status: "Pending",
  },
  {
    id: 253,
    orderNo: "#ORD-00253",
    customer: "Priya Mukherjee",
    email: "priya@example.com",
    mobile: "9831012345",
    date: "09 Sep 2026, 11:15 AM",
    items: 2,
    total: 1898,
    payment: "Paid",
    status: "Delivered",
  },
  {
    id: 252,
    orderNo: "#ORD-00252",
    customer: "Tania Paul",
    email: "tania@example.com",
    mobile: "9874012345",
    date: "09 Sep 2026, 09:45 AM",
    items: 1,
    total: 699,
    payment: "Failed",
    status: "Cancelled",
  },
  {
    id: 251,
    orderNo: "#ORD-00251",
    customer: "Sreya Chatterjee",
    email: "sreya@example.com",
    mobile: "9007012345",
    date: "08 Sep 2026, 04:20 PM",
    items: 2,
    total: 2398,
    payment: "Paid",
    status: "Delivered",
  },
];

// Orders are loaded exclusively from the database.
initialOrders.length = 0;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  useEffect(() => {
    fetch("/api/orders").then((response) => response.json()).then((payload) => {
      if (!payload.success) return;
      setOrders(payload.data.map((order: any) => ({ id: order.id, orderNo: `#${order.orderNumber}`, customer: order.user.name, email: order.user.email, mobile: order.user.mobile ?? "—", date: new Date(order.createdAt).toLocaleString("en-IN"), items: order.items.length, total: Number(order.total), payment: `${order.paymentStatus.charAt(0).toUpperCase()}${order.paymentStatus.slice(1)}`, status: `${order.status.charAt(0).toUpperCase()}${order.status.slice(1).replaceAll("_", " ")}` })));
    }).catch(() => undefined);
  }, []);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [payment, setPayment] = useState("All");

  const filteredOrders = useMemo(() => {
    const value = search.toLowerCase().trim();

    return orders.filter((order) => {
      const searchMatch =
        !value ||
        order.orderNo.toLowerCase().includes(value) ||
        order.customer.toLowerCase().includes(value) ||
        order.email.toLowerCase().includes(value) ||
        order.mobile.includes(value);

      const statusMatch =
        status === "All" || order.status === status;

      const paymentMatch =
        payment === "All" || order.payment === payment;

      return searchMatch && statusMatch && paymentMatch;
    });
  }, [orders, search, status, payment]);

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const processingOrders = orders.filter(
    (order) => order.status === "Processing"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-full">

      {/* Page Header */}
      <div className="border-b border-[#eee6e1] bg-white">
        <div className="px-4 py-5 lg:px-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#b56f6f]">
                Sales
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">
                Orders
              </h1>

              <p className="mt-1 text-sm text-[#8f8580]">
                Manage customer orders and order status.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-5">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <SummaryCard
            title="Total Orders"
            value={orders.length.toString()}
            subtitle="All orders"
          />

          <SummaryCard
            title="Pending"
            value={pendingOrders.toString()}
            subtitle="Awaiting action"
          />

          <SummaryCard
            title="Processing"
            value={processingOrders.toString()}
            subtitle="Being prepared"
          />

          <SummaryCard
            title="Delivered"
            value={completedOrders.toString()}
            subtitle="Successfully delivered"
          />

          <SummaryCard
            title="Cancelled"
            value={cancelledOrders.toString()}
            subtitle="Cancelled orders"
          />

        </div>

        {/* Orders Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-[#eee6e1] bg-white">

          {/* Filters */}
          <div className="border-b border-[#eee6e1] p-4">

            <div className="flex flex-col gap-3 xl:flex-row">

              {/* Search */}
              <div className="relative flex-1">

                <SearchIcon />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search order no, customer, email or mobile..."
                  className="h-11 w-full rounded-lg border border-[#e5ddd8] bg-[#faf8f6] pl-10 pr-4 text-sm text-[#292321] outline-none placeholder:text-[#aaa09a] focus:border-[#b56f6f] focus:bg-white"
                />

              </div>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 rounded-lg border border-[#e5ddd8] bg-[#faf8f6] px-4 text-sm text-[#514945] outline-none focus:border-[#b56f6f]"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option><option value="Partially delivered">Partially delivered</option><option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Payment */}
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="h-11 rounded-lg border border-[#e5ddd8] bg-[#faf8f6] px-4 text-sm text-[#514945] outline-none focus:border-[#b56f6f]"
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option><option value="Refunded">Refunded</option>
              </select>

            </div>

          </div>

          {/* Result */}
          <div className="flex items-center justify-between border-b border-[#eee6e1] px-4 py-3">

            <p className="text-xs text-[#958b86]">
              Showing{" "}
              <span className="font-medium text-[#514945]">
                {filteredOrders.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[#514945]">
                {orders.length}
              </span>{" "}
              orders
            </p>

          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">

            <table className="w-full min-w-[1050px]">

              <thead>
                <tr className="border-b border-[#eee6e1] bg-[#fcfaf9]">

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                    Order
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                    Customer
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                    Items
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                    Total
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                    Payment
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#958b86]">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-[#f0e9e5]">

                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-[#fcfaf9]"
                  >

                    {/* Order */}
                    <td className="px-5 py-4">

                      <p className="text-sm font-semibold text-[#292321]">
                        {order.orderNo}
                      </p>

                      <p className="mt-1 text-xs text-[#a09792]">
                        ID: {order.id}
                      </p>

                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4">

                      <p className="text-sm font-medium text-[#514945]">
                        {order.customer}
                      </p>

                      <p className="mt-1 text-xs text-[#a09792]">
                        {order.mobile}
                      </p>

                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-[#6f6661]">
                        {order.date}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-4">
                      <span className="text-sm text-[#514945]">
                        {order.items}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-[#292321]">
                        {formatPrice(order.total)}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-4">
                      <PaymentBadge status={order.payment} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 text-right">

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e5ddd8] px-3 text-xs font-medium text-[#514945] transition hover:border-[#b56f6f] hover:text-[#b56f6f]"
                      >
                        View
                        <ArrowRightIcon />
                      </Link>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* Mobile */}
          <div className="divide-y divide-[#eee6e1] md:hidden">

            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <p className="text-sm font-semibold text-[#292321]">
                      {order.orderNo}
                    </p>

                    <p className="mt-1 text-xs text-[#958b86]">
                      {order.date}
                    </p>
                  </div>

                  <OrderStatusBadge status={order.status} />

                </div>

                <div className="mt-4">

                  <p className="text-sm font-medium text-[#514945]">
                    {order.customer}
                  </p>

                  <p className="mt-1 text-xs text-[#958b86]">
                    {order.mobile}
                  </p>

                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">

                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[#aaa09a]">
                      Items
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#514945]">
                      {order.items}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[#aaa09a]">
                      Total
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#292321]">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[#aaa09a]">
                      Payment
                    </p>

                    <div className="mt-1">
                      <PaymentBadge status={order.payment} />
                    </div>
                  </div>

                </div>

                <Link
                  href={`/admin/orders/${order.id}`}
                  className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#e5ddd8] text-xs font-medium text-[#514945] hover:border-[#b56f6f] hover:text-[#b56f6f]"
                >
                  View Order
                  <ArrowRightIcon />
                </Link>

              </div>
            ))}

          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="px-5 py-16 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
                <SearchIcon size={20} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#292321]">
                No orders found
              </h3>

              <p className="mt-1 text-sm text-[#958b86]">
                Try changing your search or filters.
              </p>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* --------------------------------
   Summary Card
-------------------------------- */

function SummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl border border-[#eee6e1] bg-white p-5">

      <p className="text-xs font-medium text-[#958b86]">
        {title}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#292321]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#aaa09a]">
        {subtitle}
      </p>

    </div>
  );
}

/* --------------------------------
   Order Status
-------------------------------- */

function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const styles: Record<OrderStatus, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-100",
    "Partially delivered": "bg-teal-50 text-teal-700 border-teal-100",
    Processing: "bg-blue-50 text-blue-700 border-blue-100",
    Shipped: "bg-purple-50 text-purple-700 border-purple-100",
    Delivered: "bg-green-50 text-green-700 border-green-100",
    Cancelled: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* --------------------------------
   Payment Status
-------------------------------- */

function PaymentBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const styles: Record<PaymentStatus, string> = {
    Paid: "bg-green-50 text-green-700 border-green-100",
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    Refunded: "bg-gray-50 text-gray-700 border-gray-100",
    Failed: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* --------------------------------
   Icons
-------------------------------- */

function SearchIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={
        size === 18
          ? "absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa09a]"
          : ""
      }
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
