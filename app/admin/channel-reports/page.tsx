import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";
import { indiaDay } from "@/lib/channel-attribution";

export const dynamic = "force-dynamic";

type Metric = "visitors" | "orders" | "sales";
type Daily = { day: string; channel: string; visitors: number; orders: number; sales: number };
const colors = ["#111111", "#fbb606", "#2563eb", "#16a34a", "#a855f7"];
const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function Chart({ rows, days, metric }: { rows: Daily[]; days: string[]; metric: Metric }) {
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(row.channel, (totals.get(row.channel) ?? 0) + row[metric]);
  const channels = [...totals].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);
  const max = rows.reduce((largest, row) => Math.max(largest, row[metric]), 1);
  const lookup = new Map(rows.map(row => [`${row.day}:${row.channel}`, row[metric]]));
  return <div className="overflow-x-auto">
    <div className="min-w-[580px]">
      <svg viewBox="0 0 740 250" className="w-full" role="img" aria-label={`Daily ${metric} by channel`}>
        {[0, 1, 2, 3, 4].map(step => <g key={step}><line x1="42" x2="728" y1={205 - step * 45} y2={205 - step * 45} stroke="#e8e8e8" /><text x="36" y={209 - step * 45} textAnchor="end" fontSize="10" fill="#777">{metric === "sales" ? `₹${Math.round(max * step / 4).toLocaleString("en-IN")}` : Math.round(max * step / 4)}</text></g>)}
        {channels.map((channel, index) => {
          const points = days.map((day, slot) => {
            const x = 48 + (slot / Math.max(1, days.length - 1)) * 674;
            const y = 205 - ((lookup.get(`${day}:${channel}`) ?? 0) / max) * 180;
            return `${x},${y}`;
          }).join(" ");
          return <polyline key={channel} points={points} fill="none" stroke={colors[index]} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />;
        })}
      </svg>
      <div className="ml-12 flex justify-between text-[10px] text-[#777]">{days.filter((_, index) => index === 0 || index === days.length - 1 || (days.length > 7 && index % Math.ceil(days.length / 6) === 0)).map(day => <span key={day}>{day.slice(5)}</span>)}</div>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">{channels.map((channel, index) => <span key={channel} className="flex items-center gap-2 text-xs capitalize text-[#555]"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index] }} />{channel}</span>)}</div>
    </div>
  </div>;
}

export default async function ChannelReportsPage({ searchParams }: { searchParams: Promise<{ days?: string; metric?: string }> }) {
  if (!(await requireAdminPermission("dashboard", "view"))) redirect("/admin/login?reason=unauthorized");
  const params = await searchParams;
  const range = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30;
  const metric: Metric = params.metric === "orders" || params.metric === "sales" ? params.metric : "visitors";
  const today = indiaDay(new Date());
  const todayUtc = new Date(`${today}T00:00:00.000Z`).getTime();
  const days = Array.from({ length: range }, (_, i) => new Date(todayUtc - (range - i - 1) * 86400_000).toISOString().slice(0, 10));
  const start = new Date(`${days[0]}T00:00:00.000Z`);
  const indiaStart = new Date(start.getTime() - 330 * 60_000);
  const [visits, orders] = await Promise.all([
    prisma.channelVisit.groupBy({ by: ["day", "channel"], where: { day: { gte: days[0], lte: today } }, _count: { id: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: indiaStart }, status: { not: "cancelled" }, paymentStatus: { notIn: ["failed", "refunded"] } }, select: { createdAt: true, acquisitionChannel: true, total: true } }),
  ]);
  const map = new Map<string, Daily>();
  const ensure = (day: string, channel: string) => {
    const key = `${day}:${channel}`;
    let row = map.get(key);
    if (!row) { row = { day, channel, visitors: 0, orders: 0, sales: 0 }; map.set(key, row); }
    return row;
  };
  for (const visit of visits) ensure(visit.day, visit.channel).visitors += visit._count.id;
  for (const order of orders) {
    const day = indiaDay(order.createdAt);
    if (day >= days[0] && day <= today) {
      const row = ensure(day, order.acquisitionChannel ?? "unknown");
      row.orders += 1;
      row.sales += Number(order.total);
    }
  }
  const rows = [...map.values()];
  const totals = new Map<string, { visitors: number; orders: number; sales: number }>();
  for (const row of rows) {
    const sum = totals.get(row.channel) ?? { visitors: 0, orders: 0, sales: 0 };
    sum.visitors += row.visitors; sum.orders += row.orders; sum.sales += row.sales;
    totals.set(row.channel, sum);
  }
  const channels = [...totals].sort((a, b) => b[1].sales - a[1].sales || b[1].visitors - a[1].visitors);
  const summary = channels.reduce((sum, [, value]) => ({ visitors: sum.visitors + value.visitors, orders: sum.orders + value.orders, sales: sum.sales + value.sales }), { visitors: 0, orders: 0, sales: 0 });
  return <main className="min-h-screen bg-[#faf8f6] p-4 text-[#292321] sm:p-7">
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a87567]">Marketing analytics</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Channel reports</h1><p className="mt-2 text-sm text-[#777]">Daily visitors, orders and order value by source · Asia/Kolkata time</p></div><div className="flex gap-2">{[7, 30, 90].map(value => <Link key={value} href={`/admin/channel-reports?days=${value}&metric=${metric}`} className={`rounded-lg border px-3 py-2 text-sm ${range === value ? "border-[#292321] bg-[#292321] text-white" : "border-[#ded6d1] bg-white"}`}>{value} days</Link>)}</div></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">{([ ["Visitors", summary.visitors.toLocaleString("en-IN")], ["Orders", summary.orders.toLocaleString("en-IN")], ["Sales (order value)", currency.format(summary.sales)] ] as const).map(([label, value]) => <div key={label} className="rounded-xl border border-[#eee6e1] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-[#857974]">{label}</p><p className="mt-3 text-3xl font-bold text-[#111]">{value}</p></div>)}</div>
      <section className="mt-5 rounded-xl border border-[#eee6e1] bg-white p-5 sm:p-6"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h2 className="text-lg font-semibold">Daily trend</h2><div className="flex gap-1 rounded-lg bg-[#f7f7f7] p-1">{(["visitors", "orders", "sales"] as const).map(value => <Link key={value} href={`/admin/channel-reports?days=${range}&metric=${value}`} className={`rounded-md px-3 py-2 text-xs font-semibold capitalize ${metric === value ? "bg-white text-black shadow-sm" : "text-[#777]"}`}>{value}</Link>)}</div></div>{rows.length ? <Chart rows={rows} days={days} metric={metric} /> : <p className="py-16 text-center text-sm text-[#777]">No tracked activity in this period yet. Reporting starts after the storefront is live.</p>}</section>
      <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white"><div className="border-b border-[#eee6e1] p-5"><h2 className="font-semibold">Channel breakdown</h2><p className="mt-1 text-xs text-[#777]">One visitor is counted once per day per channel. Sales is placed order value, including orders awaiting payment or COD collection; cancelled, failed and refunded orders are excluded.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><thead className="bg-[#faf8f6] text-left text-xs uppercase tracking-wide text-[#777]"><tr><th className="p-4">Channel</th><th className="p-4 text-right">Visitors</th><th className="p-4 text-right">Orders</th><th className="p-4 text-right">Sales</th></tr></thead><tbody>{channels.map(([channel, value]) => <tr key={channel} className="border-t border-[#eee6e1]"><td className="p-4 font-semibold capitalize">{channel}</td><td className="p-4 text-right">{value.visitors.toLocaleString("en-IN")}</td><td className="p-4 text-right">{value.orders.toLocaleString("en-IN")}</td><td className="p-4 text-right font-semibold">{currency.format(value.sales)}</td></tr>)}{!channels.length && <tr><td colSpan={4} className="p-8 text-center text-[#777]">No data yet</td></tr>}</tbody></table></div></section>
      <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white"><div className="border-b border-[#eee6e1] p-5"><h2 className="font-semibold">Daily channel detail</h2><p className="mt-1 text-xs text-[#777]">Exact figures behind the graph, newest day first.</p></div><div className="max-h-[440px] overflow-auto"><table className="w-full min-w-[680px] text-sm"><thead className="sticky top-0 bg-[#faf8f6] text-left text-xs uppercase tracking-wide text-[#777]"><tr><th className="p-4">Date (IST)</th><th className="p-4">Channel</th><th className="p-4 text-right">Visitors</th><th className="p-4 text-right">Orders</th><th className="p-4 text-right">Sales</th></tr></thead><tbody>{rows.sort((a, b) => b.day.localeCompare(a.day) || a.channel.localeCompare(b.channel)).map(row => <tr key={`${row.day}:${row.channel}`} className="border-t border-[#eee6e1]"><td className="p-4 tabular-nums">{row.day}</td><td className="p-4 capitalize">{row.channel}</td><td className="p-4 text-right">{row.visitors}</td><td className="p-4 text-right">{row.orders}</td><td className="p-4 text-right">{currency.format(row.sales)}</td></tr>)}{!rows.length && <tr><td colSpan={5} className="p-8 text-center text-[#777]">No data yet</td></tr>}</tbody></table></div></section>
      <p className="mt-5 text-xs leading-5 text-[#777]">Sources use UTM parameters first, then external referrer. Direct return visits retain the most recent non-direct source for order attribution for 30 days. Older orders without tracking are shown as “unknown”. Browser privacy settings and blockers may reduce visit counts.</p>
    </div>
  </main>;
}
