"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Plus, Search, Trash2 } from "lucide-react";

type Settings = { enabled: boolean; zipCodes: string[] };

export default function DeliveryZipManager() {
  const [settings, setSettings] = useState<Settings>({ enabled: false, zipCodes: [] });
  const [zipInput, setZipInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/delivery-zips", { cache: "no-store" }).then(async response => {
      const body = await response.json() as { settings?: Settings; message?: string };
      if (!response.ok) throw new Error(body.message || "Delivery ZIP settings could not be loaded.");
      if (active && body.settings) setSettings(body.settings);
    }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Delivery ZIP settings could not be loaded."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleCodes = useMemo(() => settings.zipCodes.filter(zip => zip.includes(search.trim())), [settings.zipCodes, search]);

  function addZip() {
    const zip = zipInput.replace(/\D/g, "").slice(0, 6);
    if (!/^[1-9]\d{5}$/.test(zip)) { setError("Enter a valid 6-digit Indian PIN code."); return; }
    if (settings.zipCodes.includes(zip)) { setError("This PIN code is already in your delivery list."); return; }
    setSettings(current => ({ ...current, zipCodes: [...current.zipCodes, zip].sort() }));
    setZipInput("");
    setError("");
    setMessage("");
  }

  async function save() {
    if (settings.enabled && settings.zipCodes.length === 0) { setError("Add at least one PIN code before restricting delivery."); return; }
    setSaving(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/admin/delivery-zips", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const body = await response.json() as { settings?: Settings; message?: string };
      if (!response.ok) throw new Error(body.message || "Delivery ZIP settings could not be saved.");
      if (body.settings) setSettings(body.settings);
      setMessage("Delivery ZIP settings saved.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Delivery ZIP settings could not be saved."); }
    finally { setSaving(false); }
  }

  return <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-5xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a87567]">Shipping</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">Delivery To ZIP</h1><p className="mt-2 max-w-2xl text-sm text-[#857974]">Manage the Indian PIN codes your store can deliver to.</p></div><button type="button" onClick={() => void save()} disabled={loading || saving} className="inline-flex min-h-11 items-center rounded-lg bg-[#292321] px-5 text-sm font-medium text-white hover:bg-[#403936] disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button></div>
    {message && <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}{error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
    <section className="mt-7 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6"><h2 className="font-semibold text-[#292321]">Serviceability rules</h2><p className="mt-1 text-xs text-[#958b86]">When ZIP restriction is enabled, only listed PIN codes pass product delivery checks and checkout.</p></div><label className="flex cursor-pointer items-center justify-between gap-4 px-5 py-5 sm:px-6"><span><span className="block text-sm font-medium text-[#292321]">Restrict delivery to listed PIN codes</span><span className="mt-1 block text-xs leading-5 text-[#857974]">Off: verify PINs with the postal directory as before. On: allow only the ZIP list below.</span></span><input type="checkbox" role="switch" checked={settings.enabled} disabled={loading || saving} onChange={event => { setSettings(current => ({ ...current, enabled: event.target.checked })); setMessage(""); }} className="h-5 w-9 shrink-0 cursor-pointer accent-[#9b5c5c] disabled:cursor-wait" aria-label="Restrict delivery to listed PIN codes" /></label></section>
    <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6"><div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold text-[#292321]">Serviceable PIN codes</h2><p className="mt-1 text-xs text-[#958b86]">{settings.zipCodes.length.toLocaleString("en-IN")} {settings.zipCodes.length === 1 ? "PIN code" : "PIN codes"} in your list</p></div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#f8efec] text-[#9b5c5c]"><MapPin className="h-5 w-5" /></span></div></div>
      <div className="grid gap-3 border-b border-[#eee6e1] p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6"><label className="sr-only" htmlFor="delivery-zip-input">Add Indian PIN code</label><input id="delivery-zip-input" type="text" inputMode="numeric" maxLength={6} value={zipInput} onChange={event => setZipInput(event.target.value.replace(/\D/g, "").slice(0, 6))} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addZip(); } }} placeholder="Enter 6-digit PIN code" className="h-11 min-w-0 rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a]" /><button type="button" onClick={addZip} disabled={loading || saving || zipInput.length !== 6} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#e5d7d0] px-4 text-sm font-medium text-[#72574e] hover:bg-[#faf5f2] disabled:opacity-50"><Plus className="h-4 w-4" />Add ZIP</button></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee6e1] px-5 py-4 sm:px-6"><p className="text-sm font-medium text-[#514945]">Delivery areas</p><label className="relative block"><span className="sr-only">Search PIN codes</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a49a95]" /><input value={search} onChange={event => setSearch(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Search PIN code" className="h-9 w-48 rounded-lg border border-[#e8e0dc] pl-9 pr-3 text-xs outline-none focus:border-[#a9837a]" /></label></div>
      {loading ? <p className="p-6 text-sm text-[#857974]">Loading PIN codes…</p> : visibleCodes.length ? <ul className="grid gap-2 p-5 sm:grid-cols-2 sm:p-6">{visibleCodes.map(zip => <li key={zip} className="flex items-center justify-between rounded-lg border border-[#f0e9e5] px-4 py-3"><span className="font-mono text-sm font-medium tracking-wide text-[#292321]">{zip}</span><button type="button" disabled={saving} onClick={() => { setSettings(current => ({ ...current, zipCodes: current.zipCodes.filter(code => code !== zip) })); setMessage(""); }} aria-label={`Remove ${zip}`} className="grid h-8 w-8 place-items-center rounded-full text-[#9a7770] hover:bg-red-50 hover:text-red-700 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></li>)}</ul> : <div className="px-6 py-12 text-center"><MapPin className="mx-auto h-7 w-7 text-[#b4968c]" /><p className="mt-3 text-sm font-medium text-[#514945]">{search ? "No matching PIN codes" : "No PIN codes added yet"}</p><p className="mt-1 text-xs text-[#958b86]">Add the delivery areas your store serves.</p></div>}
    </section>
  </div></main>;
}
