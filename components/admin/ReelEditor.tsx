"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { StoreReel } from "@/lib/reels";

type Product = { id: number; name: string; image: string };
type MediaKind = "video" | "poster";
const fieldClass = "mt-1 h-11 w-full rounded-lg border border-[#ddd4cf] bg-white px-3 text-sm outline-none focus:border-[#fbb606]";

function newReel(order: number): StoreReel {
  return { id: crypto.randomUUID(), title: "", videoUrl: "", poster: "", badge: "None", productId: null, cta: "Shop Now", description: "", enabled: true, sortOrder: order };
}

export default function ReelEditor({ reelId }: { reelId: string }) {
  const [rows, setRows] = useState<StoreReel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reel, setReel] = useState<StoreReel | null>(null);
  const [uploading, setUploading] = useState<MediaKind | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/reels", { cache: "no-store" })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.message || "Could not load reels."); return data as { reels: StoreReel[]; products: Product[] }; })
      .then(data => { if (!active) return; setRows(data.reels); setProducts(data.products); setReel(reelId === "new" ? newReel(data.reels.length + 1) : data.reels.find(row => row.id === reelId) ?? null); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Could not load reel."); });
    return () => { active = false; };
  }, [reelId]);

  function patch(changes: Partial<StoreReel>) {
    setReel(current => current ? { ...current, ...changes } : current);
  }

  async function upload(kind: MediaKind, file?: File) {
    if (!file) return;
    const allowed = kind === "video" ? ["video/mp4", "video/webm"] : ["image/jpeg", "image/png", "image/webp"];
    const max = kind === "video" ? 30 * 1024 * 1024 : 5 * 1024 * 1024;
    if (!allowed.includes(file.type) || file.size === 0 || file.size > max) { setError(kind === "video" ? "Choose an MP4 or WebM video up to 30 MB." : "Choose a JPG, PNG or WebP poster up to 5 MB."); return; }
    setUploading(kind); setError(""); setMessage("");
    try {
      const form = new FormData(); form.set("kind", kind); form.set("file", file);
      const response = await fetch("/api/admin/reels/media", { method: "POST", body: form });
      const data = await response.json() as { url?: string; message?: string };
      if (!response.ok || !data.url) throw new Error(data.message || "Upload failed.");
      patch(kind === "video" ? { videoUrl: data.url } : { poster: data.url });
      setMessage(`${kind === "video" ? "Video" : "Poster"} uploaded. Save the reel to publish it.`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Upload failed."); }
    finally { setUploading(null); }
  }

  async function save() {
    if (!reel || saving || uploading) return;
    if (!reel.title.trim() || !reel.videoUrl.trim()) { setError("Enter a reel title and upload or link a video."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      const next = rows.some(row => row.id === reel.id) ? rows.map(row => row.id === reel.id ? reel : row) : [...rows, reel];
      const response = await fetch("/api/admin/reels", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reels: next }) });
      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error(data.message || "Could not save reel.");
      setRows(next);
      setMessage("Reel saved successfully.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save reel."); }
    finally { setSaving(false); }
  }

  if (!reel) return <main className="p-8 text-sm text-[#655b56]">{error || "Loading reel…"}</main>;
  const product = products.find(item => item.id === reel.productId);
  const poster = reel.poster || product?.image || "";
  const directVideo = /^\/api\/reel-media\/|^https:\/\/[^\s]+\.(mp4|webm)(?:\?|$)/i.test(reel.videoUrl);

  return <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] p-4 sm:p-6 lg:p-8">
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <section className="rounded-xl border border-[#eee6e1] bg-white shadow-sm">
        <header className="border-b border-[#eee6e1] px-5 py-4"><Link href="/admin/reels" className="text-xs text-[#8b746a]">← Reel Manager</Link><h1 className="mt-2 text-xl font-semibold text-[#292321]">{reelId === "new" ? "Add Reel" : "Edit Reel"}</h1><p className="mt-1 text-xs text-[#857974]">Upload a vertical video, choose its cover, and link a product.</p></header>
        <div className="space-y-5 p-5">
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
          <label className="block text-sm font-medium text-[#403936]">Reel title *<input className={fieldClass} maxLength={120} value={reel.title} onChange={event => patch({ title: event.target.value })} /></label>
          <div className="rounded-xl border border-[#eee6e1] p-4"><p className="text-sm font-semibold text-[#292321]">Video *</p><p className="mt-1 text-xs text-[#857974]">MP4 or WebM, up to 30 MB. A vertical 9:16 video works best.</p><input type="file" accept="video/mp4,video/webm,.mp4,.webm" disabled={Boolean(uploading)} onChange={event => { void upload("video", event.target.files?.[0]); event.target.value = ""; }} className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#fbb606] file:px-4 file:py-2 file:font-semibold file:text-[#111]" /><label className="mt-4 block text-xs text-[#655b56]">Or use an existing HTTPS video URL<input className={fieldClass} value={reel.videoUrl} onChange={event => patch({ videoUrl: event.target.value })} placeholder="https://…/reel.mp4 or YouTube Shorts URL" /></label>{uploading === "video" && <p className="mt-2 text-xs text-[#857974]">Uploading video…</p>}</div>
          <div className="rounded-xl border border-[#eee6e1] p-4"><p className="text-sm font-semibold text-[#292321]">Cover image</p><p className="mt-1 text-xs text-[#857974]">JPG, PNG or WebP, up to 5 MB. Recommended 9:16.</p><input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" disabled={Boolean(uploading)} onChange={event => { void upload("poster", event.target.files?.[0]); event.target.value = ""; }} className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#fbb606] file:px-4 file:py-2 file:font-semibold file:text-[#111]" />{uploading === "poster" && <p className="mt-2 text-xs text-[#857974]">Uploading cover…</p>}</div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-[#403936]">Linked product<select className={fieldClass} value={reel.productId ?? ""} onChange={event => patch({ productId: event.target.value ? Number(event.target.value) : null })}><option value="">No product selected</option>{products.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><small className="mt-1 block font-normal text-[#857974]">Select a product to show the reel in Watch & Buy.</small></label><label className="text-sm font-medium text-[#403936]">Badge<select className={fieldClass} value={reel.badge} onChange={event => patch({ badge: event.target.value as StoreReel["badge"] })}>{["None", "Trending", "New", "Bestseller", "Must Have"].map(value => <option key={value}>{value}</option>)}</select></label></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-[#403936]">CTA text<input className={fieldClass} value={reel.cta} maxLength={50} onChange={event => patch({ cta: event.target.value })} /></label><label className="text-sm font-medium text-[#403936]">Sort order<input type="number" className={fieldClass} min={1} value={reel.sortOrder} onChange={event => patch({ sortOrder: Number(event.target.value) })} /></label></div>
          <label className="block text-sm font-medium text-[#403936]">Short description<textarea className="mt-1 min-h-24 w-full rounded-lg border border-[#ddd4cf] p-3 text-sm" value={reel.description} onChange={event => patch({ description: event.target.value })} /></label>
          <label className="flex items-center gap-2 text-sm font-medium text-[#403936]"><input type="checkbox" checked={reel.enabled} onChange={event => patch({ enabled: event.target.checked })} />Enabled</label>
        </div>
        <footer className="flex items-center gap-4 border-t border-[#eee6e1] px-5 py-4"><button type="button" onClick={() => void save()} disabled={saving || Boolean(uploading)} className="rounded-lg bg-[#292321] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save Reel"}</button><Link href="/admin/reels" className="text-sm text-[#655b56]">Cancel</Link></footer>
      </section>
      <aside className="lg:sticky lg:top-24 lg:self-start"><p className="mb-2 text-xs font-semibold text-[#403936]">PREVIEW</p><div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-[#111] shadow-lg">{directVideo ? <video key={reel.videoUrl} src={reel.videoUrl} poster={poster} controls playsInline preload="metadata" className="h-full w-full object-cover" /> : poster ? <Image src={poster} alt="Reel cover preview" fill unoptimized sizes="260px" className="object-cover" /> : <div className="grid h-full place-items-center text-xs text-white/60">Upload video to preview</div>}<div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white"><b className="block text-sm">{reel.title || "Reel title"}</b>{product && <small>{product.name}</small>}</div></div></aside>
    </div>
  </main>;
}
