"use client";
import Link from "next/link";
import { offerTitle, type OfferRules } from "@/lib/product-offers";
import { useEffect, useState } from "react";
type Coupon = { rules: OfferRules | null; id: number; code: string; description: string | null; type: string; value: string; minimumOrder: string | null; maximumDiscount: string | null; active: boolean; startsAt: string | null; expiresAt: string | null; usageCount: number; usageLimit: number | null };
const money = (value: string | null) => "₹" + Number(value ?? 0).toLocaleString("en-IN");
function status(coupon: Coupon) {
  if (!coupon.active) return "Inactive";
  if (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date()) return "Expired";
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return "Exhausted";
  if (coupon.startsAt && new Date(coupon.startsAt) > new Date()) return "Scheduled";
  return "Active";
}
export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [busy, setBusy] = useState<number | null>(null);
  useEffect(() => { fetch("/api/coupons").then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.message); setCoupons(data.data); }).catch(error => setError(error.message)).finally(() => setLoading(false)); }, []);
  async function toggle(coupon: Coupon) {
    setBusy(coupon.id); setError("");
    try { const response = await fetch("/api/coupons", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: coupon.id, active: !coupon.active }) }); if (!response.ok) throw new Error("Unable to change offer status."); setCoupons(current => current.map(item => item.id === coupon.id ? { ...item, active: !item.active } : item)); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to update."); } finally { setBusy(null); }
  }
  const shown = coupons.filter(coupon => (filter === "All" || status(coupon) === filter) && (coupon.code + " " + (coupon.description || "")).toLowerCase().includes(search.toLowerCase()));
  return <main className="min-h-screen bg-[#faf8f6] p-4 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a87567]">Marketing</p><h1 className="mt-1 text-2xl font-semibold text-[#292321]">Offers &amp; coupons</h1><p className="mt-2 max-w-2xl text-sm text-[#857974]">Manage discounts across product pages, cart and checkout. Changes apply to new orders; existing orders keep their original discount.</p></div><Link href="/admin/coupons/new" className="rounded-lg bg-[#292321] px-5 py-3 text-sm text-white">Create offer</Link></div>
    <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{["Active", "Scheduled", "Expired", "Exhausted"].map(label => <div key={label} className="rounded-xl border border-[#eee6e1] bg-white p-4"><p className="text-xs text-[#857974]">{label}</p><p className="mt-2 text-2xl font-semibold">{coupons.filter(coupon => status(coupon) === label).length}</p></div>)}</div>
    <div className="mb-4 flex flex-wrap gap-3"><input aria-label="Search offers" placeholder="Search code or description" value={search} onChange={event => setSearch(event.target.value)} className="h-11 min-w-0 flex-1 rounded-lg border border-[#e1d9d5] bg-white px-3" /><select aria-label="Offer status" value={filter} onChange={event => setFilter(event.target.value)} className="h-11 rounded-lg border border-[#e1d9d5] bg-white px-3">{["All", "Active", "Scheduled", "Inactive", "Expired", "Exhausted"].map(value => <option key={value}>{value}</option>)}</select></div>
    {error && <p role="alert" className="my-4 text-sm text-red-700">{error}</p>}
    <div className="overflow-x-auto rounded-xl border border-[#eee6e1] bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f5efeb] text-xs text-[#857974]"><tr>{["Offer", "Discount", "Minimum spend", "Validity (India)", "Usage", "Status", "Actions"].map(label => <th key={label} className="p-4 font-medium">{label}</th>)}</tr></thead><tbody>{shown.map(coupon => <tr key={coupon.id} className="border-t border-[#eee6e1]"><td className="p-4"><Link href={`/admin/coupons/${coupon.id}`} className="font-semibold text-[#9b5c5c]">{coupon.code}</Link><p className="mt-1 max-w-52 text-xs text-[#857974]">{coupon.description}</p></td><td className="p-4">{offerTitle({ ...coupon, value: Number(coupon.value), minimum: Number(coupon.minimumOrder ?? 0), maximum: coupon.maximumDiscount === null ? null : Number(coupon.maximumDiscount), description: coupon.description ?? "" })}{coupon.maximumDiscount && <p className="mt-1 text-xs text-[#857974]">Up to {money(coupon.maximumDiscount)}</p>}</td><td className="p-4">{money(coupon.minimumOrder)}</td><td className="p-4 text-xs">{coupon.startsAt ? new Date(coupon.startsAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : "Immediately"}<br />to {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : "No expiry"}</td><td className="p-4">{coupon.usageCount} / {coupon.usageLimit ?? "Unlimited"}</td><td className="p-4"><span className="rounded-full bg-[#f5efeb] px-3 py-1 text-xs">{status(coupon)}</span></td><td className="p-4"><Link href={`/admin/coupons/${coupon.id}`} className="mr-3 underline">Edit</Link><button disabled={busy === coupon.id} onClick={() => void toggle(coupon)} className="min-h-10 text-[#9b5c5c] disabled:opacity-40">{coupon.active ? "Disable" : "Enable"}</button></td></tr>)}</tbody></table>{loading ? <p className="p-6 text-sm">Loading offers…</p> : !shown.length && <p className="p-6 text-sm text-[#857974]">No offers found.</p>}</div><p className="mt-4 text-xs text-[#857974]">Usage includes placed orders and pending online-payment reservations. Failed payment setup releases its reservation.</p>
  </main>;
}
