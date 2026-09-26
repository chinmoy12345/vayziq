"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
type Brand = { id: string; name: string; slug: string; description: string; logo: string; active: boolean };
const emptyBrand = (): Brand => ({ id: "", name: "", slug: "", description: "", logo: "", active: true });
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export default function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [draft, setDraft] = useState<Brand>(emptyBrand());
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void fetch("/api/admin/brands", { cache: "no-store" }).then(async response => {
      const payload = await response.json() as { success?: boolean; data?: Brand[]; message?: string };
      if (!response.ok || !payload.success || !payload.data) throw new Error(payload.message || "Brand list could not be loaded.");
      if (active) setBrands(payload.data);
    }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Brand list could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  function startNew() { setDraft(emptyBrand()); setEditing(null); setError(""); setMessage(""); }
  function editBrand(brand: Brand) { setDraft({ ...brand }); setEditing(brand.id); setError(""); setMessage(""); }
  function addOrUpdate() {
    const name = draft.name.trim();
    const slug = slugify(draft.slug || name);
    if (!name || !slug) { setError("Enter a brand name to continue."); return; }
    if (brands.some(brand => brand.slug === slug && brand.id !== editing)) { setError("That brand URL slug is already in use."); return; }
    const next = { ...draft, id: editing || ("brand-" + Math.random().toString(36).slice(2)), name, slug, description: draft.description.trim(), logo: draft.logo.trim() };
    setBrands(current => editing ? current.map(brand => brand.id === editing ? next : brand) : [...current, next]);
    setDraft(next); setEditing(next.id); setError(""); setMessage("Brand updated in the list. Save changes to apply.");
  }
  function removeBrand(id: string) {
    const brand = brands.find(item => item.id === id);
    if (!brand || !window.confirm("Remove " + brand.name + " from this brand catalog? Save changes to apply.")) return;
    setBrands(current => current.filter(item => item.id !== id));
    if (editing === id) startNew();
    setMessage("Brand removed from the editor. Save changes to apply.");
  }
  async function uploadLogo(file?: File) {
    if (!file) return;
    setUploading(true); setError("");
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/admin/store-branding/upload", { method: "POST", body: form });
      const payload = await response.json() as { image?: string; message?: string };
      if (!response.ok || !payload.image) throw new Error(payload.message || "Logo upload failed.");
      setDraft(current => ({ ...current, logo: payload.image! }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Logo upload failed."); }
    finally { setUploading(false); }
  }
  async function saveAll() {
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/brands", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brands }) });
      const payload = await response.json() as { success?: boolean; data?: Brand[]; message?: string };
      if (!response.ok || !payload.success || !payload.data) throw new Error(payload.message || "Brand catalog could not be saved.");
      setBrands(payload.data); setMessage("Brand catalog saved.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Brand catalog could not be saved."); }
    finally { setSaving(false); }
  }
  return <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-6xl">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a87567]">Product catalog</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">Brand Management</h1><p className="mt-2 max-w-2xl text-sm text-[#857974]">Save brands such as Puma, Nike or your own labels for future product assignment.</p></div><button type="button" onClick={() => void saveAll()} disabled={loading || saving || uploading} className="inline-flex h-11 items-center rounded-lg bg-[#292321] px-5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button></header>
    {error && <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}{message && <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#eee6e1] px-5 py-4"><div><h2 className="font-semibold text-[#292321]">Brand catalog <span className="ml-1 text-xs font-normal text-[#958b86]">{brands.length}</span></h2><p className="mt-1 text-xs text-[#958b86]">Inactive brands stay saved and can be re-enabled later.</p></div><button type="button" onClick={startNew} className="h-9 rounded-lg border border-[#ded6d1] px-3 text-xs font-semibold">Add brand</button></div>
        {loading ? <p className="p-6 text-sm text-[#857974]">Loading brands…</p> : brands.length === 0 ? <div className="p-10 text-center"><p className="font-serif text-xl">No brands yet</p><p className="mt-2 text-sm text-[#857974]">Add Puma, Nike or another label to start the catalog.</p><button type="button" onClick={startNew} className="mt-5 rounded-lg bg-[#292321] px-4 py-2.5 text-sm text-white">Add your first brand</button></div> : <div className="divide-y divide-[#f0e9e5]">{brands.map(brand => <div key={brand.id} className="flex items-center gap-3 p-4 sm:px-5"><div className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border bg-[#fcfaf9]">{brand.logo ? <Image src={brand.logo} alt="" width={64} height={48} unoptimized className="max-h-10 w-auto max-w-full object-contain" /> : <span className="font-serif text-lg text-[#a87567]">{brand.name.slice(0, 1).toUpperCase()}</span>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{brand.name}</p><p className="truncate text-xs text-[#958b86]">/brands/{brand.slug}</p></div><span className={"rounded-full px-2 py-1 text-[10px] font-semibold " + (brand.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600")}>{brand.active ? "Active" : "Inactive"}</span><button type="button" onClick={() => editBrand(brand)} className="h-9 rounded-lg border px-3 text-xs">Edit</button><button type="button" onClick={() => removeBrand(brand.id)} aria-label={"Remove " + brand.name} className="h-9 rounded-lg border border-rose-200 px-3 text-xs text-rose-700">Remove</button></div>)}</div>}
      </section>
      <section className="rounded-xl border border-[#eee6e1] bg-white p-5 shadow-sm"><h2 className="font-semibold">{editing ? "Edit brand" : "Add a brand"}</h2><p className="mt-1 text-xs leading-5 text-[#958b86]">Keep this catalog ready to reuse in product setup.</p>
        <div className="mt-5 space-y-4"><Field label="Brand name"><input maxLength={100} value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value, ...(editing ? {} : { slug: slugify(event.target.value) }) }))} placeholder="e.g. Puma" /></Field>
        <Field label="URL slug"><input maxLength={120} value={draft.slug} onChange={event => setDraft(current => ({ ...current, slug: slugify(event.target.value) }))} placeholder="puma" /></Field>
        <Field label="Description (optional)"><textarea rows={3} maxLength={500} value={draft.description} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} /></Field>
        <Field label="Logo path (optional)"><input maxLength={500} value={draft.logo} onChange={event => setDraft(current => ({ ...current, logo: event.target.value }))} placeholder="/uploads/branding/puma.png" /></Field>
        <label className="block text-sm font-medium text-[#625954]">Upload logo<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={event => { void uploadLogo(event.target.files?.[0]); event.target.value = ""; }} className="mt-2 block w-full text-xs" /></label>
        {draft.logo && <div className="flex h-20 items-center justify-center rounded-lg border border-dashed bg-[#fcfaf9] p-3"><Image src={draft.logo} alt="Brand logo preview" width={200} height={60} unoptimized className="max-h-14 w-auto max-w-full object-contain" /></div>}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={event => setDraft(current => ({ ...current, active: event.target.checked }))} className="h-4 w-4 accent-[#9b5c5c]" />Active for future product selection</label>
        <button type="button" onClick={addOrUpdate} disabled={uploading} className="h-10 w-full rounded-lg border border-[#d8c7c0] text-sm font-semibold text-[#7d5e57]">{editing ? "Update brand in list" : "Add brand to list"}</button></div>
      </section>
    </div>
  </div></main>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[#625954]">{label}<span className="mt-1.5 block [&_input]:h-10 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-[#ded6d1] [&_input]:px-3 [&_input]:text-sm [&_input]:outline-none [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[#ded6d1] [&_textarea]:p-3 [&_textarea]:text-sm [&_textarea]:outline-none">{children}</span></label>;
}
