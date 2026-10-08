"use client";

import { useEffect, useState } from "react";
import type { StoreMenuSettings } from "@/lib/store-menu-settings";

type MenuCategory = { id: number; name: string; slug: string };
type MenuSettings = StoreMenuSettings;

export default function StorefrontMenuControls() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [settings, setSettings] = useState<MenuSettings>({ enabled: true, home: true, watchBuy: true, shop: true, newArrivals: true, categories: true, deals: true, categoryIds: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/storefront-menu", { cache: "no-store" }).then(async response => {
      const body = await response.json() as { categories?: MenuCategory[]; settings?: MenuSettings; message?: string };
      if (!response.ok) throw new Error(body.message || "Header menu settings could not be loaded.");
      if (!active) return;
      setCategories(Array.isArray(body.categories) ? body.categories : []);
      if (body.settings) setSettings(body.settings);
    }).catch(error => {
      if (active) setMessage(error instanceof Error ? error.message : "Header menu settings could not be loaded.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function toggleCategory(id: number, checked: boolean) {
    setSettings(current => ({ ...current, categoryIds: checked ? [...new Set([...current.categoryIds, id])] : current.categoryIds.filter(categoryId => categoryId !== id) }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/storefront-menu", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const body = await response.json() as { settings?: MenuSettings; message?: string };
      if (!response.ok) throw new Error(body.message || "Header menu settings could not be saved.");
      if (body.settings) setSettings(body.settings);
      setMessage("Header menu settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Header menu settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eee6e1] px-5 py-4 sm:px-6">
      <div><h2 className="font-semibold text-[#292321]">Header menu</h2><p className="mt-1 text-xs text-[#958b86]">Choose the parent categories shown in desktop and mobile navigation.</p></div>
      <button type="button" onClick={() => void save()} disabled={loading || saving} className="inline-flex min-h-10 items-center rounded-lg bg-[#292321] px-4 text-xs font-medium text-white hover:bg-[#403936] disabled:opacity-50">{saving ? "Saving…" : "Save menu"}</button>
    </div>
    {message && <p role="status" className="mx-5 mt-4 rounded-lg border border-[#e7d3cb] bg-[#fff8f5] px-4 py-3 text-sm text-[#7d5e57] sm:mx-6">{message}</p>}
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-[#f0e9e5] px-5 py-4 sm:px-6">
      <span><span className="block text-sm font-medium text-[#292321]">Show category menu</span><span className="mt-1 block text-xs leading-5 text-[#857974]">Turn parent category links in the header menu on or off.</span></span>
      <input type="checkbox" role="switch" checked={settings.enabled} disabled={loading || saving} onChange={event => setSettings(current => ({ ...current, enabled: event.target.checked }))} className="h-5 w-9 shrink-0 cursor-pointer accent-[#9b5c5c] disabled:cursor-wait" aria-label="Show category menu" />
    </label>
    <div className="border-b border-[#f0e9e5] px-5 py-4 sm:px-6"><p className="text-sm font-medium text-[#292321]">Header links</p><p className="mt-1 text-xs leading-5 text-[#857974]">Show or hide the fixed links in desktop and mobile navigation.</p><div className="mt-3 grid gap-1 sm:grid-cols-3">{([{ key: "home", label: "Home" }, { key: "shop", label: "Catalog" }, { key: "newArrivals", label: "New Arrivals" }, { key: "categories", label: "Categories" }, { key: "deals", label: "Deals" }, { key: "watchBuy", label: "Watch & Buy" }] as const).map(item => <label key={item.key} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#514945] transition hover:bg-[#faf8f6]"><input type="checkbox" checked={settings[item.key]} disabled={saving} onChange={event => setSettings(current => ({ ...current, [item.key]: event.target.checked }))} className="h-4 w-4 accent-[#9b5c5c]" /><span>{item.label}</span></label>)}</div></div>
    <div className="px-5 py-4 sm:px-6"><p className="text-sm font-medium text-[#292321]">Parent categories</p><p className="mt-1 text-xs leading-5 text-[#857974]">Only selected active parent categories will appear. Subcategories remain nested under their parent.</p>
      {loading ? <p className="py-4 text-sm text-[#857974]">Loading categories…</p> : categories.length ? <div className="mt-3 grid gap-1 sm:grid-cols-2">{categories.map(category => <label key={category.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#514945] transition hover:bg-[#faf8f6]"><input type="checkbox" checked={settings.categoryIds.includes(category.id)} disabled={saving} onChange={event => toggleCategory(category.id, event.target.checked)} className="h-4 w-4 accent-[#9b5c5c]" /><span>{category.name}</span></label>)}</div> : <p className="py-4 text-sm text-[#857974]">No active parent categories available.</p>}
    </div>
  </section>;
}
