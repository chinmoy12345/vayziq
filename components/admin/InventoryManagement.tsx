"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, History, Package, Plus, Search, X } from "lucide-react";

type InventoryItem = {
  id: string; productId: number; variantId: number | null; name: string; category: string;
  productSku: string; sku: string; variantLabel: string; stock: number; reorderLevel: number;
  status: "active" | "draft";
};
type Movement = {
  id: number; productName: string; sku: string; variantLabel: string | null; delta: number;
  previousStock: number; newStock: number; reason: string; note: string | null;
  createdAt: string; actor: { name: string } | null; order: { orderNumber: string } | null; supplier: { name: string } | null; purchase: { purchaseNumber: string } | null;
};
type InventoryData = { data: InventoryItem[]; movements: Movement[] };
async function readInventoryResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`Inventory service returned an empty response (HTTP ${response.status}).`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const suffix = response.status >= 500 ? " Check the server logs and confirm the database schema is synced." : "";
    throw new Error(`Inventory service returned an invalid response (HTTP ${response.status}).${suffix}`);
  }
}
const reasonLabels: Record<string, string> = {
  purchase: "Supplier purchase received", restock: "Restock received", correction: "Stock correction", damage: "Damaged / unsellable", return: "Customer return",
  sale: "Order placed", cancellation: "Order cancelled", opening: "Opening stock",
};

export default function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [thresholds, setThresholds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [direction, setDirection] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("restock");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function requestInventory(searchValue: string, filterValue: string): Promise<InventoryData> {
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("search", searchValue.trim());
    if (filterValue !== "all") params.set("filter", filterValue);
    const response = await fetch(`/api/admin/inventory?${params}`, { cache: "no-store" });
    const payload = await readInventoryResponse<InventoryData & { success?: boolean; message?: string }>(response);
    if (!response.ok || !payload.success) throw new Error(payload.message || "Inventory could not be loaded.");
    return { data: payload.data, movements: payload.movements };
  }
  async function reload(searchValue = activeSearch, filterValue = filter) {
    setLoading(true); setError("");
    try {
      const result = await requestInventory(searchValue, filterValue);
      setItems(result.data); setMovements(result.movements); setActiveSearch(searchValue); setFilter(filterValue);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Inventory could not be loaded."); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    void requestInventory("", "all")
      .then(result => { if (active) { setItems(result.data); setMovements(result.movements); } })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Inventory could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => ({
    tracked: items.length,
    low: items.filter(item => item.stock > 0 && item.stock <= item.reorderLevel).length,
    out: items.filter(item => item.stock <= 0).length,
    units: items.reduce((total, item) => total + item.stock, 0),
  }), [items]);

  async function saveThreshold(item: InventoryItem) {
    const reorderLevel = Number(thresholds[item.id] ?? item.reorderLevel);
    setBusyId(item.id); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "threshold", productId: item.productId, variantId: item.variantId, reorderLevel }),
      });
      const payload = await readInventoryResponse<{ success?: boolean; message?: string }>(response);
      if (!response.ok || !payload.success) throw new Error(payload.message || "Reorder level could not be saved.");
      setMessage(`Low-stock alert level saved for ${item.name}.`);
      await reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Reorder level could not be saved."); }
    finally { setBusyId(null); }
  }

  async function adjustStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const amount = Number(quantity);
    if (!Number.isSafeInteger(amount) || amount < 1) { setError("Enter a whole number greater than zero."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selected.productId, variantId: selected.variantId, delta: direction === "add" ? amount : -amount, reason, note }),
      });
      const payload = await readInventoryResponse<{ success?: boolean; message?: string }>(response);
      if (!response.ok || !payload.success) throw new Error(payload.message || "Stock could not be adjusted.");
      setMessage(`Stock updated for ${selected.name} · ${selected.sku}.`);
      setSelected(null); setQuantity("1"); setNote("");
      await reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Stock could not be adjusted."); }
    finally { setSaving(false); }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void reload(search, filter);
  }
  function setStockFilter(value: string) {
    setFilter(value);
    void reload(activeSearch, value);
  }

  return <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a87567]">Stock control</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">Inventory Management</h1><p className="mt-2 max-w-2xl text-sm text-[#857974]">Track stock by product and size or colour variant. Checkout movements are recorded automatically.</p></div><div className="flex items-center gap-2 rounded-lg border border-[#eadfd9] bg-white px-3 py-2 text-xs text-[#766c67]"><History size={15} /> Stock movement history enabled</div></header>
    {error && <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
    {message && <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<Package size={17} />} label="Tracked stock rows" value={summary.tracked} />
      <Metric icon={<AlertTriangle size={17} />} label="Low stock" value={summary.low} tone="amber" />
      <Metric icon={<AlertTriangle size={17} />} label="Out of stock" value={summary.out} tone="rose" />
      <Metric icon={<Package size={17} />} label="Units on hand" value={summary.units} />
    </section>
    <section className="mt-6 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee6e1] px-4 py-4 sm:px-5">
        <div><h2 className="font-semibold text-[#292321]">Stock by product</h2><p className="mt-1 text-xs text-[#958b86]">Adjust stock and set the quantity that triggers a low-stock alert.</p></div>
        <form onSubmit={submitSearch} className="flex w-full gap-2 sm:w-auto"><label className="relative min-w-0 flex-1 sm:w-64"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a49a95]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or SKU" className="h-10 w-full rounded-lg border border-[#ded6d1] pl-9 pr-3 text-sm outline-none focus:border-[#b56f6f]" /></label><button className="h-10 rounded-lg bg-[#292321] px-4 text-xs font-semibold text-white">Search</button></form>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-[#eee6e1] px-4 py-3 sm:px-5">{[["all", "All stock"], ["low", "Low stock"], ["out", "Out of stock"]].map(([value, label]) => <button key={value} type="button" onClick={() => setStockFilter(value)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filter === value ? "bg-[#292321] text-white" : "border border-[#e9e1dc] text-[#716762] hover:bg-[#faf8f6]"}`}>{label}</button>)}</div>
      {loading ? <p className="p-8 text-center text-sm text-[#857974]">Loading inventory…</p> : items.length === 0 ? <div className="p-10 text-center"><Package className="mx-auto text-[#b9aca5]" /><p className="mt-3 text-sm font-medium text-[#514945]">No inventory rows found</p><p className="mt-1 text-xs text-[#958b86]">Try another search or adjust your filters.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#fcfaf9] text-[10px] uppercase tracking-[0.12em] text-[#958b86]"><tr><th className="px-5 py-3">Product / SKU</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Available</th><th className="px-4 py-3">Low-stock alert at</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#f1ebe7]">{items.map(item => <tr key={item.id} className="align-middle hover:bg-[#fdfbf9]"><td className="px-5 py-4"><p className="font-medium text-[#292321]">{item.name}</p><p className="mt-1 text-xs text-[#958b86]">{item.category} · {item.sku}{item.variantLabel ? ` · ${item.variantLabel}` : ""}</p>{item.status === "draft" && <span className="mt-1 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600">Draft product</span>}</td><td className="px-4 py-4"><StockBadge item={item} /></td><td className="px-4 py-4"><span className="font-semibold text-[#292321]">{item.stock}</span><span className="ml-1 text-xs text-[#958b86]">units</span></td><td className="px-4 py-4"><div className="flex items-center gap-2"><input type="number" min="0" max="1000000" value={thresholds[item.id] ?? item.reorderLevel} onChange={event => setThresholds(current => ({ ...current, [item.id]: event.target.value }))} className="h-9 w-20 rounded-md border border-[#ded6d1] px-2 text-sm outline-none focus:border-[#b56f6f]" /><button type="button" onClick={() => void saveThreshold(item)} disabled={busyId === item.id} className="rounded-md border border-[#e4d8d1] px-2.5 py-2 text-[11px] font-medium text-[#72574e] disabled:opacity-50">{busyId === item.id ? "Saving…" : "Save"}</button></div></td><td className="px-4 py-4 text-right"><button type="button" onClick={() => { setSelected(item); setError(""); setDirection("add"); setReason("restock"); }} className="inline-flex items-center gap-1.5 rounded-lg bg-[#292321] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#403936]"><Plus size={14} /> Adjust stock</button></td></tr>)}</tbody></table></div>}
    </section>
    <section className="mt-6 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-4 py-4 sm:px-5"><h2 className="font-semibold text-[#292321]">Recent stock movements</h2><p className="mt-1 text-xs text-[#958b86]">Sales, restocks, returns and manual corrections.</p></div>{movements.length === 0 ? <p className="p-6 text-sm text-[#958b86]">No stock movements recorded yet.</p> : <div className="max-h-[480px] overflow-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="sticky top-0 bg-[#fcfaf9] text-[10px] uppercase tracking-[0.12em] text-[#958b86]"><tr><th className="px-5 py-3">Item</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Change</th><th className="px-4 py-3">Stock after</th><th className="px-4 py-3">By / reference</th><th className="px-4 py-3">Date</th></tr></thead><tbody className="divide-y divide-[#f1ebe7]">{movements.map(move => <tr key={move.id}><td className="px-5 py-3"><p className="font-medium text-[#292321]">{move.productName}</p><p className="mt-1 text-xs text-[#958b86]">{move.sku}{move.variantLabel ? ` · ${move.variantLabel}` : ""}</p></td><td className="px-4 py-3 text-xs text-[#625954]">{reasonLabels[move.reason] || move.reason}</td><td className={`px-4 py-3 font-semibold ${move.delta > 0 ? "text-emerald-700" : "text-rose-700"}`}>{move.delta > 0 ? "+" : ""}{move.delta}</td><td className="px-4 py-3 text-[#625954]">{move.previousStock} → {move.newStock}</td><td className="px-4 py-3 text-xs text-[#857974]">{move.actor?.name || (move.order ? "Shopper checkout" : "System")}{move.order && <span className="block">#{move.order.orderNumber}</span>}{move.supplier && <span className="block">{move.supplier.name}</span>}{move.purchase && <span className="block">{move.purchase.purchaseNumber}</span>}</td><td className="whitespace-nowrap px-4 py-3 text-xs text-[#857974]">{new Date(move.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td></tr>)}</tbody></table></div>}</section>
  </div>
  {selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" onMouseDown={event => { if (event.target === event.currentTarget && !saving) setSelected(null); }}><section role="dialog" aria-modal="true" aria-labelledby="inventory-adjust-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a87567]">Stock adjustment</p><h2 id="inventory-adjust-title" className="mt-1 text-lg font-semibold text-[#292321]">{selected.name}</h2><p className="mt-1 text-xs text-[#857974]">{selected.sku}{selected.variantLabel ? ` · ${selected.variantLabel}` : ""} · current stock {selected.stock}</p></div><button type="button" aria-label="Close dialog" onClick={() => setSelected(null)} className="rounded-lg p-2 text-[#716762] hover:bg-[#f7f2ef]"><X size={18} /></button></div><form onSubmit={event => void adjustStock(event)} className="mt-5 space-y-4"><div><span className="mb-2 block text-xs font-medium text-[#514945]">Stock change</span><div className="grid grid-cols-2 gap-2">{([["add", "Add stock"], ["remove", "Remove stock"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setDirection(value)} className={`h-10 rounded-lg border text-sm font-medium ${direction === value ? "border-[#292321] bg-[#292321] text-white" : "border-[#ded6d1] text-[#625954]"}`}>{label}</button>)}</div></div><label className="block text-xs font-medium text-[#514945]">Quantity<input type="number" min="1" step="1" required value={quantity} onChange={event => setQuantity(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#ded6d1] px-3 text-sm outline-none focus:border-[#b56f6f]" /></label><label className="block text-xs font-medium text-[#514945]">Reason<select value={reason} onChange={event => setReason(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#ded6d1] px-3 text-sm outline-none focus:border-[#b56f6f]"><option value="restock">Restock received</option><option value="return">Customer return</option><option value="damage">Damaged / unsellable</option><option value="correction">Stock correction</option></select></label><label className="block text-xs font-medium text-[#514945]">Note (optional)<textarea rows={2} maxLength={500} value={note} onChange={event => setNote(event.target.value)} placeholder="Supplier, return details, or correction reason" className="mt-1.5 w-full resize-y rounded-lg border border-[#ded6d1] p-3 text-sm outline-none focus:border-[#b56f6f]" /></label><div className="flex justify-end gap-2 pt-1"><button type="button" onClick={() => setSelected(null)} disabled={saving} className="rounded-lg border border-[#ded6d1] px-4 py-2.5 text-sm text-[#625954]">Cancel</button><button disabled={saving} className="rounded-lg bg-[#292321] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save stock change"}</button></div></form></section></div>}
  </main>;
}

function Metric({ icon, label, value, tone = "default" }: { icon: React.ReactNode; label: string; value: number; tone?: "default" | "amber" | "rose" }) {
  const palette = tone === "rose" ? "bg-rose-50 text-rose-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-[#f6f0ed] text-[#8a6256]";
  return <article className="rounded-xl border border-[#eee6e1] bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs text-[#857974]">{label}</span><span className={`rounded-lg p-2 ${palette}`}>{icon}</span></div><p className="mt-3 text-2xl font-semibold text-[#292321]">{value.toLocaleString("en-IN")}</p></article>;
}
function StockBadge({ item }: { item: InventoryItem }) {
  if (item.stock <= 0) return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700">Out of stock</span>;
  if (item.stock <= item.reorderLevel) return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">Low stock</span>;
  return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">In stock</span>;
}
