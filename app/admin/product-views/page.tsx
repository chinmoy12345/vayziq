"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Report = { products: { id: number; name: string; slug: string; status: string; totalViews: number; activeViewers: number }[]; total: number; page: number; pageSize: number; updatedAt: string };

export default function ProductViewsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let disposed = false;
    let pending = false;
    const controller = new AbortController();
    async function refresh() {
      if (pending || disposed || document.visibilityState !== "visible") return;
      pending = true;
      try {
        const response = await fetch(`/api/admin/product-views?page=${page}&q=${encodeURIComponent(search)}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 401 ? "You do not have permission to view this report." : "Could not load product views.");
        const data = await response.json() as Report;
        if (!disposed) { setReport(data); setError(""); }
      } catch (err) { if (!disposed) setError(err instanceof Error ? err.message : "Could not load product views."); }
      finally { pending = false; }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 20_000);
    const onVisibility = () => void refresh();
    document.addEventListener("visibilitychange", onVisibility);
    return () => { disposed = true; controller.abort(); window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisibility); };
  }, [page, search]);
  const current = report?.page === page ? report : null;
  return <main className="min-h-screen bg-[#faf8f6] p-4 sm:p-8"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold text-[#292321]">Product Views</h1><p className="mt-2 text-sm text-[#857974]">Total page visits since tracking began. Currently viewing counts unique browsers active in the last 60 seconds, including the shopper viewing the page.</p></div><Link href="/admin/homepage" className="rounded-lg border bg-white px-4 py-2 text-sm">Storefront controls</Link></div>
    <form className="my-6 flex gap-2" onSubmit={event => { event.preventDefault(); if (page !== 1 || search !== query.trim()) setReport(null); setPage(1); setSearch(query.trim()); }}><input aria-label="Search product views" placeholder="Search products…" value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 rounded-lg border bg-white px-4 py-2 text-sm" /><button type="submit" className="rounded-lg bg-[#292321] px-5 py-2 text-sm text-white">Search</button></form>
    {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-[#f6f2ee]"><tr><th className="p-4">Product</th><th className="p-4">Status</th><th className="p-4 text-right">Total views</th><th className="p-4 text-right">Currently viewing</th></tr></thead><tbody>{current ? current.products.map(product => <tr key={product.id} className="border-t"><td className="p-4"><Link href={`/admin/products/${product.id}/edit`} className="font-medium text-[#292321] hover:underline">{product.name}</Link><span className="mt-1 block text-xs text-[#857974]">#{product.id}</span></td><td className="p-4 capitalize">{product.status}</td><td className="p-4 text-right tabular-nums">{product.totalViews.toLocaleString()}</td><td className="p-4 text-right font-semibold tabular-nums text-[#20813c]">{product.activeViewers.toLocaleString()}</td></tr>) : <tr><td colSpan={4} className="p-6 text-center text-[#857974]">{error ? "Report unavailable" : "Loading views…"}</td></tr>}{current?.products.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-[#857974]">No products found.</td></tr>}</tbody></table></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#857974]"><span>{current ? `Updated ${new Date(current.updatedAt).toLocaleTimeString()} · Refreshes every 20 seconds` : ""}{error && report ? " · Last available data shown" : ""}</span><div className="flex items-center gap-3"><button disabled={page === 1} onClick={() => { setReport(null); setPage(value => value - 1); }} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Previous</button><span>Page {page}</span><button disabled={!current || page * current.pageSize >= current.total} onClick={() => { setReport(null); setPage(value => value + 1); }} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Next</button></div></div>
  </div></main>;
}
