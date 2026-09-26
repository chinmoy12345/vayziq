
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Processing: "bg-amber-50 text-amber-700 border-amber-100",
    Pending: "bg-orange-50 text-orange-700 border-orange-100",
    Shipped: "bg-blue-50 text-blue-700 border-blue-100",
    Delivered: "bg-green-50 text-green-700 border-green-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-gray-50 text-gray-600 border-gray-100"
      }`}
    >
      {status}
    </span>
  );
}

function SalesChart({ values, labels }: { values: number[]; labels: string[] }) {
  const maxValue = Math.max(...values, 1);
  const axisMax = Math.max(100, Math.ceil(maxValue / 100) * 100);
  const points = values.map((value, index) => ({
    x: values.length === 1 ? 350 : (index / (values.length - 1)) * 700,
    y: 190 - (value / axisMax) * 170,
  }));
  const linePath = points.map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L700 210 L0 210 Z`;
  const axisLabels = [4, 3, 2, 1, 0].map((step) => {
    const value = (axisMax * step) / 4;
    return value >= 1000
      ? `₹${(value / 1000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}k`
      : `₹${Math.round(value)}`;
  });
  const labelIndexes = Array.from({ length: 7 }, (_, slot) =>
    labels.length <= 7 ? slot : Math.round((slot * (labels.length - 1)) / 6),
  );
  const markerStep = Math.max(1, Math.ceil(points.length / 7));

  return (
    <div className="relative h-56 w-full">
      <div className="absolute inset-0 flex flex-col justify-between">
        {axisLabels.map((value, index) => (
          <div key={`${value}-${index}`} className="flex items-center gap-3">
            <span className="w-8 text-right text-[10px] text-[#b0a7a2]">{value}</span>
            <div className="h-px flex-1 bg-[#f0eae6]" />
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-11 right-0 top-0">
        <svg viewBox="0 0 700 210" className="h-full w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label="Sales by day">
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a87567" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#a87567" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#salesGradient)" />
          <path d={linePath} fill="none" stroke="#a87567" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          {points.filter((_, index) => index % markerStep === 0 || index === points.length - 1).map(({ x, y }, index) => (
            <circle key={`${x}-${index}`} cx={x} cy={y} r="4" fill="white" stroke="#a87567" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>
      <div className="ml-11 mt-2 grid grid-cols-7 text-center text-[10px] text-[#aaa19c]">
        {labelIndexes.map((index, slot) => (
          <span key={`${labels[index] ?? "empty"}-${slot}`}>{labels[index] ?? ""}</span>
        ))}
      </div>
    </div>
  );
}

function indiaDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatComparison(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? "New" : "0%";
  const percentage = ((current - previous) / previous) * 100;
  return `${percentage > 0 ? "+" : ""}${percentage.toFixed(1)}%`;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!(await requireAdminPermission("dashboard", "view"))) redirect("/admin/login?reason=unauthorized");
  const params = await searchParams;
  const requestedRange = Array.isArray(params.range) ? params.range[0] : params.range;
  const rangeDays = [7, 30, 90].includes(Number(requestedRange)) ? Number(requestedRange) : 7;
  const now = new Date();
  const [year, month, day] = indiaDateKey(now).split("-").map(Number);
  const todayUtc = Date.UTC(year, month - 1, day);
  const dayMs = 24 * 60 * 60 * 1000;
  const indiaOffsetMs = 330 * 60 * 1000;
  const currentStart = new Date(todayUtc - (rangeDays - 1) * dayMs - indiaOffsetMs);
  const previousStart = new Date(currentStart.getTime() - rangeDays * dayMs);
  const nextDayStart = new Date(todayUtc + dayMs - indiaOffsetMs);
  const series = Array.from({ length: rangeDays }, (_, index) => {
    const utcDay = todayUtc - (rangeDays - 1 - index) * dayMs;
    const key = new Date(utcDay).toISOString().slice(0, 10);
    return { key, value: 0 };
  });
  const seriesByDate = new Map(series.map((point) => [point.key, point]));
  const [recentOrders, orderWindow, customerCount, productCount, inventoryProducts, topItems] = await Promise.all([
    prisma.order.findMany({ include: { user: true, items: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: previousStart, lt: nextDayStart },
        status: { not: "cancelled" },
        paymentStatus: { notIn: ["failed", "refunded"] },
      },
      select: { createdAt: true, total: true },
    }),
    prisma.user.count({ where: { roles: { none: {} } } }),
    prisma.product.count({ where: { status: "active" } }),
    prisma.product.findMany({ where: { status: "active" }, select: { stock: true, reorderLevel: true, hasVariations: true, variants: { select: { stock: true, reorderLevel: true } } } }),
    prisma.orderItem.groupBy({ by: ["productId", "productName"], _sum: { quantity: true, price: true }, orderBy: { _sum: { quantity: "desc" } }, take: 4 }),
  ]);

  const lowStockCount = inventoryProducts.reduce((count, product) => {
    const rows = product.hasVariations && product.variants.length ? product.variants : [product];
    return count + rows.filter(row => row.stock > 0 && row.stock <= row.reorderLevel).length;
  }, 0);
  const currentOrders = orderWindow.filter((order) => order.createdAt >= currentStart);
  const previousOrders = orderWindow.filter((order) => order.createdAt < currentStart);
  const currentSales = currentOrders.reduce((total, order) => total + Number(order.total), 0);
  const previousSales = previousOrders.reduce((total, order) => total + Number(order.total), 0);
  for (const order of currentOrders) {
    const point = seriesByDate.get(indiaDateKey(order.createdAt));
    if (point) point.value += Number(order.total);
  }
  const seriesLabels = series.map(({ key }) => {
    const [labelYear, labelMonth, labelDay] = key.split("-").map(Number);
    return new Date(Date.UTC(labelYear, labelMonth - 1, labelDay)).toLocaleDateString("en-IN", {
      day: "numeric",
      month: rangeDays > 7 ? "numeric" : "short",
      timeZone: "UTC",
    });
  });
  const periodLabel = rangeDays === 90 ? "last 3 months" : `last ${rangeDays} days`;
  const salesChange = formatComparison(currentSales, previousSales);
  const ordersChange = formatComparison(currentOrders.length, previousOrders.length);
  const liveStats = [
    {
      title: "Sales",
      value: `₹${currentSales.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      change: salesChange,
      period: `vs previous ${periodLabel}`,
      type: currentSales >= previousSales ? "positive" : "warning",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 6-7" /></svg>,
    },
    {
      title: "Orders",
      value: currentOrders.length.toLocaleString("en-IN"),
      change: ordersChange,
      period: `vs previous ${periodLabel}`,
      type: currentOrders.length >= previousOrders.length ? "positive" : "warning",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2h12l3 5H3l3-5Z" /><path d="M3 7h18v13H3z" /><path d="M8 11h8" /></svg>,
    },
    {
      title: "Customers",
      value: customerCount.toLocaleString("en-IN"),
      change: "All time",
      period: "registered customers",
      type: "positive",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4.2 3.4-6 8-6s7.2 1.8 8 6" /></svg>,
    },
    {
      title: "Products",
      value: productCount.toLocaleString("en-IN"),
      change: `${lowStockCount} low`,
      period: "items low in stock",
      type: lowStockCount > 0 ? "warning" : "positive",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></svg>,
    },
  ];
  const liveOrders = recentOrders.map((order) => ({
    routeId: order.id,
    id: `#${order.orderNumber}`,
    customer: order.user.name,
    items: `${order.items.length} ${order.items.length === 1 ? "Item" : "Items"}`,
    total: `₹${Number(order.total).toLocaleString("en-IN")}`,
    payment: `${order.paymentStatus.charAt(0).toUpperCase()}${order.paymentStatus.slice(1)}`,
    status: order.status.split("_").map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" "),
  }));
  const liveTopProducts = topItems.map((item) => ({ name: item.productName, category: "Collection", sold: item._sum.quantity ?? 0, revenue: `₹${Number(item._sum.price ?? 0).toLocaleString("en-IN")}` }));
  return (
    <div className="p-4 lg:p-5">
      <AdminPageHeader
        eyebrow="Operations dashboard"
        title="Store overview"
        description="Live performance, operational health, and recent customer activity."
        actions={<Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#292321] px-5 text-sm font-medium text-white transition hover:bg-[#403633]"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          Add Product
        </Link>}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {liveStats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-[#eee6e1] bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#8e8580]">
                  {stat.title}
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-[#292321]">
                  {stat.value}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eeeb] text-[#88655a]">
                {stat.icon}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs">
              <span
                className={
                  stat.type === "warning"
                    ? "font-medium text-orange-600"
                    : "font-medium text-green-600"
                }
              >
                {stat.change}
              </span>

              <span className="text-[#a39a95]">
                {stat.period}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Overview */}
      <section className="mt-6 rounded-2xl border border-[#eee6e1] bg-white p-5 lg:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-[#292321]">Sales Overview</h2>
            <p className="mt-1 text-xs text-[#958b86]">Revenue performance for the {periodLabel}</p>
          </div>
          <form action="/admin/dashboard" method="get" className="flex items-center gap-2">
            <label htmlFor="sales-range" className="sr-only">Sales date range</label>
            <select id="sales-range" name="range" defaultValue={String(rangeDays)} className="h-9 rounded-lg border border-[#e4dcd7] bg-white px-3 text-xs text-[#665b56] outline-none focus:border-[#a87567]">
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
            </select>
            <button type="submit" className="h-9 rounded-lg bg-[#292321] px-3 text-xs font-medium text-white transition hover:bg-[#403633]">Apply</button>
          </form>
        </div>

        <div className="mt-6">
          <div className="mb-3">
            <p className="text-3xl font-semibold text-[#292321]">₹{currentSales.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
            <p className={`mt-1 text-xs ${currentSales >= previousSales ? "text-green-600" : "text-rose-600"}`}>
              {salesChange} compared to previous {periodLabel}
            </p>
          </div>
          <SalesChart values={series.map(({ value }) => value)} labels={seriesLabels} />
        </div>
      </section>

      {/* Recent Orders + Top Products */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Recent Orders */}
        <section className="overflow-hidden rounded-2xl border border-[#eee6e1] bg-white">
          <div className="flex items-center justify-between border-b border-[#eee6e1] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#292321]">
                Recent Orders
              </h2>

              <p className="mt-1 text-xs text-[#958b86]">
                Latest customer orders
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-xs font-medium text-[#9b6e61] hover:text-[#765249]"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-[#f0eae6] text-left text-[10px] uppercase tracking-wider text-[#a29a95]">
                  <th className="px-5 py-3 font-medium">
                    Order
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Customer
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Total
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Payment
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {liveOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#f4efec] last:border-0"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.routeId}`}
                        className="text-sm font-medium text-[#5f4b44] hover:underline"
                      >
                        {order.id}
                      </Link>

                      <p className="mt-0.5 text-[11px] text-[#a29a95]">
                        {order.items}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#625854]">{order.customer}</td>
                    <td className="px-5 py-4 text-sm font-medium text-[#292321]">{order.total}</td>
                    <td className="px-5 py-4 text-xs text-[#716762]">{order.payment}</td>
                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Products */}
        <section className="rounded-2xl border border-[#eee6e1] bg-white">
          <div className="flex items-center justify-between border-b border-[#eee6e1] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#292321]">
                Top Products
              </h2>

              <p className="mt-1 text-xs text-[#958b86]">
                Best selling products
              </p>
            </div>

            <Link
              href="/admin/products"
              className="text-xs font-medium text-[#9b6e61] hover:text-[#765249]"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-[#f0eae6]">
            {liveTopProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-3 px-5 py-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4eeeb] text-xs font-semibold text-[#927066]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#403936]">
                    {product.name}
                  </p>

                  <p className="mt-1 text-[11px] text-[#9d938e]">
                    {product.category} · {product.sold} sold
                  </p>
                </div>

                <p className="shrink-0 text-sm font-medium text-[#292321]">
                  {product.revenue}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-[#292321]">
          Quick Actions
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 rounded-2xl border border-[#eee6e1] bg-white p-4 transition hover:border-[#d8c7c0] hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eeeb] text-xl text-[#88655a]">
              +
            </div>

            <div>
              <p className="text-sm font-medium text-[#292321]">
                Add Product
              </p>

              <p className="mt-0.5 text-xs text-[#9a908b]">
                Create new product
              </p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-2xl border border-[#eee6e1] bg-white p-4 transition hover:border-[#d8c7c0] hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eeeb] text-[#88655a]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 2h12l3 5H3l3-5Z" />
                <path d="M3 7h18v13H3z" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-medium text-[#292321]">
                Manage Orders
              </p>

              <p className="mt-0.5 text-xs text-[#9a908b]">
                View pending orders
              </p>
            </div>
          </Link>

          <Link
            href="/admin/coupons"
            className="flex items-center gap-3 rounded-2xl border border-[#eee6e1] bg-white p-4 transition hover:border-[#d8c7c0] hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eeeb] text-[#88655a]">
              %
            </div>

            <div>
              <p className="text-sm font-medium text-[#292321]">
                Create Coupon
              </p>

              <p className="mt-0.5 text-xs text-[#9a908b]">
                Offer discounts
              </p>
            </div>
          </Link>

          <Link
            href="/admin/banners"
            className="flex items-center gap-3 rounded-2xl border border-[#eee6e1] bg-white p-4 transition hover:border-[#d8c7c0] hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eeeb] text-[#88655a]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="16"
                  rx="2"
                />
                <circle cx="8.5" cy="9" r="1.5" />
                <path d="m21 15-4.5-4.5L9 18l-3-3-3 3" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-medium text-[#292321]">
                Manage Banners
              </p>

              <p className="mt-0.5 text-xs text-[#9a908b]">
                Update homepage
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

