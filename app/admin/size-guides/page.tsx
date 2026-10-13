"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { emptySizeGuide, type CategorySizeGuide } from "@/lib/size-guide-data";

type Category = { id: number; name: string; parentId: number | null };
export default function CategorySizeGuidesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [requestedId, setRequestedId] = useState<number | null>(null);
  const [guide, setGuide] = useState<CategorySizeGuide>(emptySizeGuide);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const id = requestedId || Number(new URL(window.location.href).searchParams.get("categoryId"));
    void fetch(`/api/admin/size-guides${id ? `?categoryId=${id}` : ""}`, { cache: "no-store", signal: controller.signal }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Could not load size guides.");
      if (!controller.signal.aborted) { setCategories(body.categories); setCategoryId(body.categoryId); setGuide(body.guide); setDirty(false); }
    }).catch(error => { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "Could not load size guides."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [requestedId]);
  function edit(next: CategorySizeGuide) { setGuide(next); setDirty(true); setMessage(""); }
  async function save() {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/size-guides", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categoryId, guide }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Could not save size guide.");
      setGuide(body.guide); setDirty(false); setMessage(body.message);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save size guide."); }
    finally { setSaving(false); }
  }
  const selected = categories.find(category => category.id === categoryId);
  const parent = categories.find(category => category.id === selected?.parentId);
  const locked = loading || saving || categoryId === null;
  return <main className="min-h-screen bg-[#faf8f6] p-4 sm:p-8"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold text-[#292321]">Category Size Guides</h1><p className="mt-2 text-sm text-[#857974]">Enter actual measurements for each category. Products use their category guide, or a published parent-category guide. A product-specific chart image takes priority.</p></div><button disabled={locked} onClick={() => void save()} className="rounded-lg bg-[#292321] px-5 py-3 text-sm font-medium text-white disabled:opacity-40">{saving ? "Saving…" : "Save size guide"}</button></div>
    {message && <p role="status" className="mt-5 rounded-lg border bg-white p-4 text-sm">{message}</p>}
    <div className="mt-6 rounded-xl border bg-white p-5"><label htmlFor="guide-category" className="mb-2 block text-sm font-medium">Category</label><select id="guide-category" disabled={loading || saving} value={categoryId ?? ""} onChange={event => { if (dirty && !window.confirm("Discard unsaved size-guide changes?")) return; setLoading(true); setMessage(""); setRequestedId(Number(event.target.value)); }} className="w-full rounded-lg border p-3 text-sm"><option value="" disabled>Select a category</option>{categories.map(category => <option key={category.id} value={category.id}>{categories.find(item => item.id === category.parentId)?.name ? `${categories.find(item => item.id === category.parentId)?.name} / ` : ""}{category.name}</option>)}</select>{selected && <Link href={`/admin/categories/${selected.id}/edit`} className="mt-3 inline-block text-xs text-[#9b5c5c] underline">Edit category</Link>}</div>
    <fieldset disabled={locked} className="mt-5 rounded-xl border bg-white p-5 disabled:opacity-50"><div className="grid gap-4 sm:grid-cols-3"><label className="text-sm">Units<select value={guide.unit} onChange={event => edit({ ...guide, unit: event.target.value as CategorySizeGuide["unit"] })} className="mt-2 block w-full rounded-lg border p-3"><option value="in">Inches</option><option value="cm">Centimetres</option></select></label><label className="text-sm">Measurements<select value={guide.measurementType} onChange={event => edit({ ...guide, measurementType: event.target.value as CategorySizeGuide["measurementType"] })} className="mt-2 block w-full rounded-lg border p-3"><option value="body">Body measurements</option><option value="garment">Garment measurements</option></select></label><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={guide.enabled} onChange={event => edit({ ...guide, enabled: event.target.checked })} className="h-5 w-5 accent-[#9b5c5c]" />Publish this guide</label></div><p className="mt-3 text-xs text-[#857974]">{guide.enabled ? "This guide will appear on product pages after saving." : `Draft guides are hidden.${parent ? ` Products can still use the published ${parent.name} guide.` : ""}`} Choose units before entering measurements; changing units does not convert values.</p>
      <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Size</th>{guide.columns.map((column, index) => <th key={index} className="min-w-36 p-2"><input aria-label={`Measurement column ${index + 1}`} maxLength={40} value={column} onChange={event => edit({ ...guide, columns: guide.columns.map((item, i) => i === index ? event.target.value : item) })} className="w-full rounded border p-2 font-medium" /><button disabled={guide.columns.length === 1} onClick={() => edit({ ...guide, columns: guide.columns.filter((_, i) => i !== index), rows: guide.rows.map(row => ({ ...row, values: row.values.filter((_, i) => i !== index) })) })} className="mt-1 text-xs font-normal text-red-700 disabled:opacity-30">Remove column</button></th>)}<th className="p-2">Actions</th></tr></thead><tbody>{guide.rows.map((row, rowIndex) => <tr key={rowIndex} className="border-t"><td className="min-w-24 p-2"><input aria-label={`Size row ${rowIndex + 1}`} maxLength={30} value={row.size} onChange={event => edit({ ...guide, rows: guide.rows.map((item, i) => i === rowIndex ? { ...item, size: event.target.value } : item) })} className="w-full rounded border p-2" /></td>{row.values.map((value, columnIndex) => <td key={columnIndex} className="p-2"><input aria-label={`${row.size || `Row ${rowIndex + 1}`} ${guide.columns[columnIndex]}`} maxLength={40} placeholder="e.g. 38 or 38–40" value={value} onChange={event => edit({ ...guide, rows: guide.rows.map((item, i) => i === rowIndex ? { ...item, values: item.values.map((cell, j) => j === columnIndex ? event.target.value : cell) } : item) })} className="w-full rounded border p-2" /></td>)}<td className="p-2"><button disabled={guide.rows.length === 1} onClick={() => edit({ ...guide, rows: guide.rows.filter((_, i) => i !== rowIndex) })} className="text-xs text-red-700 disabled:opacity-30">Remove</button></td></tr>)}</tbody></table></div>
      <div className="mt-4 flex gap-3"><button disabled={guide.rows.length >= 30} onClick={() => edit({ ...guide, rows: [...guide.rows, { size: "", values: guide.columns.map(() => "") }] })} className="rounded-lg border px-4 py-2 text-sm">Add size</button><button disabled={guide.columns.length >= 8} onClick={() => edit({ ...guide, columns: [...guide.columns, ""], rows: guide.rows.map(row => ({ ...row, values: [...row.values, ""] })) })} className="rounded-lg border px-4 py-2 text-sm">Add measurement</button></div>
      <label className="mt-5 block text-sm">Fit notes & measuring instructions<textarea maxLength={1200} rows={3} value={guide.notes} onChange={event => edit({ ...guide, notes: event.target.value })} className="mt-2 w-full rounded-lg border p-3" placeholder="Fit, measuring method and any category-specific guidance" /></label>
    </fieldset>{dirty && <p className="mt-3 text-xs text-[#9b5c5c]">Unsaved changes</p>}
  </div></main>;
}
