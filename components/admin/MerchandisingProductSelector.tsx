"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type ProductOption = { id: number; name: string; sku: string; category: { name: string }; image: string };

export default function MerchandisingProductSelector({ productId, title = "Home: You May Like", description = "Choose up to 12 products. Leave empty to use smart recommendations.", max = 12 }: { productId?: number; title?: string; description?: string; max?: number }) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const suffix = productId ? `?productId=${productId}` : "";
    void fetch(`/api/admin/merchandising-products${suffix}`, { cache: "no-store" }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Products could not be loaded.");
      setProducts(body.products ?? []); setSelected(body.ids ?? []);
    }).catch(error => setMessage(error instanceof Error ? error.message : "Products could not be loaded."));
  }, [productId]);

  const shown = useMemo(() => products.filter(product => `${product.name} ${product.sku} ${product.category.name}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const toggle = (id: number) => setSelected(current => current.includes(id) ? current.filter(value => value !== id) : current.length < max ? [...current, id] : current);
  const save = async () => {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/merchandising-products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, ids: selected }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Selection could not be saved.");
      setSelected(body.ids ?? []); setMessage("Product selection saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Selection could not be saved."); }
    finally { setSaving(false); }
  };

  return <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eee6e1] px-5 py-4"><div><h2 className="font-semibold text-[#292321]">{title}</h2><p className="mt-1 text-xs text-[#857974]">{description}</p></div><button type="button" onClick={() => void save()} disabled={saving} className="rounded-lg bg-[#292321] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save selection"}</button></div>
    <div className="p-5"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, SKU or category" className="h-10 w-full rounded-lg border border-[#ddd4cf] px-3 text-sm outline-none focus:border-[#b56f6f]" />
      <p className="mt-3 text-xs text-[#857974]">{selected.length} of {max} selected · selected order controls display priority</p>
      <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">{shown.map(product => <label key={product.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2 ${selected.includes(product.id) ? "border-[#b56f6f] bg-[#fff8f5]" : "border-[#eee6e1]"}`}><input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggle(product.id)} /><span className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-[#f5f3f0]"><Image src={product.image} alt="" fill sizes="40px" className="object-cover" /></span><span className="min-w-0"><b className="block truncate text-xs text-[#292321]">{product.name}</b><small className="block truncate text-[10px] text-[#857974]">{product.category.name} · {product.sku}</small></span></label>)}</div>
      {message && <p role="status" className="mt-3 text-xs text-[#7d5e57]">{message}</p>}
    </div>
  </section>;
}
